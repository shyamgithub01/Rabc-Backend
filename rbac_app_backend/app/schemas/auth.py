from typing import Annotated, Literal
from enum import Enum

from pydantic import BaseModel, EmailStr, constr, field_validator, ConfigDict


# Mirror your DB RoleEnum values exactly (or import from your models if you prefer)
class RoleLiteral(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    user = "user"


# Common constraints
UsernameStr = Annotated[
    str,
    constr(
        min_length=1,
        max_length=50,
        pattern=r"^\S+$",   # no spaces; letters/numbers/underscores/dots etc. allowed
    ),
]

# NOTE: keep min_length=8 to match common security expectations
PasswordStr = Annotated[str, constr(min_length=8, max_length=128)]


class SignupRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,  # trims username/email/password
        populate_by_name=True,
        extra="forbid",
        json_schema_extra={
            "example": {
                "username": "jane_doe",
                "email": "jane@example.com",
                "password": "StrongPassw0rd!",
            }
        },
    )

    username: UsernameStr
    email: EmailStr
    password: PasswordStr

    # Normalize email to lowercase
    @field_validator("email", mode="before")
    @classmethod
    def _lower_email(cls, v):
        return v.lower() if isinstance(v, str) else v


class LoginRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        extra="forbid",
        json_schema_extra={"example": {"email": "jane@example.com", "password": "StrongPassw0rd!"}},
    )

    email: EmailStr
    # Allow empty-like passwords? No. Enforce at least 1 char (or 8 if you prefer).
    password: Annotated[str, constr(min_length=1)]

    @field_validator("email", mode="before")
    @classmethod
    def _lower_email(cls, v):
        return v.lower() if isinstance(v, str) else v


class TokenResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    role: RoleLiteral
    # Optional: include expires_in (seconds) or exp (unix) if you want
    # expires_in: Optional[int] = None
    # exp: Optional[int] = None


class TokenPayload(BaseModel):
    # Standard JWT claims you'd expect the frontend to decode
    sub: str          # user email
    exp: int          # unix timestamp
    role: RoleLiteral
    # iat/nbf can be added if your token generator sets them
    # iat: Optional[int] = None
    # nbf: Optional[int] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    message: str
