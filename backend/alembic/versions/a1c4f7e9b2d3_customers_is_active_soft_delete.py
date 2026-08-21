"""customers_is_active soft delete

Revision ID: a1c4f7e9b2d3
Revises: 9acf389999c7
Create Date: 2026-08-20

Añade is_active a customers para soportar borrado lógico:
un cliente con historial comercial (tickets/OTs/cotizaciones) no se puede
borrar físicamente (FKs NOT NULL), así que se anonimiza y se oculta.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1c4f7e9b2d3'
down_revision: Union[str, Sequence[str], None] = '9acf389999c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Soft delete de clientes
    op.add_column('customers', sa.Column('is_active', sa.Boolean(), nullable=True, server_default=sa.text('true')))
    # Unique POR EMPRESA (antes global: dos empresas no podían compartir RUT/patente).
    # Nota: los unique originales son ÍNDICES únicos (create_index unique=True),
    # no constraints → se dropean con drop_index.
    op.drop_index('ix_customers_rut', table_name='customers')
    op.create_unique_constraint('uix_customer_company_rut', 'customers', ['company_id', 'rut'])
    op.drop_index('ix_vehicles_license_plate', table_name='vehicles')
    op.create_unique_constraint('uix_vehicle_company_plate', 'vehicles', ['company_id', 'license_plate'])


def downgrade() -> None:
    op.drop_constraint('uix_vehicle_company_plate', 'vehicles', type_='unique')
    op.create_index('ix_vehicles_license_plate', 'vehicles', ['license_plate'], unique=True)
    op.drop_constraint('uix_customer_company_rut', 'customers', type_='unique')
    op.create_index('ix_customers_rut', 'customers', ['rut'], unique=True)
    op.drop_column('customers', 'is_active')
