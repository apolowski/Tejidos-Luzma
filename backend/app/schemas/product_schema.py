from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CategoryOut(BaseModel):
    id: int
    name: str
    description: str | None = None

    model_config = {"from_attributes": True}


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    description: str | None = None


class ProductVariantOut(BaseModel):
    id: int
    size: str
    color: str
    stock: int

    model_config = {"from_attributes": True}


class ProductOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    price: float
    stock: int
    category_id: int
    image_url: str | None = None
    created_at: datetime
    variants: list[ProductVariantOut] = []

    model_config = {"from_attributes": True}


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: str | None = None
    price: float = Field(gt=0)
    category_id: int
    image_url: str | None = None


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    price: float | None = Field(default=None, gt=0)
    category_id: int | None = None
    image_url: str | None = None


class ProductVariantCreate(BaseModel):
    size: str = Field(min_length=1, max_length=32)
    color: str = Field(min_length=1, max_length=64)
    stock: int = Field(ge=0)


class ProductVariantUpdate(BaseModel):
    stock: int = Field(ge=0)


class PaginatedProducts(BaseModel):
    page: int
    page_size: int
    total: int
    items: list[ProductOut]
