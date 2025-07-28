from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

from app.models.users import User
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.user_permission_assign_schema import AssignUserPermissionRequest


async def assign_permissions_to_user(
    target_user_id: int,
    payload: AssignUserPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    # 1. Only admin or superadmin allowed
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Only admin or superadmin can assign permissions.")

    # 2. Validate module exists
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found.")

    # 3. Check if current user has access to this module
    if current_user.role != "superadmin":
        result = await db.execute(
            select(UserPermission).where(
                UserPermission.user_id == current_user.id,
                UserPermission.module_id == payload.module_id
            )
        )
        if not result.scalar():
            raise HTTPException(status_code=403, detail="You do not have access to this module.")

    # 4. Get matching Permission IDs
    result = await db.execute(
        select(Permission).where(Permission.action.in_([p.value for p in payload.permissions]))
    )
    permission_objs = result.scalars().all()

    if not permission_objs:
        raise HTTPException(status_code=400, detail="No valid permissions found.")

    # 5. Delete existing permissions for user-module
    await db.execute(
        UserPermission.__table__.delete().where(
            (UserPermission.user_id == target_user_id) &
            (UserPermission.module_id == payload.module_id)
        )
    )

    # 6. Assign new permissions
    new_user_permissions = [
        UserPermission(
            user_id=target_user_id,
            module_id=payload.module_id,
            permission_id=perm.id,
            assigned_by=current_user.id
        )
        for perm in permission_objs
    ]
    db.add_all(new_user_permissions)
    await db.commit()

    return {"detail": "Permissions assigned successfully."}
