from typing import Generic, TypeVar, Type, Optional, List, Any
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorDatabase
import pymongo
from datetime import datetime

ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

class BaseRepository(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType], db: AsyncIOMotorDatabase, collection_name: str):
        self.model = model
        self.collection = db[collection_name]

    async def get(self, id: Any) -> Optional[ModelType]:
        document = await self.collection.find_one({"_id": id})
        if document:
            return self.model(**document)
        return None

    async def get_multi(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        cursor = self.collection.find({}).skip(skip).limit(limit)
        return [self.model(**document) async for document in cursor]

    async def create(self, obj_in: CreateSchemaType, **kwargs) -> ModelType:
        obj_in_data = obj_in.model_dump()
        obj_in_data.update(kwargs)
        
        # Instantiate model to generate _id and timestamps automatically via default_factory
        db_obj = self.model(**obj_in_data)
        db_dict = db_obj.model_dump(by_alias=True)
        
        await self.collection.insert_one(db_dict)
        return db_obj

    async def update(self, id: Any, obj_in: UpdateSchemaType, **kwargs) -> Optional[ModelType]:
        update_data = obj_in.model_dump(exclude_unset=True) if isinstance(obj_in, BaseModel) else dict(obj_in)
        update_data.pop("_id", None)
        update_data.pop("id", None)
        update_data.update(kwargs)
        update_data["updated_at"] = datetime.utcnow()
        
        await self.collection.update_one(
            {"_id": id}, {"$set": update_data}
        )
        return await self.get(id)

    async def delete(self, id: Any) -> bool:
        result = await self.collection.delete_one({"_id": id})
        return result.deleted_count == 1

    async def create_indexes(self):
        # Override this in subclasses to create specific indexes
        pass
