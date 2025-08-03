from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.permission import RoleEnum  # Ensure RoleEnum is defined

router = APIRouter(tags=["Admin Deletion"])

@router.delete(
    "/admins/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete an admin user (superadmin only)"
)
async def delete_admin(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure only Superadmin can delete admins
    if current_user.role != RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can delete admin users"
        )

    # Fetch user by ID
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if the user is actually an admin
    if user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only admin users can be deleted via this route"
        )

    await db.delete(user)
    await db.commit()

    return {"message": f"Admin user with ID {user_id} has been deleted."}
