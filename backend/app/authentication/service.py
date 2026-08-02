from app.authentication.repository import UserRepository
from app.authentication.models import UserCreate, UserInDB, Role, UserStatus, UserUpdate
from app.authentication.security import get_password_hash, verify_password, create_access_token
from fastapi import HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

class UserService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = UserRepository(db)

    async def create_user(self, user_in: UserCreate, current_user_role: Role) -> UserInDB:
        existing_user = await self.repo.get_user_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        if current_user_role == Role.HR:
            if user_in.role != Role.USER:
                raise HTTPException(status_code=403, detail="HR can only create User roles.")
            user_in.status = UserStatus.PENDING_APPROVAL
            user_in.is_active = False
        else:
            user_in.status = UserStatus.APPROVED
            user_in.is_active = True
            
        # Division Validation
        if user_in.role in [Role.ADMIN, Role.HR, Role.FINANCE_MANAGER]:
            if user_in.division != "Corporate":
                raise HTTPException(status_code=400, detail="Corporate roles must belong to Corporate Division.")
            user_in.businessLine = None
        elif user_in.role in [Role.TECHNICAL_MANAGER, Role.USER]:
            if user_in.division != "Business Line":
                raise HTTPException(status_code=400, detail="Technical Manager and User must belong to Business Line Division.")
            if not user_in.businessLine:
                raise HTTPException(status_code=400, detail="Business Line is required for Business Line Division users.")
                
        hashed_password = get_password_hash(user_in.password)
        return await self.repo.create_user(user_in, hashed_password)

    async def list_users(self, businessLine: str = None) -> list[UserInDB]:
        return await self.repo.list_users(businessLine)

    async def approve_user(self, user_id: str, designation: str) -> UserInDB:
        user = await self.repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        update_data = UserUpdate(
            status=UserStatus.APPROVED,
            is_active=True,
            designation=designation
        )
        return await self.repo.update(user_id, update_data)

    async def reject_user(self, user_id: str, reason: str) -> UserInDB:
        user = await self.repo.get(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
            
        update_data = UserUpdate(
            status=UserStatus.REJECTED,
            is_active=False,
            rejection_reason=reason
        )
        return await self.repo.update(user_id, update_data)

    async def create_initial_admin_if_not_exists(self):
        admin_email = "admin@example.com"
        existing_admin = await self.repo.get_user_by_email(admin_email)
        if not existing_admin:
            admin_user = UserCreate(
                email=admin_email,
                password="admin",
                role=Role.ADMIN,
                division="Corporate"
            )
            await self.create_user(admin_user, Role.ADMIN)

class AuthService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.repo = UserRepository(db)

    async def authenticate_user(self, email: str, password: str) -> str:
        if email == "admin":
            email = "admin@example.com"
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
            data={
                "sub": user.email, 
                "role": user.role.value,
                "division": user.division,
                "businessLine": user.businessLine
            }
        )
        return access_token
