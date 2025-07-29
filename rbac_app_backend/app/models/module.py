from sqlalchemy import Column, Integer, String
from app.db.base_class import Base

class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
