from __future__ import annotations

"""Esquemas para validar datos de órdenes y pedidos.

Definen cómo se devuelve una compra hecha por el usuario.
"""

from datetime import datetime

from pydantic import BaseModel


class OrderItemOut(BaseModel):
    # Forma de devolver un producto incluido en una orden.
    id: int
    product_variant_id: int
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
    # Forma de devolver una orden completa al cliente.
    id: int
    user_id: int
    status: str
    total_price: float
    currency: str
    shipping_address: str | None = None
    shipping_phone: str | None = None
    created_at: datetime
    items: list[OrderItemOut]

    model_config = {"from_attributes": True}


class OrderCreateOut(BaseModel):
    # Respuesta que se devuelve al crear una orden.
    order: OrderOut
    message: str

