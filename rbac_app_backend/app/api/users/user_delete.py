from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.session import get_db
from app.core.dependencies import get_current_user
from app.models.users import User
from app.schemas.permission import RoleEnum  # Ensure RoleEnum is available

router = APIRouter(tags=["User Deletion"])

@router.delete(
    "/users/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a user account (admin only)"
)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ Only admins can delete users
    if current_user.role != RoleEnum.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins are allowed to delete users."
        )

    # Fetch user by ID
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Prevent deleting other admins or superadmins
    if user.role != RoleEnum.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only delete users with the role 'user'."
        )

    # Optional: allow only deleting users they created
    if user.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete users you created."
        )

    await db.delete(user)
    await db.commit()

    return {"message": f"User with ID {user_id} has been deleted."}
