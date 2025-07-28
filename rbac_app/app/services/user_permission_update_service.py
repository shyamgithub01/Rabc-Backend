from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, delete
from fastapi import HTTPException

from app.models.users import User
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.user_permission_update_schema import UpdateUserPermissionRequest


async def update_user_permissions(
    target_user_id: int,
    payload: UpdateUserPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    # ✅ 1. Role check
    if current_user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Only admin or superadmin can update permissions.")

    # ✅ 2. Target user validation
    target_user = await db.get(User, target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found.")
    if target_user.role in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="You cannot modify permissions of an admin or superadmin.")

    # ✅ 3. Module validation
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found.")

    # ✅ 4. Admin must have access to that module
    if current_user.role != "superadmin":
        result = await db.execute(
            select(UserPermission).where(
                UserPermission.user_id == current_user.id,
                UserPermission.module_id == payload.module_id
            )
        )
        if not result.scalar():
            raise HTTPException(status_code=403, detail="You do not have access to this module.")

    # ✅ 5. Fetch permission IDs (global permissions)
    result = await db.execute(
        select(Permission).where(Permission.action.in_([p.value for p in payload.permissions]))
    )
    permission_objs = result.scalars().all()

    if not permission_objs or len(permission_objs) != len(payload.permissions):
        raise HTTPException(status_code=400, detail="Some permissions are invalid.")

    # ✅ 6. Delete old permissions
    await db.execute(
        delete(UserPermission).where(
            and_(
                UserPermission.user_id == target_user_id,
                UserPermission.module_id == payload.module_id
            )
        )
    )

    # ✅ 7. Insert new permissions
    new_entries = [
        UserPermission(
            user_id=target_user_id,
            module_id=payload.module_id,
            permission_id=perm.id,
            assigned_by=current_user.id
        )
        for perm in permission_objs
    ]
    db.add_all(new_entries)
    await db.commit()

    return {"detail": "Permissions updated successfully."}
