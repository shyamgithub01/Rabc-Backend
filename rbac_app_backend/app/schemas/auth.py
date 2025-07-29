from pydantic import BaseModel, EmailStr, constr
from typing import Annotated 

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: Annotated[str, constr(min_length=6)]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str  

class TokenPayload(BaseModel):
    sub: str
    exp: int
    role: str  

class MessageResponse(BaseModel):
    message: str
