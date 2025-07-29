from datetime import datetime, timedelta , timezone
from typing import Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(subject: str, expires_delta: timedelta = timedelta(minutes=60), custom_claims: dict = None) -> str:
    to_encode = {"sub": subject, "exp": datetime.utcnow() + expires_delta}
    if custom_claims:
        to_encode.update(custom_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

