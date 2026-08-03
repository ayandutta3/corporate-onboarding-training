from fastapi import APIRouter, Depends, HTTPException, Query, Response, Request
from fastapi.responses import FileResponse, StreamingResponse
from app.authentication.dependencies import get_current_user, RequireRole
from app.authentication.models import UserInDB, Role
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repository.database import get_database
from app.ingestion.repository import DocumentRepository, DocumentChunkRepository
from app.ingestion.models import DocumentModel
from app.vector.repository import VectorRepository
from typing import Optional
from pydantic import BaseModel
import os
import mimetypes

router = APIRouter(prefix="/documents", tags=["Documents"])

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    division: Optional[str] = None
from fastapi import APIRouter, Depends, HTTPException, Query, Response, Request
from fastapi.responses import FileResponse, StreamingResponse
from app.authentication.dependencies import get_current_user, RequireRole
from app.authentication.models import UserInDB, Role
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repository.database import get_database
from app.ingestion.repository import DocumentRepository, DocumentChunkRepository
from app.ingestion.models import DocumentModel
from app.vector.repository import VectorRepository
from typing import Optional
from pydantic import BaseModel
import os
import mimetypes

router = APIRouter(prefix="/documents", tags=["Documents"])

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    division: Optional[str] = None
    businessLine: Optional[str] = None
    department: Optional[str] = None
    knowledge_type: Optional[str] = None

