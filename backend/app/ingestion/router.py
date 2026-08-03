from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException, status
from app.authentication.dependencies import get_current_user, RequireRole
from app.authentication.models import UserInDB, Role
from app.ingestion.service import IngestionService
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repository.database import get_database
from typing import Optional
import os

router = APIRouter(prefix="/upload", tags=["Ingestion"])

SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'png', 'jpg', 'jpeg', 'mp4', 'avi', 'mov', 'm4v', 'mkv', 'mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac', 'txt']
AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'aac']
MAX_AUDIO_SIZE_BYTES = 25 * 1024 * 1024 # 25MB

def validate_file(file: UploadFile):
    ext = file.filename.split('.')[-1].lower()
    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file extension: {ext}")
    if ext in AUDIO_EXTENSIONS:
        if file.size and file.size > MAX_AUDIO_SIZE_BYTES:
            raise HTTPException(status_code=400, detail="Audio file exceeds 25MB limit for transcription.")

@router.post("/vector", summary="Upload Vector Document", description="Process and chunk a document, generate embeddings, and store in ChromaDB.", dependencies=[Depends(RequireRole([Role.ADMIN, Role.HR, Role.FINANCE_MANAGER, Role.TECHNICAL_MANAGER]))])
async def upload_vector(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    division: Optional[str] = Form(None),
    businessLine: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    autofill_tags: Optional[bool] = Form(True),
    version: Optional[int] = Form(1),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    validate_file(file)
    service = IngestionService(db)
    doc = await service.process_upload(file, current_user, "vector", title=title, description=description, version=version, requested_department=department, requested_division=division, requested_businessLine=businessLine, user_tags_str=tags, autofill_tags=autofill_tags)
    return {"message": "File processed via Vector pipeline", "document_id": doc.id}

@router.post("/hybrid", summary="Upload Hybrid Document", description="Process and extract text from a document without generating embeddings immediately.", dependencies=[Depends(RequireRole([Role.ADMIN, Role.HR, Role.FINANCE_MANAGER, Role.TECHNICAL_MANAGER]))])
async def upload_hybrid(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    division: Optional[str] = Form(None),
    businessLine: Optional[str] = Form(None),
    tags: Optional[str] = Form(None),
    autofill_tags: Optional[bool] = Form(True),
    version: Optional[int] = Form(1),
    override_summary: Optional[str] = Form(None),
    override_tags: Optional[str] = Form(None),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    validate_file(file)
    service = IngestionService(db)
    override_tags_list = None
    if override_tags is not None:
        override_tags_list = [t.strip() for t in override_tags.split(',') if t.strip()]
    doc = await service.process_upload(
        file, current_user, "hybrid", title=title, description=description, version=version,
        requested_department=department, requested_division=division, requested_businessLine=businessLine, user_tags_str=tags, autofill_tags=autofill_tags,
        override_summary=override_summary, override_tags=override_tags_list
    )
    return {"message": "File processed via Hybrid pipeline", "document_id": doc.id}


@router.post("/analyze", summary="Analyze Document", description="Process document, extract text, and return AI-generated summary and tags.", dependencies=[Depends(RequireRole([Role.ADMIN, Role.HR, Role.FINANCE_MANAGER, Role.TECHNICAL_MANAGER]))])
async def analyze_document(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    validate_file(file)
    service = IngestionService(db)
    result = await service.analyze_file(file)
    return result

