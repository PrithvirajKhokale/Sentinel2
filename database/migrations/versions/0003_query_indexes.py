"""Index report-scoped reads without changing immutable source records."""
from alembic import op

revision = "0003_query_indexes"
down_revision = "0002_no_truncate"
branch_labels = None
depends_on = None


def upgrade():
    op.create_index("ix_snapshots_revision_month_code", "monthly_snapshots",
                    ["version", "report_month", "project_code"])
    op.create_index("ix_comparisons_revision_months_code", "adjacent_comparisons",
                    ["version", "before_month", "after_month", "project_code"])


def downgrade():
    op.drop_index("ix_comparisons_revision_months_code", table_name="adjacent_comparisons")
    op.drop_index("ix_snapshots_revision_month_code", table_name="monthly_snapshots")
