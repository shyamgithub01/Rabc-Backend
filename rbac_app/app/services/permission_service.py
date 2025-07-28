from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status
from collections import defaultdict

from app.models.users import User, RoleEnum
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.permission import (
    AssignPermissionRequest,
    UserPermissionsResponse,
    UserModulePermissionResponse,
)

async def assign_permissions_to_admin(
    assign_data: AssignPermissionRequest,
    current_user: User,
    db: AsyncSession
) -> UserPermissionsResponse:
    # 1. Only superadmin can assign
    if current_user.role != RoleEnum.superadmin:
        raise HTTPException(status_code=403, detail="Only superadmin can assign permissions.")

    # 2. Validate target user
    target_user = await db.get(User, assign_data.user_id)
    if not target_user or target_user.role != RoleEnum.admin:
        raise HTTPException(status_code=404, detail="Target user not found or not an admin.")

    # 3. Validate module exists
    module = await db.get(Module, assign_data.module_id)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found.")

    # 4. Delete existing permissions for user-module pair
    await db.execute(
        UserPermission.__table__.delete().where(
            (UserPermission.user_id == assign_data.user_id) &
            (UserPermission.module_id == assign_data.module_id)
        )
    )

    # 5. Fetch global permissions matching the given actions
    result = await db.execute(
        select(Permission).where(Permission.action.in_([p.value for p in assign_data.permissions]))
    )
    permission_objs = result.scalars().all()

    if not permission_objs:
        raise HTTPException(status_code=400, detail="No valid permissions found to assign.")

    # 6. Add user-module-permission mappings
    new_user_permissions = [
        UserPermission(
            user_id=assign_data.user_id,
            module_id=assign_data.module_id,
            permission_id=perm.id,
            assigned_by=current_user.id
        )
        for perm in permission_objs
    ]
    db.add_all(new_user_permissions)
    await db.commit()

    # 7. Prepare return response (all permissions assigned to the user grouped by module)
    join_stmt = (
        select(Module.name, Permission.action)
        .join(UserPermission, UserPermission.module_id == Module.id)
        .join(Permission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == assign_data.user_id)
    )
    result = await db.execute(join_stmt)
    rows = result.all()

    module_permission_map = defaultdict(list)
    for module_name, action in rows:
        module_permission_map[module_name].append(action)

    return UserPermissionsResponse(
        user_id=target_user.id,
        user_name=target_user.username,  # change if your field is different
        permissions=[
            UserModulePermissionResponse(
                module_name=module,
                permissions=actions
            ) for module, actions in module_permission_map.items()
        ]
    )
