from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from app.authentication.models import Token, UserCreate, UserResponse, Role, UserInDB, UserStatus
from app.authentication.service import AuthService, UserService
from app.authentication.dependencies import get_current_user, RequireRole
from app.repository.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

class ApproveUserRequest(BaseModel):
    designation: str

class RejectUserRequest(BaseModel):
    reason: str

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
admin_router = APIRouter(prefix="/admin", tags=["Admin API"])

@auth_router.post("/login", response_model=Token, summary="User Login", description="Authenticate a user and return a JWT access token.")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_database)):
    auth_service = AuthService(db)
    access_token = await auth_service.authenticate_user(form_data.username, form_data.password)
    return {"access_token": access_token, "token_type": "bearer"}

@admin_router.post("/users", response_model=UserResponse, dependencies=[Depends(RequireRole([Role.ADMIN, Role.HR]))], summary="Create User", description="Admin and HR can create users.")
async def create_user(user_in: UserCreate, current_user: UserInDB = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    user_service = UserService(db)
    created_user = await user_service.create_user(user_in, current_user.role)
    return UserResponse(id=created_user.id, email=created_user.email, role=created_user.role, is_active=created_user.is_active, status=created_user.status, designation=created_user.designation, businessLine=created_user.businessLine, division=created_user.division)

@admin_router.get("/users", response_model=List[UserResponse], dependencies=[Depends(RequireRole([Role.ADMIN, Role.HR, Role.TECHNICAL_MANAGER]))], summary="List Users", description="List users based on role.")
async def list_users(current_user: UserInDB = Depends(get_current_user), db: AsyncIOMotorDatabase = Depends(get_database)):
    user_service = UserService(db)
    if current_user.role == Role.TECHNICAL_MANAGER:
        if not current_user.businessLine:
            return []
        users = await user_service.list_users(current_user.businessLine)
    else:
        users = await user_service.list_users(None)
    return [UserResponse(id=user.id, email=user.email, role=user.role, is_active=user.is_active, status=user.status, designation=user.designation, businessLine=user.businessLine, division=user.division) for user in users]

@admin_router.patch("/users/{user_id}/approve", response_model=UserResponse, dependencies=[Depends(RequireRole([Role.ADMIN, Role.TECHNICAL_MANAGER]))], summary="Approve User")
async def approve_user(user_id: str, req: ApproveUserRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user_service = UserService(db)
    user = await user_service.approve_user(user_id, req.designation)
    return UserResponse(id=user.id, email=user.email, role=user.role, is_active=user.is_active, status=user.status, designation=user.designation, businessLine=user.businessLine, division=user.division)

@admin_router.patch("/users/{user_id}/reject", response_model=UserResponse, dependencies=[Depends(RequireRole([Role.ADMIN, Role.TECHNICAL_MANAGER]))], summary="Reject User")
async def reject_user(user_id: str, req: RejectUserRequest, db: AsyncIOMotorDatabase = Depends(get_database)):
    user_service = UserService(db)
    user = await user_service.reject_user(user_id, req.reason)
    return UserResponse(id=user.id, email=user.email, role=user.role, is_active=user.is_active, status=user.status, designation=user.designation, businessLine=user.businessLine, division=user.division)
