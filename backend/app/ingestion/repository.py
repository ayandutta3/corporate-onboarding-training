from app.repository.base import BaseRepository
from app.ingestion.models import DocumentModel, DocumentChunkModel
from motor.motor_asyncio import AsyncIOMotorDatabase
import pymongo

class DocumentRepository(BaseRepository[DocumentModel, DocumentModel, DocumentModel]):
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(model=DocumentModel, db=db, collection_name="documents")
        
    async def create_indexes(self):
        await self.collection.create_index([("uploaded_by", pymongo.ASCENDING)])
        await self.collection.create_index([("department", pymongo.ASCENDING)])
        await self.collection.create_index([("knowledge_type", pymongo.ASCENDING)])

class DocumentChunkRepository(BaseRepository[DocumentChunkModel, DocumentChunkModel, DocumentChunkModel]):
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(model=DocumentChunkModel, db=db, collection_name="document_chunks")
        
    async def create_indexes(self):
        await self.collection.create_index([("document_id", pymongo.ASCENDING)])
        await self.collection.create_index([("chunk_id", pymongo.ASCENDING)], unique=True)
