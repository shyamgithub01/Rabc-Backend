 
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.schemas.user import CreateAdminRequest, UserResponse
from app.services.admin_create_service import create_admin
from app.core.dependencies import get_current_user
from app.models.users import User
from fastapi import APIRouter, Depends
from typing import List
from app.db.session import get_db


router = APIRouter( tags=["Create Admin only done by SuperAdmin"])

@router.post("/admins/", response_model=UserResponse)
async def create_admin_view(
    payload: CreateAdminRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    new_admin = await create_admin(payload, current_user, db)
    return new_admin

