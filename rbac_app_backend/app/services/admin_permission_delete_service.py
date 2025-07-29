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
    db: AsyncSession
):
    """
    Remove specified permissions from an admin user for a given module.
    Edge cases handled:
      - user not found → 404
      - user exists but is not admin → 400
      - module not found → 404
      - none of the requested permission actions are valid → 400
      - user does not actually have those permissions → 404
      - only superadmins may call this → 403
    """

    # 1. Only superadmins allowed
    if current_user.role is not RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can remove permissions."
        )

    # 2. User must exist
    target_user = await db.get(User, user_id)
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )
    # 3. User must be an admin
    if target_user.role is not RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target user is not an admin."
        )

    # 4. Module must exist
    module = await db.get(Module, module_id)
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found."
        )

    # 5. Resolve requested permission IDs
    result = await db.execute(
        select(Permission.id).where(
            Permission.action.in_([p.value for p in permissions])
        )
    )
    permission_ids = [row[0] for row in result.fetchall()]
    if not permission_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid permissions found to remove."
        )

    # 6. Ensure user actually has those permissions in this module
    existing = await db.execute(
        select(UserPermission.id).where(
            UserPermission.user_id == user_id,
            UserPermission.module_id == module_id,
            UserPermission.permission_id.in_(permission_ids)
        )
    )
    if not existing.first():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User does not have the specified permissions in this module."
        )

    # 7. Delete them
    stmt = delete(UserPermission).where(
        UserPermission.user_id == user_id,
        UserPermission.module_id == module_id,
        UserPermission.permission_id.in_(permission_ids)
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
            detail="Database error during permission removal."
        )

    # 8. Audit‑log & response
    logger.info(
        "Superadmin %s removed %d permission(s) for admin %s in module %s",
        current_user.id, deleted_count, user_id, module_id
    )
    return {"detail": f"Removed {deleted_count} permission(s) successfully."}
