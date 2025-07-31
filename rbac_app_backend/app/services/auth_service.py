import asyncio
import logging

from fastapi import HTTPException, status
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.users import User, RoleEnum
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse, MessageResponse
from app.core.security import get_password_hash, verify_password, create_access_token

logger = logging.getLogger(__name__)


async def signup_superadmin(
    db: AsyncSession,
    data: SignupRequest,
) -> MessageResponse:
    """
    Creates the one-and-only superadmin.
    All input validation is handled by Pydantic schemas.
    """
    username = data.username
    email = str(data.email)  # already lowercased by validator
    password = data.password

    # Check if a superadmin already exists
    try:
        exists = await db.scalar(
            select(User.id).where(User.role == RoleEnum.superadmin).limit(1)
        )
    except SQLAlchemyError as e:
        logger.error("DB error checking superadmin", exc_info=e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error.")

    if exists:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Superadmin already exists.")

    # Hash password (off the main loop)
    try:
        hashed = await asyncio.to_thread(get_password_hash, password)
    except Exception as e:
        logger.error("Password hashing error", exc_info=e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Password hashing failed.")

    # Insert superadmin
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
        # Unique constraint on username/email
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this username or email already exists.",
        )
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("DB error creating superadmin", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Unexpected database error."
        )

    return MessageResponse(message="Superadmin created successfully. Please log in to continue.")


async def login_user(
    db: AsyncSession,
    data: LoginRequest,
) -> TokenResponse:
    """
    Authenticates a user and returns a JWT that includes `sub` (email) and `role`.
    Input validation handled by Pydantic.
    """
    email = str(data.email)   # already lowercased by validator
    password = data.password

    # Fetch user record
    try:
        user = await db.scalar(select(User).where(User.email == email).limit(1))
    except SQLAlchemyError as e:
        logger.error("DB error during login lookup", exc_info=e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error.")

    # Verify credentials (constant-time hash check inside verify_password)
    if not user or not verify_password(password, user.hashed_password):
        # Keep message generic for security
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    # JWT payload (your create_access_token should set exp/iat, etc.)
    token_payload = {"sub": user.email, "role": user.role.value}
    access_token = create_access_token(subject=user.email, custom_claims=token_payload)

    return TokenResponse(access_token=access_token, role=user.role.value)
