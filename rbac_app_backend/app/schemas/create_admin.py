from typing import Annotated, List, Optional
from enum import Enum

from pydantic import BaseModel, EmailStr, constr, field_validator, ConfigDict


# Mirror your DB enum values (or import RoleEnum from your models if you prefer)
class RoleEnum(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    user = "user"


UsernameStr = Annotated[
    str,
    constr(min_length=1, max_length=50, pattern=r"^\S+$"),  # 1–50 chars, no spaces
]

# Keep server-side rule minimal; complexity can be client-side
PasswordStr = Annotated[str, constr(min_length=8, max_length=128)]


class CreateAdminRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid",
        json_schema_extra={
            "example": {
                "username": "admin_01",
                "email": "admin@example.com",
                "password": "StrongPassw0rd!",
            }
        },
    )

    username: UsernameStr
    email: EmailStr
    password: PasswordStr

    @field_validator("email", mode="before")
    @classmethod
    def _lower_email(cls, v):
        return v.lower() if isinstance(v, str) else v


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="forbid")

    id: int
    username: str
    email: EmailStr
    created_by: Optional[int] = None
    # role: RoleEnum  # uncomment if you want role in this response


class ListUsersResponse(BaseModel):
    users: List[UserResponse]


class ModulePermissionInfo(BaseModel):
    module_name: str
    permissions: List[str]


class UserWithPermissionsResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    created_by: Optional[int] = None
    role: str  # or RoleEnum
    modules: List[ModulePermissionInfo]