@router.get("", summary="List all documents with filters and pagination")
async def get_documents(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    division: Optional[str] = None,
    businessLine: Optional[str] = None,
    version: Optional[int] = None,
    uploaded_by: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    repo = DocumentRepository(db)
    query = {}
    
    if current_user.role != Role.ADMIN:
        division_or_clauses = [
            {"division": "Corporate"},
            {"division": "BusinessLine"}
        ]
        if current_user.businessLine:
            division_or_clauses.append({"businessLine": current_user.businessLine})
            division_or_clauses.append({"department": current_user.businessLine})
        query["$or"] = division_or_clauses
        
    # Apply filters
    if division: 
        if "$and" not in query:
            query["$and"] = []
        query["$and"].append({"division": division})
        
    if businessLine:
        if "$and" not in query:
            query["$and"] = []
        query["$and"].append({"businessLine": businessLine})
    if version: query["version"] = version
    if uploaded_by: query["uploaded_by"] = uploaded_by
    if status: query["status"] = status
    
    # Search functionality
    if search:
        search_regex = {"$regex": search, "$options": "i"}
        search_or_clause = {"$or": [
            {"filename": search_regex},
            {"title": search_regex},
            {"ai_tags": search_regex},
            {"division": search_regex},
            {"businessLine": search_regex},
            {"department": search_regex},
            {"uploaded_by": search_regex}
        ]}
        if "$and" not in query:
            query["$and"] = []
        query["$and"].append(search_or_clause)
        
    # Get total count and paginated items
    total_count = await repo.collection.count_documents(query)
    cursor = repo.collection.find(query).sort("created_at", -1).skip((page - 1) * size).limit(size)
    
    documents = []
    async for doc in cursor:
        doc_model = DocumentModel(**doc)
        documents.append(doc_model.model_dump(by_alias=True))
        
    return {
        "items": documents,
        "total": total_count,
        "page": page,
        "size": size,
        "pages": (total_count + size - 1) // size
    }

@router.get("/{document_id}", summary="Get specific document metadata")
async def get_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    repo = DocumentRepository(db)
    doc = await repo.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if current_user.role != Role.ADMIN:
        if doc.division == "BusinessLine":
            if current_user.businessLine and doc.businessLine and current_user.businessLine != doc.businessLine:
                raise HTTPException(status_code=403, detail="Not authorized to access this document")
                
    return doc.model_dump(by_alias=True)

def _get_file_mime_type(file_path: str):
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"
    return mime_type

@router.get("/{document_id}/preview", summary="Preview document inline")
async def preview_document(
    document_id: str,
    request: Request,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    repo = DocumentRepository(db)
    doc = await repo.get(document_id)
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    # RBAC Validation
    if current_user.role != Role.ADMIN:
        if doc.access_roles and len(doc.access_roles) > 0 and current_user.role.value not in doc.access_roles:
            raise HTTPException(status_code=403, detail="Not authorized to access this document")
        if doc.division == "BusinessLine":
            if current_user.division != "BusinessLine" or current_user.businessLine != doc.businessLine:
                raise HTTPException(status_code=403, detail="Not authorized to access this document")
            
    mime_type = _get_file_mime_type(doc.file_path)
    
    # For video/audio streaming, support range requests
    file_size = os.path.getsize(doc.file_path)
    range_header = request.headers.get("Range")
    
    if range_header:
        byte_range = range_header.strip().lower().replace("bytes=", "").split("-")
        start = int(byte_range[0])
        end = int(byte_range[1]) if len(byte_range) > 1 and byte_range[1] else file_size - 1
        
        chunk_size = end - start + 1
        
        def file_iterator():
            with open(doc.file_path, "rb") as f:
                f.seek(start)
                yield f.read(chunk_size)
                
        headers = {
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Accept-Ranges": "bytes",
            "Content-Length": str(chunk_size),
            "Content-Type": mime_type,
        }
        return StreamingResponse(file_iterator(), status_code=206, headers=headers)
    
    return FileResponse(doc.file_path, media_type=mime_type, filename=doc.filename, content_disposition_type="inline")

@router.get("/by-name/{filename}/preview", summary="Preview document by filename")
async def preview_document_by_name(
    filename: str,
    request: Request,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    repo = DocumentRepository(db)
    cursor = repo.collection.find({"$or": [{"filename": filename}, {"title": filename}]})
    doc_data = await cursor.to_list(length=1)
    if doc_data:
        doc = DocumentModel(**doc_data[0])
        if os.path.exists(doc.file_path):
            mime_type = _get_file_mime_type(doc.file_path)
            return FileResponse(doc.file_path, media_type=mime_type, filename=doc.filename, content_disposition_type="inline")
    
    uploads_dir = os.path.join(os.getcwd(), "uploads")
    fallback_path = os.path.join(uploads_dir, filename)
    if os.path.exists(fallback_path):
        mime_type = _get_file_mime_type(fallback_path)
        return FileResponse(fallback_path, media_type=mime_type, filename=filename, content_disposition_type="inline")
        
    raise HTTPException(status_code=404, detail=f"File {filename} not found")

@router.get("/{document_id}/download", summary="Download document")
async def download_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    repo = DocumentRepository(db)
    doc = await repo.get(document_id)
    if not doc or not os.path.exists(doc.file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    if current_user.role != Role.ADMIN:
        if doc.division == "BusinessLine":
            if current_user.division != "BusinessLine" or current_user.businessLine != doc.businessLine:
                raise HTTPException(status_code=403, detail="Not authorized to access this document")
        
    mime_type = _get_file_mime_type(doc.file_path)
    return FileResponse(doc.file_path, media_type=mime_type, filename=doc.filename, content_disposition_type="attachment")

@router.delete("/{document_id}", summary="Delete document", dependencies=[Depends(RequireRole([Role.ADMIN]))])
async def delete_document(
    document_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    doc_repo = DocumentRepository(db)
    chunk_repo = DocumentChunkRepository(db)
    vector_repo = VectorRepository()
    
    doc = await doc_repo.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Remove from Vector DB
    try:
        results = vector_repo.collection.get(where={"document_id": document_id})
        if results and results.get("ids"):
            vector_repo.collection.delete(ids=results["ids"])
    except Exception as e:
        print(f"Failed to delete vectors for {document_id}: {e}")
        
    # Remove chunks from Mongo
    await chunk_repo.collection.delete_many({"document_id": document_id})
    
    # Remove Document from Mongo
    await doc_repo.delete(document_id)
    
    # Remove file from filesystem
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception as e:
            print(f"Failed to delete file {doc.file_path}: {e}")
            
    return {"message": "Document deleted successfully"}

@router.patch("/{document_id}", summary="Update document metadata", dependencies=[Depends(RequireRole([Role.ADMIN]))])
async def update_document(
    document_id: str,
    update_data: DocumentUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    repo = DocumentRepository(db)
    doc = await repo.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if update_data.title is not None: doc.title = update_data.title
    if update_data.division is not None: doc.division = update_data.division
    if update_data.businessLine is not None: doc.businessLine = update_data.businessLine
        
    await repo.update(doc)
    return doc.model_dump(by_alias=True)
