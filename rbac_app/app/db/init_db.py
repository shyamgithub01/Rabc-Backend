# app/db/init_db.py

from app.db.session import AsyncSessionLocal
from app.models.module import Module
from app.models.permission import Permission
from sqlalchemy.future import select
import logging

# Define the global permission actions
valid_actions = ["add", "edit", "delete", "view"]

# Define the module names you want in the system
module_names = ["dashboard", "users", "mod1", "mod2", "mod3", "mod4", "mod5", "mod6"]

async def init_db():
    async with AsyncSessionLocal() as session:
        # Insert modules if not already present
        for name in module_names:
            result = await session.execute(select(Module).where(Module.name == name))
            module = result.scalar_one_or_none()
            if not module:
                session.add(Module(name=name))
                logging.info(f"Added module: {name}")

        # Insert only the 4 global permissions once
        for action in valid_actions:
            result = await session.execute(select(Permission).where(Permission.action == action))
            permission = result.scalar_one_or_none()
            if not permission:
                session.add(Permission(action=action))
                logging.info(f"Added permission: {action}")

        await session.commit()
        logging.info("Database initialization complete.")
