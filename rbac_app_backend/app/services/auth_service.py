import re
import logging
import asyncio

from fastapi import HTTPException, status
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.users import User, RoleEnum
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, MessageResponse
from app.core.security import get_password_hash, verify_password, create_access_token

logger = logging.getLogger(__name__)

EMAIL_REGEX = re.compile(r"^[^@]+@[^@]+\.[^@]+$")


async def signup_superadmin(
    db: AsyncSession,
    data: SignupRequest,
) -> MessageResponse:
    username = data.username.strip()
    email = data.email.strip().lower()     # ensure stored lowercase
    password = data.password or ""

    # Basic input checks
    if not username:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Username cannot be blank.")
    if " " in username or len(username) > 50:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Username must be 1–50 chars with no spaces.")
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid email format.")
    if len(password) < 8:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Password must be at least 8 characters.")

    # Hash right away (still off the loop so signup isn't totally blocking)
    hash_task = asyncio.create_task(asyncio.to_thread(get_password_hash, password))

    # Check existing superadmin via scalar lookup
    try:
        exists = await db.scalar(
            select(User.id).where(User.role == RoleEnum.superadmin)
        )
    except SQLAlchemyError as e:
        hash_task.cancel()
        logger.error("DB error checking superadmin", exc_info=e)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Database error.")
    if exists:
        hash_task.cancel()
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Superadmin already exists.")

    hashed = await hash_task

    # Single INSERT
    try:
        await db.execute(
            insert(User).values(
                username=username,
                email=email,
                hashed_password=hashed,
                role=RoleEnum.superadmin,
            )
        )
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status.HTTP_400_BAD_REQUEST,
                            "An account with this username or email already exists.")
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("DB error creating superadmin", exc_info=e)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Unexpected database error.")

    return MessageResponse(message="Superadmin created successfully. Please log in to continue.")


async def login_user(
    db: AsyncSession,
    data: LoginRequest,
) -> TokenResponse:
    email = data.email.strip().lower()
    password = data.password or ""

    # Validate inputs
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid email format.")
    if not password:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Password cannot be blank.")

    try:
        # Fetch full user to get hashed_password and role
        user = await db.scalar(
            select(User).where(User.email == email)
        )
    except SQLAlchemyError as e:
        logger.error("DB error during login lookup", exc_info=e)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Database error.")

    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")

    # Include both subject and role in the token payload
    token_payload = {
        "sub": user.email,
        "role": user.role.value
    }

    token = create_access_token(subject=user.email, custom_claims=token_payload)
    return TokenResponse(access_token=token, role=user.role.value)

