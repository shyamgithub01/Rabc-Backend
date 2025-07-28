from pydantic import BaseModel
from typing import List
from enum import Enum


class PermissionEnum(str, Enum):
    add = "add"
    edit = "edit"
    delete = "delete"
    view = "view"


class AssignUserPermissionRequest(BaseModel):
    module_id: int
    permissions: List[PermissionEnum]
