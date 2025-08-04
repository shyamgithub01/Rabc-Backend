"""Make assigned_by nullable in user_permissions

Revision ID: 3957fdf5892d
Revises: 6cf76926bd5a
Create Date: 2025-08-04 11:32:00.022439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3957fdf5892d'
down_revision: Union[str, Sequence[str], None] = '6cf76926bd5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
