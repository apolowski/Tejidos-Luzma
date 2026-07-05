from __future__ import annotations

"""Modelo del carrito de compras del usuario.

Cada usuario tiene un carrito único donde se guardan los productos que
quiere comprar antes de crear una orden.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class Cart(Base):
    __tablename__ = "cart"
    # Asegura que cada usuario tenga un único carrito.
    __table_args__ = (UniqueConstraint("user_id", name="uq_cart_user_id"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # Identificador del carrito.
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relación con el usuario dueño del carrito.
    # back_populates="cart" indica que en la clase User existe un atributo llamado cart que apunta aquí.
    user: Mapped["User"] = relationship(back_populates="cart")
    # Lista de productos agregados al carrito.
    items: Mapped[list["CartItem"]] = relationship(back_populates="cart", cascade="all, delete-orphan")

