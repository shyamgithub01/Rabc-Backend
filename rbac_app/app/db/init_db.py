# app/db/init_db.py

from app.db.session import AsyncSessionLocal
from app.models.module import Module
from app.models.permission import Permission
from app.permissions.module_wise_permissions import module_permissions
from sqlalchemy.future import select

async def init_db():
    async with AsyncSessionLocal() as session:
        for module_name, actions in module_permissions.items():
            # Check if module already exists
            result = await session.execute(select(Module).where(Module.name == module_name))
            existing_module = result.scalar_one_or_none()

            if existing_module:
                module_obj = existing_module
            else:
                module_obj = Module(name=module_name)
                session.add(module_obj)
                await session.flush()  # get module_obj.id

            # Insert permissions for this module
            for action in actions:
                result = await session.execute(
                    select(Permission).where(
                        Permission.module_id == module_obj.id,
                        Permission.action == action
                    )
                )
                existing_permission = result.scalar_one_or_none()
                if not existing_permission:
                    session.add(Permission(module_id=module_obj.id, action=action))

        await session.commit()
