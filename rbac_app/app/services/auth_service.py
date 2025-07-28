from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from fastapi import HTTPException, status

# ✅ Fixed import path — removed 'rbac_app'
from app.models.users import User, RoleEnum
from app.schemas.auth import SignupRequest, LoginRequest, TokenResponse , MessageResponse
from app.core.security import get_password_hash, verify_password, create_access_token


async def signup_superadmin(
    db: AsyncSession,
    data: SignupRequest,
) -> MessageResponse:
    # Check if any superadmin exists already
    result = await db.execute(
        select(User).where(User.role == RoleEnum.superadmin)
    )
    existing_superadmin = result.scalar_one_or_none()
    if existing_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin already exists.",
        )

    hashed_password = get_password_hash(data.password)
    new_user = User(
        username=data.username,
        email=data.email,
        hashed_password=hashed_password,
        role=RoleEnum.superadmin,
    )

    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return MessageResponse(message="Superadmin created successfully. Please log in to continue.")

async def login_user(
    db: AsyncSession,
    data: LoginRequest,
) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    token = create_access_token(subject=user.email)
    return TokenResponse(access_token=token)
