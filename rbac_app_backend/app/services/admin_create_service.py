import re
import logging

from fastapi import HTTPException, status
from sqlalchemy import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError, SQLAlchemyError

from app.models.users import User, RoleEnum
from app.core.security import get_password_hash
from app.schemas.create_admin import CreateAdminRequest

logger = logging.getLogger(__name__)

EMAIL_REGEX = re.compile(r"^[^@]+@[^@]+\.[^@]+$")
UPPER_REGEX = re.compile(r"[A-Z]")
LOWER_REGEX = re.compile(r"[a-z]")
DIGIT_REGEX = re.compile(r"\d")
SPECIAL_REGEX = re.compile(r"[^A-Za-z0-9]")

async def create_admin(
    data: CreateAdminRequest,
    current_user: User,
    db: AsyncSession
) -> User:
    # 1. Authorization
    if current_user.role is not RoleEnum.superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only superadmins can create admins."
        )

    # 2. Input validation (as before)…
    username = data.username.strip()
    email = data.email.strip()
    password = data.password or ""

    if not username:
        raise HTTPException(422, "Username cannot be blank.")
    if " " in username or len(username) > 50:
        raise HTTPException(422, "Username must be 1–50 characters, no spaces.")
    if not EMAIL_REGEX.match(email):
        raise HTTPException(422, "Invalid email format.")
    if len(password) < 8:
        raise HTTPException(422, "Password must be at least 8 characters.")
    if not UPPER_REGEX.search(password):
        raise HTTPException(422, "Password needs at least one uppercase letter.")
    if not LOWER_REGEX.search(password):
        raise HTTPException(422, "Password needs at least one lowercase letter.")
    if not DIGIT_REGEX.search(password):
        raise HTTPException(422, "Password needs at least one digit.")
    if not SPECIAL_REGEX.search(password):
        raise HTTPException(422, "Password needs at least one special character.")

    # 3. Hash the password
    hashed_password = get_password_hash(password)

    # 4. Build INSERT…RETURNING
    stmt = (
        insert(User)
        .values(
            username=username,
            email=email,
            hashed_password=hashed_password,
            role=RoleEnum.admin,
            created_by=current_user.id,
        )
        .returning(User)
    )

    # 5. Execute + commit/rollback manually
    try:
        result = await db.execute(stmt)
        await db.commit()
        return result.scalar_one()

    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this username or email already exists."
        )

    except SQLAlchemyError as e:
        await db.rollback()
        logger.error("Database error creating admin", exc_info=e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected database error."
        )
