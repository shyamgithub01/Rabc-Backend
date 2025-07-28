from pydantic import BaseModel, EmailStr
from pydantic.config import ConfigDict
from typing import Optional, List
from enum import Enum

class RoleEnum(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    user = "user"

class CreateAdminRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.admin  

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    # role: RoleEnum
    created_by: Optional[int] = None
    

    model_config = ConfigDict(from_attributes=True)

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
    role: str
    modules: List[ModulePermissionInfo]
