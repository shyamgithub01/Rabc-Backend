from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.permission import AssignPermissionRequest, UserPermissionsResponse
from app.services.permission_service import assign_permissions_to_admin
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User

router = APIRouter()

@router.patch("/admins/{id}/permissions", response_model=UserPermissionsResponse, status_code=status.HTTP_200_OK)
async def patch_admin_permissions(
    id: int,
    payload: AssignPermissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if id != payload.user_id:
        raise HTTPException(status_code=400, detail="Path ID and body user_id must match.")

    return await assign_permissions_to_admin(payload, current_user, db)
