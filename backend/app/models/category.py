from __future__ import annotations

"""Modelo de una categoría del catálogo.

Las categorías agrupan productos similares, como ropa, accesorios o calzado.
"""

from sqlalchemy import Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # Identificador de la categoría.
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)  # Nombre de la categoría.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)  # Descripción opcional.

    # Lista de productos que pertenecen a esta categoría.
    products: Mapped[list["Product"]] = relationship(back_populates="category")

