from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from app.db.base_class import Base

class UserPermission(Base):
    __tablename__ = "user_permissions"

    __table_args__ = (
        UniqueConstraint("user_id", "module_id", "permission_id", name="uix_user_module_permission"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"))
    permission_id = Column(Integer, ForeignKey("permissions.id", ondelete="CASCADE"))
    assigned_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

