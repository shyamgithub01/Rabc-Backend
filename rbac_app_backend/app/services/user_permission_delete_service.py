from typing import Set
import logging

from fastapi import HTTPException, status
from sqlalchemy import select, delete, and_, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.models.users import User, RoleEnum
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.user_permission_delete_schema import RemoveUserPermissionRequest

logger = logging.getLogger(__name__)

async def remove_permissions_from_user(
    target_user_id: int,
    payload: RemoveUserPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    """
    Remove a specific set of permissions from a user on one module.
    - Only admins & superadmins may call.
    - Admins only for modules they already manage.
    - Only permissions for regular users can be removed.
    """

    # 1. Only admin or superadmin
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or superadmins can remove permissions."
        )

    # 2. Ensure target user exists
    target = await db.get(User, target_user_id)
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Target user not found.")

    # 2.5 NEW: Prevent modifying admins or superadmins
    if target.role != RoleEnum.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permissions can only be removed from users, not from admins or superadmins."
        )

    # 3. Ensure module exists
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Module not found.")

    # 4. If caller is admin, verify they have any permission on this module
    if current_user.role is RoleEnum.admin:
        own = await db.execute(
            select(UserPermission.id).where(
                UserPermission.user_id == current_user.id,
                UserPermission.module_id == payload.module_id
            )
        )
        if own.scalars().first() is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to this module."
            )

    # 5. Must specify at least one permission
    if not payload.permissions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one permission must be specified."
        )

    # 6. Dedupe & resolve actions → IDs in a single query
    requested: Set[str] = {p.value for p in payload.permissions}
    try:
        rows = await db.execute(
            select(Permission.id, Permission.action)
            .where(Permission.action.in_(requested))
        )
    except SQLAlchemyError as e:
        logger.error("DB error loading permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error loading permissions."
        )

    action_to_id = {action: pid for pid, action in rows.all()}
    invalid = requested - set(action_to_id)
    if invalid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid permission(s): {', '.join(sorted(invalid))}"
        )

    perm_ids = list(action_to_id.values())

    # 7. Delete matching rows in one pass
    try:
        await db.execute(
            delete(UserPermission).where(
                and_(
                    UserPermission.user_id == target_user_id,
                    UserPermission.module_id == payload.module_id,
                    UserPermission.permission_id.in_(perm_ids),
                )
            )
        )

        # 🆕 Nullify `assigned_by` if current user was the assigner
        await db.execute(
            update(UserPermission)
            .where(
                and_(
                    UserPermission.user_id == target_user_id,
                    UserPermission.module_id == payload.module_id,
                    UserPermission.permission_id.in_(perm_ids),
                    UserPermission.assigned_by == current_user.id
                )
            )
            .values(assigned_by=None)
        )

        await db.commit()

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Error removing permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during permission removal."
        )

    return {
        "detail": f"Removed {len(perm_ids)} permission(s) successfully.",
        "removed": sorted(action_to_id.keys())
    }
