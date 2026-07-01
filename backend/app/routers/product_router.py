from __future__ import annotations

import os
import secrets
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.config.settings import settings
from app.dependencies.auth import require_admin
from app.models.product_variant import ProductVariant
from app.schemas.product_schema import (
    CategoryOut,
    CategoryCreate,
    PaginatedProducts,
    ProductCreate,
    ProductOut,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantOut,
    ProductVariantUpdate,
)
from app.services import product_service


router = APIRouter(prefix="", tags=["products"])


@router.get("/categories", response_model=list[CategoryOut])
def categories(db: Session = Depends(get_db)) -> list[CategoryOut]:
    return [CategoryOut.model_validate(c) for c in product_service.list_categories(db)]


@router.post("/categories", response_model=CategoryOut, status_code=201, dependencies=[Depends(require_admin)])
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)) -> CategoryOut:
    try:
        c = product_service.create_category(db, name=payload.name.strip(), description=payload.description)
        db.commit()
        db.refresh(c)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category already exists") from exc
    return CategoryOut.model_validate(c)


@router.get("/products", response_model=PaginatedProducts)
def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    q: str | None = Query(None, max_length=200),
    category_id: int | None = Query(None, ge=1),
    size: str | None = Query(None, max_length=32),
    color: str | None = Query(None, max_length=64),
    db: Session = Depends(get_db),
) -> PaginatedProducts:
    total, items = product_service.list_products(
        db,
        page=page,
        page_size=page_size,
        q=q,
        category_id=category_id,
        size=size,
        color=color,
    )
    return PaginatedProducts(
        page=page,
        page_size=page_size,
        total=total,
        items=[ProductOut.model_validate(p) for p in items],
    )


@router.get("/products/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)) -> ProductOut:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return ProductOut.model_validate(product)


@router.post("/products", response_model=ProductOut, status_code=201, dependencies=[Depends(require_admin)])
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> ProductOut:
    try:
        product = product_service.create_product(
            db,
            name=payload.name,
            description=payload.description,
            price=payload.price,
            category_id=payload.category_id,
            image_url=payload.image_url,
        )
        db.commit()
        db.refresh(product)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid product") from exc
    return ProductOut.model_validate(product)


@router.put("/products/{product_id}", response_model=ProductOut, dependencies=[Depends(require_admin)])
def update_product(product_id: int, payload: ProductUpdate, db: Session = Depends(get_db)) -> ProductOut:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    try:
        product_service.update_product(
            db,
            product,
            name=payload.name,
            description=payload.description,
            price=payload.price,
            category_id=payload.category_id,
            image_url=payload.image_url,
        )
        db.commit()
        db.refresh(product)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid product") from exc
    return ProductOut.model_validate(product)


@router.delete("/products/{product_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_product(product_id: int, db: Session = Depends(get_db)) -> None:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    try:
        product_service.delete_product(db, product)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Product could not be deleted") from exc
    return None


@router.post("/products/{product_id}/variants", response_model=ProductVariantOut, status_code=201, dependencies=[Depends(require_admin)])
def create_variant(product_id: int, payload: ProductVariantCreate, db: Session = Depends(get_db)) -> ProductVariantOut:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    try:
        variant = product_service.add_variant(
            db, product=product, size=payload.size, color=payload.color, stock=payload.stock
        )
        db.commit()
        db.refresh(variant)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Variant already exists") from exc
    return ProductVariantOut.model_validate(variant)


@router.put("/variants/{variant_id}", response_model=ProductVariantOut, dependencies=[Depends(require_admin)])
def update_variant(variant_id: int, payload: ProductVariantUpdate, db: Session = Depends(get_db)) -> ProductVariantOut:
    variant = db.get(ProductVariant, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    try:
        product_service.update_variant_stock(db, variant, stock=payload.stock)
        db.commit()
        db.refresh(variant)
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid variant") from exc
    return ProductVariantOut.model_validate(variant)


@router.delete("/variants/{variant_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_variant(variant_id: int, db: Session = Depends(get_db)) -> None:
    variant = db.get(ProductVariant, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Variant not found")
    try:
        product_service.delete_variant(db, variant)
        db.commit()
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail="Variant could not be deleted") from exc
    return None


@router.post("/products/{product_id}/image", response_model=ProductOut, dependencies=[Depends(require_admin)])
async def upload_product_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> ProductOut:
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(status_code=400, detail="Unsupported image format")

    uploads_dir = Path(os.getcwd()) / settings.upload_dir
    uploads_dir.mkdir(parents=True, exist_ok=True)
    filename = f"p{product.id}_{secrets.token_hex(8)}{ext}"
    dest = uploads_dir / filename

    data = await file.read()
    if len(data) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Max image size is 5MB")
    dest.write_bytes(data)

    public_base_url = str(settings.public_base_url).rstrip("/")
    image_url = f"{public_base_url}/static/{filename}"
    try:
        product_service.update_product(db, product, image_url=image_url)
        db.commit()
        db.refresh(product)
    except Exception as exc:
        db.rollback()
        if dest.exists():
            dest.unlink()
        raise HTTPException(status_code=400, detail="Image could not be saved") from exc

    return ProductOut.model_validate(product)
