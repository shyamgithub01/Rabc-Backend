import asyncio
import logging

from fastapi import HTTPException, status
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.users import User, RoleEnum
from app.core.security import get_password_hash
from app.schemas.create_admin import CreateAdminRequest

logger = logging.getLogger(__name__)


async def create_admin(
    data: CreateAdminRequest,
    current_user: User,
    db: AsyncSession,
) -> User:
    # 1) Authorization (prefer ==/!= for Enum comparison clarity)
    if current_user.role != RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can create admins.",
        )

    # 2) Inputs are already validated/normalized by Pydantic:
    username = data.username
    email = str(data.email)  # already lowercased by validator
    password = data.password

    # 3) Hash password off the loop
    try:
        hashed_password = await asyncio.to_thread(get_password_hash, password)
    except Exception as e:
        logger.error("Password hashing error", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password hashing failed.",
        )

    # 4) Insert and return created row
    stmt = (
        insert(User)
        .values(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=RoleEnum.admin,
            created_by=current_user.id,
        )
        .returning(User)
    )

    try:
        result = await db.execute(stmt)
        await db.commit()
        return result.scalar_one()

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this username or email already exists.",
        )
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Database error creating admin", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected database error.",
        )
