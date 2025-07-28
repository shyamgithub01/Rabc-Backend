from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.models.users import User
from app.schemas.user_create_schema import CreateUserRequest
from app.core.security import get_password_hash


async def create_user(payload: CreateUserRequest, current_user: User, db: AsyncSession) -> User:
    # Only superadmin and admin can create users
    if current_user.role not in ["superadmin", "admin"]:
        raise HTTPException(status_code=403, detail="Only superadmin or admin can create users.")

    # Check if email already exists
    existing_user = await db.execute(select(User).where(User.email == payload.email))
    if existing_user.scalar():
        raise HTTPException(status_code=400, detail="Email already in use.")

    # Create new user
    new_user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=get_password_hash(payload.password),
        role="user",
        created_by=current_user.id
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
