from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.permission import AssignPermissionRequest
from app.services.admin_permission_delete_service import remove_permissions_from_admin

router = APIRouter(tags=["Admin Permission Delete"])

@router.delete(
    "/admins/{user_id}/permissions",
    status_code=status.HTTP_200_OK,
    summary="Remove permissions from an admin (superadmin only)"
)
async def delete_admin_permissions(
    user_id: int,
    payload: AssignPermissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # No more cross‑check of path vs body
    return await remove_permissions_from_admin(
        user_id=user_id,
        module_id=payload.module_id,
        permissions=payload.permissions,
        current_user=current_user,
        db=db
    )
