from motor.motor_asyncio import AsyncIOMotorDatabase
from app.authentication.models import UserInDB, UserCreate
from app.repository.base import BaseRepository
import pymongo
from typing import Optional, List

class UserRepository(BaseRepository[UserInDB, UserCreate, UserCreate]):
    def __init__(self, db: AsyncIOMotorDatabase):
        super().__init__(model=UserInDB, db=db, collection_name="users")

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        document = await self.collection.find_one({"email": email})
        if document:
            return self.model(**document)
        return None

    async def create_user(self, user: UserCreate, hashed_password: str) -> UserInDB:
        return await self.create(user, password=hashed_password)

    async def list_users(self) -> List[UserInDB]:
        return await self.get_multi()

    async def create_indexes(self):
        await self.collection.create_index([("email", pymongo.ASCENDING)], unique=True)
