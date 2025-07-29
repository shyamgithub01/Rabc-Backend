import re
import asyncio
import logging

from fastapi import HTTPException, status
from sqlalchemy import insert, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.users import User, RoleEnum
from app.schemas.user_create_schema import CreateUserRequest
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

# Validation regexes
EMAIL_REGEX   = re.compile(r"^[^@]+@[^@]+\.[^@]+$")
UPPER_REGEX   = re.compile(r"[A-Z]")
LOWER_REGEX   = re.compile(r"[a-z]")
DIGIT_REGEX   = re.compile(r"\d")
SPECIAL_REGEX = re.compile(r"[^A-Za-z0-9]")

async def create_user(
    payload: CreateUserRequest,
    current_user: User,
    db: AsyncSession
) -> User:
    # 1. Authorization
    if current_user.role not in (RoleEnum.superadmin, RoleEnum.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins or admins can create users."
        )

    # 2. Normalize + validate inputs
    username = payload.username.strip()
    email    = payload.email.strip().lower()
    password = payload.password or ""

    if not username:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Username cannot be blank.")
    if " " in username or len(username) > 50:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Username must be 1–50 chars with no spaces.")
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Invalid email format.")
    if len(password) < 8:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Password must be at least 8 characters.")
    if not UPPER_REGEX.search(password):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Password must include at least one uppercase letter.")
    if not LOWER_REGEX.search(password):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Password must include at least one lowercase letter.")
    if not DIGIT_REGEX.search(password):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Password must include at least one digit.")
    if not SPECIAL_REGEX.search(password):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY,
                            "Password must include at least one special character.")

    # 3. Kick off hashing in background
    hash_task = asyncio.create_task(
        asyncio.to_thread(get_password_hash, password)
    )

    # 4. Build INSERT…RETURNING to get back the new user in one go
    stmt = (
        insert(User)
        .values(
            username=username,
            email=email,
            hashed_password=await hash_task,
            role=RoleEnum.user,
            created_by=current_user.id
        )
        .returning(
            User.id,
            User.username,
            User.email,
            User.role,
            User.created_by
        )
    )

    # 5. Execute & commit (single DB round‑trip)
    try:
        result = await db.execute(stmt)
        await db.commit()
    except IntegrityError:
        await db.rollback()
        # figure out if it was username or email conflict
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already in use."
        )
    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Error creating user", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected database error."
        )

    # 6. Construct a lightweight User object without refresh
    row = result.one()
    new_user = User(
        id           = row.id,
        username     = row.username,
        email        = row.email,
        hashed_password="",  # never expose the hash
        role         = row.role,
        created_by   = row.created_by
    )
    return new_user
