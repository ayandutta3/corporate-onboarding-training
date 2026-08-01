from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.configuration.settings import get_settings
from app.authentication.models import TokenData, Role
from app.repository.database import get_database
from app.authentication.repository import UserRepository
from motor.motor_asyncio import AsyncIOMotorDatabase

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncIOMotorDatabase = Depends(get_database)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        email: str = payload.get("sub")
        role_str: str = payload.get("role")
        if email is None or role_str is None:
            raise credentials_exception
        token_data = TokenData(email=email, role=Role(role_str))
    except JWTError:
        raise credentials_exception
    
    repo = UserRepository(db)
    user = await repo.get_user_by_email(token_data.email)
    if user is None:
        raise credentials_exception
    return user

class RequireRole:
    def __init__(self, required_roles: list[Role]):
        self.required_roles = required_roles

    async def __call__(self, current_user = Depends(get_current_user)):
        if current_user.role not in self.required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted"
            )
        return current_user
