from typing import List
import logging
from collections import defaultdict

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.models.users import User, RoleEnum
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.get_all_users_with_permission import (
    UserWithPermissionsResponse,
    ModulePermissionInfo,
)

logger = logging.getLogger(__name__)

async def get_users_with_permissions(
    db: AsyncSession,
    current_user: User,
) -> List[UserWithPermissionsResponse]:
    # 1. Only superadmins and admins may call
    if current_user.role not in (RoleEnum.superadmin, RoleEnum.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins and admins can view user permissions."
        )

    # 2. Build a LEFT JOIN query so even users with no perms show up
    stmt = (
        select(
            User.id,
            User.username,
            User.email,
            User.role,
            User.created_by,
            Module.name.label("module_name"),
            Permission.action.label("action"),
        )
        .select_from(User)
        .outerjoin(UserPermission, User.id == UserPermission.user_id)
        .outerjoin(Module, Module.id == UserPermission.module_id)
        .outerjoin(Permission, Permission.id == UserPermission.permission_id)
        .where(User.role.in_([RoleEnum.admin, RoleEnum.user]))
        .order_by(User.id)
    )

    result = await db.execute(stmt)
    rows = result.all()

    # 3. Group by user → module → [actions]
    user_map: dict[int, dict] = {}
    for user_id, username, email, role, created_by, module_name, action in rows:
        if user_id not in user_map:
            user_map[user_id] = {
                "id": user_id,
                "username": username,
                "email": email,
                "role": role,
                "created_by": created_by,
                "modules": defaultdict(list),
            }
        if module_name and action:
            user_map[user_id]["modules"][module_name].append(action)

    # 4. Serialize to Pydantic
    return [
        UserWithPermissionsResponse(
            id=data["id"],
            username=data["username"],
            email=data["email"],
            role=data["role"],
            created_by=data["created_by"],
            modules=[
                ModulePermissionInfo(module_name=mod, permissions=perms)
                for mod, perms in data["modules"].items()
            ]
        )
        for data in user_map.values()
    ]
