# app/api/auth/signup.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth import SignupRequest, TokenResponse
from app.services.auth_service import signup_superadmin
from app.db.session import get_db

router = APIRouter(tags=["Auth"])

@router.post("/auth/signup", response_model=TokenResponse)
async def signup(
    data: SignupRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    return await signup_superadmin(db=db, data=data)
