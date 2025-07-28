# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.users.delete_permission import router as delete_permision
from app.api.auth import login, signup
from app.db.init_db import init_db
from app.core.config import settings
from app.api.users.create_admins import router as create_admin
from app.api.users.permissions import router as manage_permission
from app.api.users.user_create import router as create_user
from app.api.users.user_with_permissions import router as users_with_permission
from app.api.users.user_permission_assign import router as users_permission_assign



# Lifespan context for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()  # Startup logic
    yield             # Shutdown logic (if needed)

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# CORS configuration (you can restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # TODO: Replace with frontend URL(s) in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check route


# Include auth routes
app.include_router(login.router)
app.include_router(signup.router)
app.include_router(create_admin)
app.include_router(manage_permission)
app.include_router(delete_permision)
app.include_router(users_with_permission)
app.include_router(users_permission_assign)

app.include_router(create_user)






