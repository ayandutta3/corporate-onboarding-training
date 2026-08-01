from motor.motor_asyncio import AsyncIOMotorClient
from app.configuration.settings import get_settings
from typing import Optional

settings = get_settings()

class Database:
    client: Optional[AsyncIOMotorClient] = None

db = Database()

async def connect_to_mongo():
    db.client = AsyncIOMotorClient(settings.mongodb_uri)

async def close_mongo_connection():
    if db.client is not None:
        db.client.close()

async def init_indexes():
    from app.authentication.repository import UserRepository
    from app.ingestion.repository import DocumentRepository, DocumentChunkRepository
    
    user_repo = UserRepository(db.client[settings.mongodb_db_name])
    await user_repo.create_indexes()
    
    doc_repo = DocumentRepository(db.client[settings.mongodb_db_name])
    await doc_repo.create_indexes()
    
    chunk_repo = DocumentChunkRepository(db.client[settings.mongodb_db_name])
    await chunk_repo.create_indexes()

def get_database():
    return db.client[settings.mongodb_db_name]
