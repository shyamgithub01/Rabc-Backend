from fastapi import APIRouter, Depends, Path
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Body  
from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.user_permission_assign_schema import AssignUserPermissionRequest
from app.services.user_permission_assign_service import assign_permissions_to_user

router = APIRouter(tags=["Assign Permissions to Users"])

@router.post("/users/{user_id}/permissions")
async def assign_user_permissions(
    user_id: int = Path(..., description="ID of the user to assign permissions to"),
    

    payload: AssignUserPermissionRequest = Body(...),

    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    return await assign_permissions_to_user(user_id, payload, current_user, db)
