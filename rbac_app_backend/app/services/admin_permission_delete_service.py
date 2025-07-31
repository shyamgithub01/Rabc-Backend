from typing import List
import logging

from sqlalchemy import delete, select
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
    """
    Remove specified permissions from an admin user for a given module.

    Edge cases handled:
      - only superadmins may call this → 403
      - user not found → 404
      - user exists but is not admin → 400
      - module not found → 404
      - none of the requested permission actions are valid → 400
      - user does not actually have those permissions → 404
    """

    # 1) Authorization
    if current_user.role != RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can remove permissions.",
        )

    # 2) Target user must exist and be admin
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

    # 3) Module must exist
    module = await db.get(Module, module_id)
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found.",
        )

    # 4) Resolve requested permission IDs (normalize/dedupe done in schema if used)
    try:
        actions = [p.value for p in permissions]
        if not actions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No permissions provided.",
            )

        perm_id_rows = await db.execute(
            select(Permission.id).where(Permission.action.in_(actions))
        )
        permission_ids = list(perm_id_rows.scalars())
    except SQLAlchemyError as e:
        logger.error("DB error resolving permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while resolving permissions.",
        )

    if not permission_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid permissions found to remove.",
        )

    # 5) Ensure the user actually has those permissions for this module
    try:
        existing_rows = await db.execute(
            select(UserPermission.id).where(
                UserPermission.user_id == user_id,
                UserPermission.module_id == module_id,
                UserPermission.permission_id.in_(permission_ids),
            )
        )
        existing_ids = list(existing_rows.scalars())
    except SQLAlchemyError as e:
        logger.error("DB error checking existing user permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during permission check.",
        )

    if not existing_ids:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not have the specified permissions in this module.",
        )

    # 6) Delete them
    stmt = delete(UserPermission).where(
        UserPermission.id.in_(existing_ids)
    )

    try:
        result = await db.execute(stmt)
        deleted_count = result.rowcount or 0
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Error removing permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during permission removal.",
        )

    # 7) Audit log & response
    logger.info(
        "Superadmin %s removed %d permission(s) for admin %s in module %s",
        current_user.id, deleted_count, user_id, module_id
    )
    return {"detail": f"Removed {deleted_count} permission(s) successfully."}
