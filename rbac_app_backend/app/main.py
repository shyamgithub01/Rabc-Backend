
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.core.config import settings
from app.db.init_db import init_db

# Routers
from app.api.auth import login, signup
from app.api.users.create_admins import router as create_admin
from app.api.users.admin_permission_update import router as admin_manage_permission
from app.api.users.admin_delete import router as delete_permission
from app.api.users.create_user import router as create_user
from app.api.users.user_with_permissions import router as users_with_permission
from app.api.users.user_delete import router as users_permission_delete
from app.api.users.user_permission_update import router as users_permission_update


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database, seed baseline data, etc.
    await init_db()
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    lifespan=lifespan,
   
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Health ---
@app.get("/", tags=["health"])
async def health():
    return {"status": "ok"}


# --- Include routers ---
app.include_router(login.router)                  
app.include_router(signup.router)                 
app.include_router(create_admin)
app.include_router(users_with_permission)
app.include_router(admin_manage_permission)
app.include_router(delete_permission)
app.include_router(create_user)



app.include_router(users_permission_delete)
app.include_router(users_permission_update)


# --- OpenAPI with BearerAuth only on protected endpoints ---
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="RBAC API using JWT Bearer token",
        routes=app.routes,
    )

    # Define BearerAuth scheme
    openapi_schema.setdefault("components", {}).setdefault("securitySchemes", {})
    openapi_schema["components"]["securitySchemes"]["BearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }

    # Paths that should remain PUBLIC (no auth shown in docs)
    # Adjust if your auth routes have prefixes.
    PUBLIC_PATHS = {
        "/login",
        "/signup",
        "/",          
        
    }

    # Apply security to all non-public operations
    for path, methods in openapi_schema.get("paths", {}).items():
        for method_name, operation in methods.items():
            if path not in PUBLIC_PATHS:
                # Mark as requiring Bearer token
                operation["security"] = [{"BearerAuth": []}]
            else:
                # Explicitly indicate no auth requirement in docs
                operation["security"] = []

    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Apply the OpenAPI override
app.openapi = custom_openapi




