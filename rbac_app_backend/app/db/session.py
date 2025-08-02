# app/db/session.py
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
)
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

# Build server_settings dict (only include stmt timeout if set)
server_settings = {"application_name": "rbac_app"}
if settings.DB_STMT_TIMEOUT_MS > 0:
    server_settings["statement_timeout"] = str(settings.DB_STMT_TIMEOUT_MS)

# Create the async engine with tuned pools
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,
    connect_args={"server_settings": server_settings},
)

# One session factory for all your dependencies
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency — yields a session and always closes it.
    """
    async with AsyncSessionLocal() as session:
        yield session
