from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class OrderItemOut(BaseModel):
    id: int
    product_variant_id: int
    quantity: int
    price: float

    model_config = {"from_attributes": True}


class OrderOut(BaseModel):
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
    order: OrderOut
    message: str

