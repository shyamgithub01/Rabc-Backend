from typing import List
from enum import Enum

from pydantic import BaseModel, Field, ConfigDict, field_validator



class PermissionEnum(str, Enum):
    ADD = "add"
    EDIT = "edit"
    DELETE = "delete"
    VIEW = "view"


class RoleEnum(str, Enum):
    superadmin = "superadmin"
    admin = "admin"
    user = "user"



class AssignPermissionRequest(BaseModel):
    """
    For endpoints that take user_id in the body.
    """
    model_config = ConfigDict(extra="forbid")
    

    module_id: int
    permissions: List[PermissionEnum] = Field(min_length=1)

    @field_validator("permissions")
    @classmethod
    def _dedupe_permissions(cls, v: List[PermissionEnum]) -> List[PermissionEnum]:
        # Preserve order while removing duplicates
        return list(dict.fromkeys(v))


class AssignPermissionToModuleRequest(BaseModel):
    """
    For endpoints where user_id is in the path (e.g. /admins/{user_id}/permissions).
    """
    model_config = ConfigDict(extra="forbid")
    module_id: int
    permissions: List[PermissionEnum] = Field(min_length=1)

    @field_validator("permissions")
    @classmethod
    def _dedupe_permissions(cls, v: List[PermissionEnum]) -> List[PermissionEnum]:
        return list(dict.fromkeys(v))


class RemovePermissionRequest(BaseModel):
    """
    Body for removing permissions when user_id comes from path.
    """
    model_config = ConfigDict(extra="forbid")
    module_id: int
    permissions: List[PermissionEnum] = Field(min_length=1)

    @field_validator("permissions")
    @classmethod
    def _dedupe_permissions(cls, v: List[PermissionEnum]) -> List[PermissionEnum]:
        return list(dict.fromkeys(v))


class UserModulePermissionResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    module_name: str
    permissions: List[str]


class UserPermissionsResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    user_id: int
    
    permissions: List[UserModulePermissionResponse]