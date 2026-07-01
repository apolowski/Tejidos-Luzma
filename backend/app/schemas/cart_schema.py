from __future__ import annotations

from pydantic import BaseModel, Field


class CartItemOut(BaseModel):
    id: int
    product_variant_id: int
    quantity: int
    product_id: int
    product_name: str
    size: str
    color: str
    unit_price: float
    image_url: str | None = None


class CartOut(BaseModel):
    id: int
    items: list[CartItemOut]
    subtotal: float
    currency: str = "COP"


class CartAddIn(BaseModel):
    product_variant_id: int
    quantity: int = Field(ge=1, le=50)


class CartRemoveIn(BaseModel):
    product_variant_id: int

