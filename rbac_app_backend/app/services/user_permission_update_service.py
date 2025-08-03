import logging

from fastapi import HTTPException, status
from sqlalchemy import select
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
    # 1. Role check
    if current_user.role not in (RoleEnum.admin, RoleEnum.superadmin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins or superadmins can update permissions."
        )

    # 2. Target user must exist
    target = await db.get(User, target_user_id)
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target user not found.")

    # 2.5 Only update normal users
    if target.role != RoleEnum.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Permissions can only be updated for users, not for admins or superadmins."
        )

    # 3. Module must exist
    module = await db.get(Module, payload.module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")

    # 4. Permissions list must not be empty
    requested_actions = {p.value for p in payload.permissions}
    if not requested_actions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Permissions list cannot be empty."
        )

    # 5. Admin permission restriction per module
    if current_user.role == RoleEnum.admin:
        result = await db.execute(
            select(Permission.action)
            .join(UserPermission, UserPermission.permission_id == Permission.id)
            .where(
                UserPermission.user_id == current_user.id,
                UserPermission.module_id == payload.module_id
            )
        )
        admin_actions = set(result.scalars().all())

        if not admin_actions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have access to manage this module."
            )

        unauthorized_actions = requested_actions - admin_actions
        if unauthorized_actions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"You cannot assign the following permission(s) you do not hold: "
                    f"{', '.join(sorted(unauthorized_actions))}"
                )
            )

    # 6. Check already assigned permissions for this module
    result = await db.execute(
        select(Permission.action)
        .join(UserPermission, UserPermission.permission_id == Permission.id)
        .where(
            UserPermission.user_id == target_user_id,
            UserPermission.module_id == payload.module_id
        )
    )
    already_assigned = set(result.scalars().all())

    # 7. Reject if even one permission is already assigned (strict mode)
    duplicates = requested_actions & already_assigned
    if duplicates:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot assign already granted permission(s): {', '.join(sorted(duplicates))}"
        )

    # 8. Validate requested permissions exist in DB
    result = await db.execute(
        select(Permission).where(Permission.action.in_(tuple(requested_actions)))
    )
    permission_objs = result.scalars().all()

    # 9. Validate none are missing
    found_actions = {perm.action for perm in permission_objs}
    missing = requested_actions - found_actions
    if missing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid permission(s): {', '.join(sorted(missing))}"
        )

    # ✅ 10. Insert only new permissions (do not delete)
    try:
        new_permissions = [
            UserPermission(
                user_id=target_user_id,
                module_id=payload.module_id,
                permission_id=perm.id,
                assigned_by=current_user.id
            )
            for perm in permission_objs
        ]
        db.add_all(new_permissions)
        await db.commit()
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("DB error inserting new permissions", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error while assigning new permissions."
        )

    return {
        "detail": (
            f"Permissions for user {target_user_id} on module {payload.module_id} "
            f"updated to: {', '.join(sorted(requested_actions))}."
        )
    }
