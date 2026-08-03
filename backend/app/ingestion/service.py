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
            return "Management"
        elif role == Role.HR:
            return "HR"
        elif role == Role.FINANCE_MANAGER:
            return "Finance"
        elif role == Role.TECHNICAL_MANAGER:
            return "Engineering"
        return "General"

    async def process_upload(self, file: UploadFile, user: UserInDB, pipeline_type: str, title: str = None, description: str = None, version: int = 1, requested_department: str = None, requested_division: str = None, requested_businessLine: str = None, user_tags_str: str = None, autofill_tags: bool = True, override_summary: str = None, override_tags: list[str] = None):
        department = self._determine_metadata_from_role(user.role)
        division = user.division or "Corporate"
        businessLine = user.businessLine
        
        if requested_businessLine:
            businessLine = requested_businessLine
            department = requested_businessLine
        elif requested_department:
            department = requested_department

        if user.role == Role.ADMIN:
            if requested_department:
                department = requested_department
            if requested_division:
                division = requested_division
            if requested_businessLine:
                businessLine = requested_businessLine
                department = requested_businessLine

        if division == "Corporate":
            businessLine = None
        
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
            
        # 3. AI Summary & Tags (Use override if provided by UI confirm step)
        if override_summary is not None:
            summary = override_summary
            generated_tags = override_tags or []
        else:
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
            division=division,
            businessLine=businessLine,
            title=title or file.filename,
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

    async def analyze_file(self, file: UploadFile):
        # 1. Save Original File temporarily
        file_id = str(uuid.uuid4())
        safe_filename = f"temp_{file_id}_{file.filename}"
        dest_path = f"uploads/{safe_filename}"
        await save_upload_file(file, dest_path)
        
        saved_size = os.path.getsize(dest_path) if os.path.exists(dest_path) else 0
        print(f"ANALYZE: Saved temp file to {dest_path}, size: {saved_size} bytes")
        
        try:
            # 2. Extract Text
            extracted_text = await extract_text_from_file(dest_path, file.filename)
            print(f"ANALYZE: Extracted text length: {len(extracted_text)}")
            
            # 3. AI Summary & Tags
            summary, generated_tags = await generate_ai_summary_and_tags(extracted_text)
            print(f"ANALYZE: Summary length: {len(summary)}, Tags count: {len(generated_tags)}")
            
            return {
                "summary": summary,
                "tags": generated_tags
            }
        finally:
            # Clean up the temp file
            if os.path.exists(dest_path):
                try:
                    os.remove(dest_path)
                except Exception:
                    pass
