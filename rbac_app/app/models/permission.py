# app/models/permission.py

from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    action = Column(String, nullable=False)

    __table_args__ = (
        UniqueConstraint("module_id", "action", name="_module_action_uc"),
    )

    module = relationship("Module", back_populates="permissions")
