import asyncio
import logging

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

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
    """
    # 1. Start a transaction block—auto-commits on success, rolls back on error
    async with db.begin():
        # 2. Check existence
        exists = await db.scalar(
            select(User.id).where(User.role == RoleEnum.superadmin)
        )
        if exists:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Superadmin already exists."
            )

        # 3. Hash off the main thread
        try:
            hashed = await asyncio.to_thread(get_password_hash, data.password)
        except Exception:
            logger.exception("Password hashing failed")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Password hashing failed."
            )

        # 4. Create ORM object (simpler than core‐insert)
        new_user = User(
            username=data.username,
            email=str(data.email),
            hashed_password=hashed,
            role=RoleEnum.superadmin,
        )
        db.add(new_user)

    # If we reach here, transaction has committed
    return MessageResponse(message="Superadmin created successfully. Please log in to continue.")


async def login_user(
    db: AsyncSession,
    data: LoginRequest,
) -> TokenResponse:
    """
    Authenticates a user and returns a JWT with `sub` and `role`.
    """
    # 1. Fetch user
    try:
        result = await db.execute(
            select(User).where(User.email == str(data.email))
        )
        user: User | None = result.scalar_one_or_none()
    except SQLAlchemyError:
        logger.exception("DB error during login lookup")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error."
        )

    # 2. Verify password off the main thread
    password_ok = await asyncio.to_thread(
        verify_password, data.password, user.hashed_password
    ) if user else False

    if not password_ok:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )

    # 3. Issue token
    token_payload = {"sub": user.email, "role": user.role.value}
    access_token = create_access_token(subject=user.email, custom_claims=token_payload)

    return TokenResponse(access_token=access_token, role=user.role.value)
