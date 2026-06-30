"""create slides storage bucket

Revision ID: a3ce8f557b8e
Revises: 5b7274f2c8b4
Create Date: 2026-06-30 17:22:48.991182

"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a3ce8f557b8e"
down_revision: Union[str, Sequence[str], None] = "5b7274f2c8b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        """
        insert into storage.buckets (id, name, public)
        values ('slides', 'slides', false)
        on conflict (id) do update
        set
            name = excluded.name,
            public = excluded.public
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("delete from storage.buckets where id = 'slides'")
