import os
from fastapi import UploadFile
from app.ingestion.repository import DocumentRepository, DocumentChunkRepository
from app.authentication.models import UserInDB, Role
from app.ingestion.models import DocumentModel
from app.ingestion.pipeline_common import save_upload_file, extract_text_from_file, generate_ai_summary_and_tags
from app.vector.service import VectorService
from app.vector.repository import VectorRepository
from app.vector.embedding import EmbeddingService
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid

class IngestionService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.doc_repo = DocumentRepository(db)
        self.chunk_repo = DocumentChunkRepository(db)
        vector_repo = VectorRepository()
        embedding_service = EmbeddingService()
        self.vector_service = VectorService(self.chunk_repo, vector_repo, embedding_service)
        
    def _determine_metadata_from_role(self, role: Role):
        if role == Role.ADMIN:
            return "Management", "Policies"
        elif role == Role.HR:
            return "HR", "Policies"
        elif role == Role.FINANCE_MANAGER:
            return "Finance", "Financials"
        elif role == Role.TECHNICAL_MANAGER:
            return "Engineering", "Technical"
        return "General", "General"

    async def process_upload(self, file: UploadFile, user: UserInDB, pipeline_type: str, title: str = None, description: str = None, version: int = 1, requested_department: str = None, user_tags_str: str = None, autofill_tags: bool = True):
        department, knowledge_type = self._determine_metadata_from_role(user.role)
        
        if user.role == Role.ADMIN and requested_department:
            department = requested_department
        
        # 1. Save Original File
        file_id = str(uuid.uuid4())
        safe_filename = f"{file_id}_{file.filename}"
        dest_path = f"uploads/{safe_filename}"
        await save_upload_file(file, dest_path)
        
        # 2. Extract Text (OCR/Whisper if needed)
        extracted_text = await extract_text_from_file(dest_path, file.filename)
        
        # Append description to the text if available for better vector context
        if description:
            extracted_text = f"Title: {title or file.filename}\nDescription: {description}\n\n{extracted_text}"
            
        # 3. AI Summary & Tags
        summary, generated_tags = await generate_ai_summary_and_tags(extracted_text)
        
        # 4. Handle Tags based on autofill_tags flag
        final_tags = generated_tags or []
        if not autofill_tags and user_tags_str:
            custom_tags = [t.strip() for t in user_tags_str.split(',') if t.strip()]
            # Append user custom tags to generated tags
            final_tags = list(dict.fromkeys(final_tags + custom_tags))
        
        # 5. Create Document Model
        doc = DocumentModel(
            filename=file.filename,
            file_path=dest_path,
            uploaded_by=user.email,
            department=department,
            knowledge_type=knowledge_type,
            title=title,
            description=description,
            extracted_text=extracted_text,
            ai_summary=summary,
            ai_tags=final_tags,
            embedding_generated=False,
            version=version
        )

        
        # 5. Pipeline Specific Logic
        if pipeline_type == "vector":
            await self.vector_service.process_document(doc)
            doc.embedding_generated = True
        elif pipeline_type == "hybrid":
            # Hybrid only stores metadata and text in MongoDB (OpenSearch was removed)
            pass
            
        # 6. Save Metadata to MongoDB
        saved_doc = await self.doc_repo.create(doc)
        return saved_doc
