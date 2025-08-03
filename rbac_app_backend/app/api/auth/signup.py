# app/api/auth/signup.py

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.auth import SignupRequest, MessageResponse
from app.services.auth_service import signup_superadmin
from app.db.session import get_db

router = APIRouter(tags=["Auth"])

@router.post("/signup", response_model=MessageResponse)
async def signup(
    data: SignupRequest,
    db: AsyncSession = Depends(get_db),
) -> MessageResponse:
    return await signup_superadmin(db=db, data=data)
