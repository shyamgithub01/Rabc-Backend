# app/core/security.py
from datetime import datetime, timedelta
from typing import Optional, Dict

from jose import jwt
from passlib.context import CryptContext

# Keep this module lightweight and free of app-internal imports at top-level.
# (No imports from app.models, app.schemas, etc.)

# In tests / load tests you can lower rounds:
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=8)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    # CPU-bound; call from a thread with asyncio.to_thread in async paths
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    # CPU-bound; call from a thread with asyncio.to_thread in async paths
    return pwd_context.hash(password)


def create_access_token(
    subject: str,
    expires_delta: timedelta = timedelta(minutes=60),
    custom_claims: Optional[Dict] = None,
) -> str:
    """
    Create a JWT. We IMPORT settings lazily inside the function to avoid
    circular-import problems during module import.
    """
    # Lazy import eliminates circulars at import time
    from app.core.config import settings

    to_encode: Dict = {"sub": subject, "exp": datetime.utcnow() + expires_delta}
    if custom_claims:
        to_encode.update(custom_claims)

    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
