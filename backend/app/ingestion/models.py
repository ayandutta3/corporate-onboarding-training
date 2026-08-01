from pydantic import Field
from typing import Optional, List
from app.repository.models import MongoBaseModel

class DocumentModel(MongoBaseModel):
    filename: str
    file_path: str
    uploaded_by: str
    department: str
    knowledge_type: str
    title: Optional[str] = None
    description: Optional[str] = None
    extracted_text: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_tags: List[str] = Field(default_factory=list)
    embedding_generated: bool = False
    version: int = 1
    access_roles: List[str] = Field(default_factory=list)
    status: str = "active"

class DocumentChunkModel(MongoBaseModel):
    document_id: str
    chunk_id: str
    page_number: Optional[int] = None
    section: Optional[str] = None
    text_content: str
    version: int = 1
    uploaded_by: str
    department: str
    knowledge_type: str
