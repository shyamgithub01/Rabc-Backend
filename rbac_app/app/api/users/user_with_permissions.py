from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User, RoleEnum
from app.schemas.get_all_users_with_permission import UserWithPermissionsResponse
from app.services.user_with_permissions_service import get_users_with_permissions

router = APIRouter(tags=["Admins & Users Permissions"])


@router.get(
    "/users-with-permissions",
    response_model=List[UserWithPermissionsResponse],
    summary="List all admins/users and their module permissions"
)
async def list_users_with_permissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Allow only superadmins or admins
    if current_user.role not in (RoleEnum.superadmin, RoleEnum.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins and admins can view this list."
        )

    return await get_users_with_permissions(db, current_user)
