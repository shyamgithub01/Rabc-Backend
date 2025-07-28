from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.permission import AssignPermissionRequest
from app.services.admin_permission_delete_service import remove_permissions_from_admin


router = APIRouter( tags=["Admin Permission Delete only done by SuperAdmin"])

@router.delete("/admins/{id}/permissions", status_code=status.HTTP_200_OK)
async def delete_admin_permissions(
    id: int,
    payload: AssignPermissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if id != payload.user_id:
        raise HTTPException(status_code=400, detail="Path ID and body user_id must match.")
    
    return await remove_permissions_from_admin(payload, current_user, db)
