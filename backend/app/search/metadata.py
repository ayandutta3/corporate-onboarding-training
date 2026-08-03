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
        division: Optional[str] = None,
        businessLine: Optional[str] = None,
        user_division: Optional[str] = None,
        user_businessLine: Optional[str] = None,
        is_admin: bool = False,
        status: Optional[str] = None,
        version: Optional[int] = None
    ) -> List[DocumentModel]:
        
        query = {}
        if role:
            query["$or"] = [
                {"access_roles": role},
                {"access_roles": {"$size": 0}},
                {"access_roles": {"$exists": False}}
            ]
            
        if not is_admin:
            # RBAC for Division / BusinessLine
            division_or_clauses = [
                {"division": "Corporate"},
                {"division": "BusinessLine"}
            ]
            if user_businessLine:
                division_or_clauses.append({"businessLine": user_businessLine})
                division_or_clauses.append({"department": user_businessLine})
            
            if "$or" in query:
                # Need an $and to combine the role $or and division $or
                query["$and"] = [
                    {"$or": query.pop("$or")},
                    {"$or": division_or_clauses}
                ]
            else:
                query["$or"] = division_or_clauses
                
        # Apply requested filters if they don't violate RBAC
        if department:
            query["department"] = department
        if division:
            query["division"] = division
        if businessLine:
            query["businessLine"] = businessLine
            
        if status:
            query["status"] = status
        if version is not None:
            query["version"] = version
            
        cursor = self.doc_repo.collection.find(query)
        candidates = []
        async for doc_dict in cursor:
            candidates.append(DocumentModel(**doc_dict))
            
        return candidates
