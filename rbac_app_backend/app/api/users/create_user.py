from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.user_create_schema import CreateUserRequest
from app.schemas.create_admin import UserResponse
from app.services.user_create_service import create_user

router = APIRouter(tags=["Create User (by Admin or Superadmin)"])

@router.post("/users/", response_model=UserResponse)
async def create_user_view(
    payload: CreateUserRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    return await create_user(payload, current_user, db)
