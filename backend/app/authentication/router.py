from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.authentication.models import Token, UserCreate, UserResponse, Role, UserInDB
from app.authentication.service import AuthService, UserService
from app.authentication.dependencies import get_current_user, RequireRole
from app.repository.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List

auth_router = APIRouter(prefix="/auth", tags=["Authentication"])
admin_router = APIRouter(prefix="/admin", tags=["Admin API"])

@auth_router.post("/login", response_model=Token, summary="User Login", description="Authenticate a user and return a JWT access token.")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncIOMotorDatabase = Depends(get_database)):
    auth_service = AuthService(db)
    access_token = await auth_service.authenticate_user(form_data.username, form_data.password)
    return {"access_token": access_token, "token_type": "bearer"}

@admin_router.post("/users", response_model=UserResponse, dependencies=[Depends(RequireRole([Role.ADMIN]))], summary="Create User", description="Admin only. Create a new user in the system.")
async def create_user(user_in: UserCreate, db: AsyncIOMotorDatabase = Depends(get_database)):
    user_service = UserService(db)
    created_user = await user_service.create_user(user_in)
    return UserResponse(id=created_user.id, email=created_user.email, role=created_user.role, is_active=created_user.is_active)

@admin_router.get("/users", response_model=List[UserResponse], dependencies=[Depends(RequireRole([Role.ADMIN]))], summary="List Users", description="Admin only. Retrieve a list of all users.")
async def list_users(db: AsyncIOMotorDatabase = Depends(get_database)):
    user_service = UserService(db)
    users = await user_service.list_users()
    return [UserResponse(id=user.id, email=user.email, role=user.role, is_active=user.is_active) for user in users]
