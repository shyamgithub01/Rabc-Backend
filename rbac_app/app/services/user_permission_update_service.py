from typing import Set
import logging

from fastapi import HTTPException, status
from sqlalchemy import select, delete, literal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.models.users import User, RoleEnum
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.user_permission_update_schema import UpdateUserPermissionRequest

logger = logging.getLogger(__name__)

async def update_user_permissions(
    target_user_id: int,
    payload: UpdateUserPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    """
    Atomically replace a user's permissions on a module.
    - Only admins & superadmins may call.
    - Admins may only update within modules they have access to.
    """

    # 1. Role check
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Only admins or superadmins can update permissions."
        )

    # 2. Target user must exist and be a regular user
    target = await db.get(User, target_user_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Target user not found.")
    if target.role in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Cannot modify permissions of an admin or superadmin."
        )

    # 3. Module must exist
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Module not found.")

    # 4. If caller is admin, ensure they already have access to that module
    if current_user.role is RoleEnum.admin:
        owned = await db.scalar(
            select(UserPermission.id).where(
                UserPermission.user_id == current_user.id,
                UserPermission.module_id == payload.module_id
            )
        )
        if not owned:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "You do not have access to manage this module."
            )

    # 5. Must supply at least one permission
    requested: Set[str] = {p.value for p in payload.permissions}
    if not requested:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            "Permissions list cannot be empty."
        )

    # 6. Validate all requested actions exist
    try:
        rows = await db.execute(
            select(Permission.action).where(Permission.action.in_(requested))
        )
    except SQLAlchemyError as e:
        logger.error("DB error fetching permissions", exc_info=e)
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Database error fetching permissions."
        )

    found = {r[0] for r in rows.all()}
    missing = requested - found
    if missing:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Invalid permission(s): {', '.join(sorted(missing))}"
        )

    # 7. Delete old & bulk‐insert new via INSERT…SELECT
    try:
        # delete existing
        await db.execute(
            delete(UserPermission).where(
                UserPermission.user_id == target_user_id,
                UserPermission.module_id == payload.module_id
            )
        )

        # insert fresh from a SELECT over Permission
        insert_stmt = UserPermission.__table__.insert().from_select(
            ["user_id", "module_id", "permission_id", "assigned_by"],
            select(
                literal(target_user_id),
                literal(payload.module_id),
                Permission.id,
                literal(current_user.id),
            ).where(Permission.action.in_(requested))
        )
        await db.execute(insert_stmt)
        await db.commit()

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("DB error updating user permissions", exc_info=e)
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Database error updating permissions."
        )

    return {
        "detail": (
            f"Permissions for user {target_user_id} on module {payload.module_id} "
            f"updated to: {', '.join(sorted(requested))}."
        )
    }
