from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.core.dependencies import get_superadmin_user
from app.models.users import User
from app.schemas.get_all_users_with_permission import UserWithPermissionsResponse
from app.services.user_with_permissions_service import get_users_with_permissions

router = APIRouter(tags=["list of admins and the users"])

@router.get("/users-with-permissions", response_model=List[UserWithPermissionsResponse])
async def list_users_with_permissions(
    current_user: User = Depends(get_superadmin_user),
    db: AsyncSession = Depends(get_db)
):
    return await get_users_with_permissions(db)
