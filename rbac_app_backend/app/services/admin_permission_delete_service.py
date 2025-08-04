from typing import List
import logging

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException, status

from app.models.users import User, RoleEnum
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.permission import PermissionEnum

logger = logging.getLogger(__name__)


async def remove_permissions_from_admin(
    user_id: int,
    module_id: int,
    permissions: List[PermissionEnum],
    current_user: User,
    db: AsyncSession,
):
    # 1. Authorization
    if current_user.role != RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can remove permissions.",
        )

    # 2. Target user must exist and be admin
    target_user = await db.get(User, user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    if target_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target user is not an admin.",
        )

    # 3. Module must exist
    module = await db.get(Module, module_id)
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found.",
        )

    # 4. Resolve permission IDs from requested actions
    actions = [p.value for p in permissions]
    if not actions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No permissions provided.",
        )

    try:
        result = await db.execute(
            select(Permission.id, Permission.action).where(Permission.action.in_(actions))
        )
        perm_rows = result.all()
        requested_perm_ids = [row[0] for row in perm_rows]
    except SQLAlchemyError as e:
        logger.error("DB error resolving permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error fetching permission IDs.",
        )

    if not requested_perm_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid permissions found to remove.",
        )

    # 5. Fetch only those permissions that are actually assigned
    try:
        result = await db.execute(
            select(UserPermission.id).where(
                UserPermission.user_id == user_id,
                UserPermission.module_id == module_id,
                UserPermission.permission_id.in_(requested_perm_ids)
            )
        )
        assigned_user_permission_ids = list(result.scalars())
    except SQLAlchemyError as e:
        logger.error("DB error checking assigned permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error checking assigned permissions.",
        )

    deleted_count = 0
    try:
        # 6. Delete assigned permissions if any
        if assigned_user_permission_ids:
            delete_stmt = delete(UserPermission).where(
                UserPermission.id.in_(assigned_user_permission_ids)
            )
            await db.execute(delete_stmt)
            deleted_count = len(assigned_user_permission_ids)

        # 7. Nullify assigned_by to avoid FK issues
        await db.execute(
            update(UserPermission)
            .where(UserPermission.assigned_by == user_id)
            .values(assigned_by=None)
        )

        # 8. Delete the user account
        await db.execute(
            delete(User).where(User.id == user_id)
        )

        await db.commit()

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("DB error during deletion", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during deletion.",
        )

    logger.info(
        "Superadmin %s removed %d permission(s) and deleted admin user %s in module %s",
        current_user.id, deleted_count, user_id, module_id
    )

    return {
        "detail": f"Removed {deleted_count} assigned permission(s) and deleted admin user successfully."
    }
