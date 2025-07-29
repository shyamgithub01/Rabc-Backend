from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.permission import AssignPermissionRequest, UserPermissionsResponse
from app.services.admin_permission_service import assign_permissions_to_admin
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User

router = APIRouter(tags=['Assign Permission only done by SuperAdmin'])

@router.patch(
    "/admins/{id}/permissions",
    response_model=UserPermissionsResponse,
    status_code=status.HTTP_200_OK
)
async def patch_admin_permissions(
    id: int,
    payload: AssignPermissionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # No need to check payload.user_id anymore
    return await assign_permissions_to_admin(
        user_id=id,
        payload=payload,
        current_user=current_user,
        db=db
    )
