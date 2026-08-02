from enum import Enum
from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from app.repository.models import MongoBaseModel

class UserStatus(str, Enum):
    APPROVED = "Approved"
    PENDING_APPROVAL = "PendingApproval"
    REJECTED = "Rejected"

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
    status: UserStatus = UserStatus.APPROVED
    designation: Optional[str] = None
    division: Optional[str] = None
    businessLine: Optional[str] = None
    rejection_reason: Optional[str] = None

    class Config:
        populate_by_name = True

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    is_active: Optional[bool] = None
    status: Optional[UserStatus] = None
    designation: Optional[str] = None
    division: Optional[str] = None
    businessLine: Optional[str] = None
    rejection_reason: Optional[str] = None

    class Config:
        populate_by_name = True

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
