from fastapi import APIRouter, Depends, Path, Body
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.user_permission_update_schema import UpdateUserPermissionRequest
from app.services.user_permission_update_service import update_user_permissions

router = APIRouter(tags=["Update User Permissions"])

@router.put("/users/{user_id}/permissions")
async def update_user_permissions_view(
    user_id: int = Path(..., description="User ID whose permissions will be updated"),
    payload: UpdateUserPermissionRequest = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await update_user_permissions(user_id, payload, current_user, db)
