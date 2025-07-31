from typing import Annotated
from pydantic import BaseModel, EmailStr, ConfigDict, constr, field_validator


UsernameStr = Annotated[
    str,
    constr(min_length=1, max_length=50, pattern=r"^\S+$")  # 1–50 chars, no spaces
]

PasswordStr = Annotated[str, constr(min_length=8, max_length=128)]


class CreateUserRequest(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,   # trims username/email/password
        extra="forbid",
        json_schema_extra={
            "example": {
                "username": "john_doe",
                "email": "john@example.com",
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
