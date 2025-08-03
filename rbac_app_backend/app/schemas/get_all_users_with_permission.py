from pydantic import BaseModel, EmailStr
from typing import Optional, List

class ModulePermissionInfo(BaseModel):
    module_name: str
    permissions: List[str]

class UserWithPermissionsResponse(BaseModel):
    id: int
    
    email: EmailStr
    role: str
    created_by: Optional[int] = None
    modules: List[ModulePermissionInfo]
