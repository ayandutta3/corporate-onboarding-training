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
        version: Optional[int] = None,
        division: Optional[str] = None,
        business_line: Optional[str] = None
    ) -> List[DocumentModel]:
        
        query = {}
        and_clauses = []
        
        if role:
            and_clauses.append({
                "$or": [
                    {"access_roles": role},
                    {"access_roles": {"$size": 0}},
                    {"access_roles": {"$exists": False}}
                ]
            })
            
        if department:
            query["department"] = department
        if knowledge_type:
            query["knowledge_type"] = knowledge_type
        if status:
            query["status"] = status
        if version is not None:
            query["version"] = version
            
        if division == "Corporate":
            query["division"] = "Corporate"
        elif division == "BusinessLine":
            if business_line:
                and_clauses.append({
                    "$or": [
                        {"division": "Corporate"},
                        {"business_line": business_line}
                    ]
                })
            else:
                query["division"] = "Corporate"
        elif division is not None:
            query["division"] = division
            if business_line:
                query["business_line"] = business_line

        if and_clauses:
            query["$and"] = and_clauses
            
        cursor = self.doc_repo.collection.find(query)
        candidates = []
        async for doc_dict in cursor:
            candidates.append(DocumentModel(**doc_dict))
            
        return candidates
