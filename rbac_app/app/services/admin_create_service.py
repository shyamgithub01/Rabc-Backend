from app.models.users import User, RoleEnum  
from app.core.security import get_password_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.schemas.user import CreateAdminRequest
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from sqlalchemy.future import select
from app.models.users import User, RoleEnum

async def create_admin(data: CreateAdminRequest, current_user: User, db: AsyncSession) -> User:
    if current_user.role != RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can create admins."
        )

    new_admin = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        role=RoleEnum.admin,
        created_by=current_user.id,
    )

    db.add(new_admin)
    try:
        await db.commit()
        await db.refresh(new_admin)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin with this email already exists."
        )

    return new_admin


