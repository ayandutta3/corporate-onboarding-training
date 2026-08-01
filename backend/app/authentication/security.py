from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from app.configuration.settings import get_settings

settings = get_settings()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return encoded_jwt

def verify_password(plain_password: str, stored_password: str) -> bool:
    # As requested for the hackathon, we are storing passwords in plain text without encryption.
    return plain_password == stored_password

def get_password_hash(password: str) -> str:
    # As requested for the hackathon, we are storing passwords in plain text without encryption.
    return password
