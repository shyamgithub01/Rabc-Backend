# app/api/auth/login.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth import LoginRequest, TokenResponse
from app.services.auth_service import login_user
from app.db.session import get_db

router = APIRouter(tags=["Auth"])

@router.post("/auth/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await login_user(db=db, data=data)
