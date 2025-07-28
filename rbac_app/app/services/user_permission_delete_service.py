from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, and_
from fastapi import HTTPException

from app.models.users import User
from app.models.permission import Permission
from app.models.module import Module
from app.models.user_permission import UserPermission
from app.schemas.user_permission_delete_schema import RemoveUserPermissionRequest


async def remove_permissions_from_user(
    target_user_id: int,
    payload: RemoveUserPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    # ✅ 1. Role validation
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Only admin or superadmin can remove permissions.")

    # ✅ 2. Module check
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found.")

    # ✅ 3. Admin access restriction
    if current_user.role != "superadmin":
        result = await db.execute(
            select(UserPermission).where(
                UserPermission.user_id == current_user.id,
                UserPermission.module_id == payload.module_id
            )
        )
        if not result.scalar():
            raise HTTPException(status_code=403, detail="You do not have access to this module.")

    # ✅ 4. Get permission IDs to remove
    result = await db.execute(
        select(Permission.id).where(Permission.action.in_([p.value for p in payload.permissions]))
    )
    permission_ids = [row[0] for row in result.fetchall()]

    if not permission_ids:
        raise HTTPException(status_code=400, detail="No valid permissions found.")

    # ✅ 5. Delete those specific user permissions
    await db.execute(
        delete(UserPermission).where(
            and_(
                UserPermission.user_id == target_user_id,
                UserPermission.module_id == payload.module_id,
                UserPermission.permission_id.in_(permission_ids)
            )
        )
    )
    await db.commit()

    return {"detail": "Permissions removed successfully."}
