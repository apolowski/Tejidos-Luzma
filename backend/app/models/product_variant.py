from __future__ import annotations

"""Modelo de variante de producto.

Una variante representa una combinación concreta de talla/color con su
propio stock para un producto determinado.
"""

from sqlalchemy import ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class ProductVariant(Base):
    __tablename__ = "product_variants"
    # Evita duplicar la misma combinación talla-color para el mismo producto.
    __table_args__ = (
        UniqueConstraint("product_id", "size", "color", name="uq_product_variant_product_size_color"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # Identificador de la variante.
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False, index=True)
    size: Mapped[str] = mapped_column(String(32), nullable=False, index=True)  # Talla de la variante.
    color: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # Color de la variante.
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # Unidades disponibles.

    # Relación con el producto al que pertenece esta variante.
    product: Mapped["Product"] = relationship(back_populates="variants")

