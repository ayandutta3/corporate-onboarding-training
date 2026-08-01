from app.ingestion.repository import DocumentRepository
from app.ingestion.models import DocumentModel
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional

class MetadataSearchService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.doc_repo = DocumentRepository(db)
        
    async def get_candidate_documents(
        self, 
        role: Optional[str] = None, 
        department: Optional[str] = None, 
        knowledge_type: Optional[str] = None,
        status: Optional[str] = None,
        version: Optional[int] = None
    ) -> List[DocumentModel]:
        
        query = {}
        if role:
            query["access_roles"] = role
        if department:
            query["department"] = department
        if knowledge_type:
            query["knowledge_type"] = knowledge_type
        if status:
            query["status"] = status
        if version is not None:
            query["version"] = version
            
        cursor = self.doc_repo.collection.find(query)
        candidates = []
        async for doc_dict in cursor:
            candidates.append(DocumentModel(**doc_dict))
            
        return candidates
