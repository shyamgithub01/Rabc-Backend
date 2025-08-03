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
   
)


async def assign_permissions_to_admin(
    user_id: int,
    payload: AssignPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    # 1. Only superadmin can assign
    if current_user.role != RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can assign permissions to admins."
        )

    # 2. Validate target user
    target_user = await db.get(User, user_id)
    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found.")

    if target_user.role == RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot assign permissions to another superadmin."
        )

    if target_user.role == RoleEnum.user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This route is only for assigning permissions to admins."
        )

    if target_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target user is not an admin."
        )

    # 3. Validate module
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")

    # 4. Get already assigned permissions for this user-module
    result = await db.execute(
        select(Permission.action)
        .join(UserPermission, UserPermission.permission_id == Permission.id)
        .where(
            UserPermission.user_id == user_id,
            UserPermission.module_id == payload.module_id
        )
    )
    already_assigned = set(result.scalars().all())

    # 5. If ANY requested permission is already assigned → reject request
    requested_actions = [p.value for p in payload.permissions]
    duplicates = [p for p in requested_actions if p in already_assigned]

    if duplicates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot assign because these permissions already exist: {duplicates}"
        )

    # 6. Fetch Permission objects for requested actions
    result = await db.execute(
        select(Permission).where(Permission.action.in_(requested_actions))
    )
    permission_objs = result.scalars().all()

    if not permission_objs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid permissions found to assign."
        )

    # 7. Assign all requested permissions (since none are duplicates)
    new_permissions = [
        UserPermission(
            user_id=user_id,
            module_id=payload.module_id,
            permission_id=perm.id,
            assigned_by=current_user.id
        )
        for perm in permission_objs
    ]
    db.add_all(new_permissions)
    await db.commit()

    # 8. Return all permissions grouped by module for this user
    result = await db.execute(
        select(Module.name, Permission.action)
        .join(UserPermission, UserPermission.module_id == Module.id)
        .join(Permission, Permission.id == UserPermission.permission_id)
        .where(UserPermission.user_id == user_id)
    )
    rows = result.all()

    module_permission_map = defaultdict(list)
    for module_name, action in rows:
        module_permission_map[module_name].append(action)

    return {
        "user_id": target_user.id,
        "permissions": [
            {
                "module_name": module,
                "permissions": actions
            }
            for module, actions in module_permission_map.items()
        ]
    }