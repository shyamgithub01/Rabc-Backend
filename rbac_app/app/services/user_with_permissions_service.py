from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from collections import defaultdict

from app.models.users import User
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.user_with_permissions import UserWithPermissionsResponse, ModulePermissionInfo


async def get_users_with_permissions(db: AsyncSession) -> list[UserWithPermissionsResponse]:
    result = await db.execute(
        select(
            User.id,
            User.username,
            User.email,
            User.role,
            User.created_by,
            Module.name,
            Permission.action
        )
        .join(UserPermission, User.id == UserPermission.user_id)
        .join(Module, Module.id == UserPermission.module_id)
        .join(Permission, Permission.id == UserPermission.permission_id)
        .where(User.role.in_(["admin", "user"]))
        .order_by(User.id)
    )

    rows = result.all()
    user_map = {}

    for user_id, username, email, role, created_by, module_name, action in rows:
        if user_id not in user_map:
            user_map[user_id] = {
                "id": user_id,
                "username": username,
                "email": email,
                "role": role,
                "created_by": created_by,
                "modules": defaultdict(list)
            }
        user_map[user_id]["modules"][module_name].append(action)

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
