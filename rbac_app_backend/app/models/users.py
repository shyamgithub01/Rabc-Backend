from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base_class import Base
from app.schemas.create_admin import RoleEnum

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_users = relationship("User", remote_side=[id], backref="creator")
    
