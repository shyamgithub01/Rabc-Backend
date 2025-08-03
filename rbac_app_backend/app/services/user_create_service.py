import asyncio
import logging

from fastapi import HTTPException, status
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.users import User, RoleEnum
from app.schemas.user_create_schema import CreateUserRequest
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


async def create_user(
    payload: CreateUserRequest,
    current_user: User,
    db: AsyncSession,
) -> User:
    # 1) Authorization
    if current_user.role not in (RoleEnum.superadmin, RoleEnum.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins or admins can create users.",
        )

    # 2) Inputs already validated/normalized by Pydantic
    
    email = str(payload.email)  # lowercased by validator
    password = payload.password

    # 3) Hash password off the event loop
    try:
        hashed_password = await asyncio.to_thread(get_password_hash, password)
    except Exception as e:
        logger.error("Password hashing error", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password hashing failed.",
        )

    # 4) Insert … returning projection
    stmt = (
        insert(User)
        .values(
            
            email=email,
            hashed_password=hashed_password,
            role=RoleEnum.user,
            created_by=current_user.id,
        )
        .returning(
            User.id,
            
            User.email,
            User.role,
            User.created_by,
        )
    )

    try:
        result = await db.execute(stmt)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already in use.",
        )
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Error creating user", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected database error.",
        )

    # 5) Build a lightweight User instance to return (no extra round trip)
    row = result.one()
    new_user = User(
        id=row.id,
        
        email=row.email,
        hashed_password="",  # never expose hash
        role=row.role,
        created_by=row.created_by,
    )
    return new_user
