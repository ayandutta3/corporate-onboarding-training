from app.authentication.repository import UserRepository
from app.authentication.models import UserCreate, UserInDB, Role
from app.authentication.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = UserRepository(db)

    async def create_user(self, user_in: UserCreate) -> UserInDB:
        existing_user = await self.repo.get_user_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        hashed_password = get_password_hash(user_in.password)
        return await self.repo.create_user(user_in, hashed_password)

    async def list_users(self) -> list[UserInDB]:
        return await self.repo.list_users()

    async def create_initial_admin_if_not_exists(self):
        admin_email = "admin@example.com"
        existing_admin = await self.repo.get_user_by_email(admin_email)
        if not existing_admin:
            admin_user = UserCreate(
                email=admin_email,
                password="admin",
                role=Role.ADMIN
            )
            await self.create_user(admin_user)

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = UserRepository(db)

    async def authenticate_user(self, email: str, password: str) -> str:
        user = await self.repo.get_user_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(
            data={"sub": user.email, "role": user.role.value}
        )
        return access_token
