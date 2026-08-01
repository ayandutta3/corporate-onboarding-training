from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr
from app.repository.models import MongoBaseModel

class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    HR = "hr"
    FINANCE_MANAGER = "finance_manager"
    TECHNICAL_MANAGER = "technical_manager"

class UserBase(BaseModel):
    email: EmailStr
    role: Role = Role.USER
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserInDB(MongoBaseModel, UserBase):
    password: str

class UserResponse(UserBase):
    id: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[Role] = None
