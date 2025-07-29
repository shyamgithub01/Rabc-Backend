from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.init_db import init_db

# Import your routers
from app.api.auth import login, signup
from app.api.users.create_admins import router as create_admin
from app.api.users.admin_permission_update import router as admin_manage_permission
from app.api.users.admin_permission_delete import router as delete_permission
from app.api.users.create_user import router as create_user
from app.api.users.user_with_permissions import router as users_with_permission
from app.api.users.user_permission_assign import router as users_permission_assign
from app.api.users.user_permission_delete import router as users_permission_delete
from app.api.users.user_permission_update import router as users_permission_update


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(login.router)
app.include_router(signup.router)
app.include_router(create_admin)
app.include_router(users_with_permission)
app.include_router(admin_manage_permission)
app.include_router(delete_permission)
app.include_router(create_user)
app.include_router(users_permission_assign)
app.include_router(users_permission_delete)
app.include_router(users_permission_update)


# ✅ Add Swagger UI Bearer Token auth
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="RBAC API using JWT Bearer token",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"].values():
        for method in path.values():
            method["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

# 🔐 Apply override to Swagger/OpenAPI
app.openapi = custom_openapi
