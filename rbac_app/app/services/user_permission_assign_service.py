from typing import List
import logging

from fastapi import HTTPException, status
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from app.models.users import User, RoleEnum
from app.models.module import Module
from app.models.permission import Permission
from app.models.user_permission import UserPermission
from app.schemas.user_permission_assign_schema import AssignUserPermissionRequest

logger = logging.getLogger(__name__)

async def assign_permissions_to_user(
    target_user_id: int,
    payload: AssignUserPermissionRequest,
    current_user: User,
    db: AsyncSession
):
    """
    Replace a user's permissions on a module.
    - Only admins or superadmins may call.
    - Admins may only assign within modules they have access to.
    - Clears existing perms for target_user+module, then bulk‑inserts the new ones.
    """

    # 1. Authorization
    if current_user.role not in (RoleEnum.superadmin, RoleEnum.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or superadmins can assign permissions."
        )

    # 2. Target user exists & isn’t a superadmin
    target_user = await db.get(User, target_user_id)
    if not target_user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="User not found.")
    if target_user.role is RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify permissions for a superadmin."
        )

    # 3. Module exists
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Module not found.")

    # 4. If caller is admin, ensure they have at least one permission on this module
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
                detail="You do not have access to manage this module."
            )

    # 5. Must specify at least one permission
    if not payload.permissions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one permission must be specified."
        )

    # 6. Deduplicate and resolve permission IDs
    requested = {p.value for p in payload.permissions}
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
    missing = requested - set(action_to_id)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid permission(s): {', '.join(sorted(missing))}"
        )

    permission_ids = list(action_to_id.values())

    # 7. Delete old + insert new, manual commit/rollback
    try:
        # clear existing perms
        await db.execute(
            delete(UserPermission).where(
                UserPermission.user_id == target_user_id,
                UserPermission.module_id == payload.module_id
            )
        )

        # bulk insert new perms
        entries = [
            {
                "user_id":       target_user_id,
                "module_id":     payload.module_id,
                "permission_id": pid,
                "assigned_by":   current_user.id
            }
            for pid in permission_ids
        ]
        if entries:
            await db.execute(UserPermission.__table__.insert(), entries)

        await db.commit()

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Error assigning permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error during permission assignment."
        )

    return {"detail": f"Assigned {len(permission_ids)} permission(s) successfully."}
