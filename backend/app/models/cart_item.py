from __future__ import annotations

"""Modelo de un producto dentro del carrito del usuario.

Cada fila representa un artículo que el usuario quiere comprar.
"""

from sqlalchemy import ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config.database import Base


class CartItem(Base):
    __tablename__ = "cart_items"
    # Evita que el mismo producto/variante aparezca dos veces en el mismo carrito.
    __table_args__ = (UniqueConstraint("cart_id", "product_variant_id", name="uq_cart_item_cart_variant"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # Identificador del item.
    cart_id: Mapped[int] = mapped_column(ForeignKey("cart.id", ondelete="CASCADE"), nullable=False, index=True)
    product_variant_id: Mapped[int] = mapped_column(
        ForeignKey("product_variants.id", ondelete="RESTRICT"), nullable=False, index=True
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)  # Cantidad del producto en el carrito.

    # Relación con el carrito padre.
    cart: Mapped["Cart"] = relationship(back_populates="items")
    # Relación con la variante concreta del producto.
    variant: Mapped["ProductVariant"] = relationship()

