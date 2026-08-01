from fastapi import APIRouter, UploadFile, File, Depends
from app.authentication.dependencies import get_current_user, RequireRole
from app.authentication.models import UserInDB, Role
from app.ingestion.service import IngestionService
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.repository.database import get_database
import os

router = APIRouter(prefix="/upload", tags=["Ingestion"])

@router.post("/vector", summary="Upload Vector Document", description="Process and chunk a document, generate embeddings, and store in ChromaDB.", dependencies=[Depends(RequireRole([Role.ADMIN, Role.HR, Role.FINANCE_MANAGER, Role.TECHNICAL_MANAGER]))])
async def upload_vector(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = IngestionService(db)
    doc = await service.process_upload(file, current_user, "vector")
    return {"message": "File processed via Vector pipeline", "document_id": doc.id}

@router.post("/hybrid", summary="Upload Hybrid Document", description="Process and extract text from a document without generating embeddings immediately.", dependencies=[Depends(RequireRole([Role.ADMIN, Role.HR, Role.FINANCE_MANAGER, Role.TECHNICAL_MANAGER]))])
async def upload_hybrid(
    file: UploadFile = File(...),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    service = IngestionService(db)
    doc = await service.process_upload(file, current_user, "hybrid")
    return {"message": "File processed via Hybrid pipeline", "document_id": doc.id}
