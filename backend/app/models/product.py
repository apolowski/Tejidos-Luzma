from __future__ import annotations

"""Modelo de producto del catálogo.

Cada producto pertenece a una categoría y puede tener múltiples variantes,
como talla, color y stock.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # Identificador del producto.
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)  # Nombre del producto.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)  # Descripción opcional del producto.
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)  # Precio del producto.
    stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)  # Stock general; las variantes también pueden tener stock.
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id", ondelete="RESTRICT"), nullable=False, index=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)  # Ruta o URL de la imagen.
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relación con la categoría a la que pertenece.
    category: Mapped["Category"] = relationship(back_populates="products")
    # Variantes del producto, por ejemplo talla o color.
    variants: Mapped[list["ProductVariant"]] = relationship(back_populates="product", cascade="all, delete-orphan")

