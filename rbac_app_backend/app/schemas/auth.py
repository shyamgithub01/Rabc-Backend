from typing import Annotated, Literal, Optional
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

# Keep min_length=8 to match common security expectations
PasswordStr = Annotated[str, constr(min_length=8, max_length=128)]


class SignupRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,  
        populate_by_name=True,
        extra="forbid",
        json_schema_extra={
            "example": {
                

                "email": "jane@example.com",
                "password": "StrongPassw0rd!",
            }
        },
    )

    
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
        json_schema_extra={
            "example": {"email": "jane@example.com", "password": "StrongPassw0rd!"}
        },
    )

    email: EmailStr
    # Use the same policy as signup (≥ 8 chars) for consistency
    password: PasswordStr

    @field_validator("email", mode="before")
    @classmethod
    def _lower_email(cls, v):
        return v.lower() if isinstance(v, str) else v


class TokenResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "role": "admin",
                "expires_in": 3600,
                "exp": 1735689600,
            }
        },
    )
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    role: RoleLiteral

    # Optional: include expires_in (seconds) or exp (unix) if you want
    expires_in: Optional[int] = None
    exp: Optional[int] = None


class TokenPayload(BaseModel):
    # Standard JWT claims you'd expect the frontend to decode
    sub: str          # user email
    exp: int          # unix timestamp
    role: RoleLiteral
    # iat/nbf can be added if your token generator sets them
    # iat: Optional[int] = None
    # nbf: Optional[int] = None


class MessageResponse(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        json_schema_extra={"example": "Superadmin created successfully."},
    )
    message: str
