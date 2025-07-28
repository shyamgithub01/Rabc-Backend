from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, and_
from fastapi import HTTPException, status

from app.models.users import User
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.models.module import Module
from app.schemas.permission import AssignPermissionRequest


async def remove_permissions_from_admin(
    assign_data: AssignPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    # 1. Only superadmin can remove
    if current_user.role != "superadmin":
        raise HTTPException(status_code=403, detail="Only superadmin can remove permissions.")

    # 2. Validate target user
    target_user = await db.get(User, assign_data.user_id)
    if not target_user or target_user.role != "admin":
        raise HTTPException(status_code=404, detail="Target user not found or not an admin.")

    # 3. Validate module exists
    module = await db.get(Module, assign_data.module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found.")

    # 4. Fetch permission IDs from Permission table using the action values
    result = await db.execute(
        select(Permission.id).where(Permission.action.in_([p.value for p in assign_data.permissions]))
    )
    permission_ids = [row[0] for row in result.fetchall()]

    if not permission_ids:
        raise HTTPException(status_code=400, detail="No valid permissions found to remove.")

    # 5. Delete user-permission records matching user_id, module_id and permission_id
    await db.execute(
        delete(UserPermission).where(
            and_(
                UserPermission.user_id == assign_data.user_id,
                UserPermission.module_id == assign_data.module_id,
                UserPermission.permission_id.in_(permission_ids)
            )
        )
    )
    await db.commit()

    return {"detail": "Permissions removed successfully."}
