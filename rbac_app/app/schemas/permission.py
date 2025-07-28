from pydantic import BaseModel
from typing import List
from enum import Enum

class PermissionEnum(str, Enum):
    ADD = "add"
    EDIT = "edit"
    DELETE = "delete"
    VIEW = "view"

class AssignPermissionRequest(BaseModel):
    user_id: int
    module_id: int
    permissions: List[PermissionEnum]


class UserModulePermissionResponse(BaseModel):
    module_name: str
    permissions: List[str]

class UserPermissionsResponse(BaseModel):
    user_id: int
    user_name: str
    permissions: List[UserModulePermissionResponse]

class AssignPermissionRequest(BaseModel):
    user_id: int
    module_id: int
    permissions: List[PermissionEnum]

class AssignPermissionRequest(BaseModel):
    module_id: int
    permissions: List[PermissionEnum]
