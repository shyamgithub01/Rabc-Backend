from fastapi import APIRouter, Depends, Path, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.user_permission_delete_schema import RemoveUserPermissionRequest
from app.services.user_permission_delete_service import remove_permissions_from_user

router = APIRouter(tags=["Remove Permissions from Users"])

@router.delete("/users/{user_id}/permissions")
async def delete_user_permissions(
    user_id: int = Path(..., description="User ID to remove permissions from"),
    payload: RemoveUserPermissionRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await remove_permissions_from_user(user_id, payload, current_user, db)
