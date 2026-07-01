from __future__ import annotations

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.orm import Session, joinedload

from app.models.category import Category
from app.models.product import Product
from app.models.product_variant import ProductVariant


def list_categories(db: Session) -> list[Category]:
    return list(db.execute(select(Category).order_by(Category.name.asc())).scalars().all())


def create_category(db: Session, *, name: str, description: str | None) -> Category:
    category = Category(name=name, description=description)
    db.add(category)
    db.flush()
    return category


def get_product(db: Session, product_id: int) -> Product | None:
    return (
        db.execute(
            select(Product)
            .where(Product.id == product_id)
            .options(joinedload(Product.variants))
        )
        .unique()
        .scalar_one_or_none()
    )


def list_products(
    db: Session,
    *,
    page: int,
    page_size: int,
    q: str | None = None,
    category_id: int | None = None,
    size: str | None = None,
    color: str | None = None,
) -> tuple[int, list[Product]]:
    page = max(1, int(page))
    page_size = min(50, max(1, int(page_size)))

    stmt = select(Product).options(joinedload(Product.variants)).order_by(Product.created_at.desc())
    count_stmt = select(func.count(Product.id))

    filters = []
    if q:
        like = f"%{q.strip()}%"
        filters.append(or_(Product.name.ilike(like), Product.description.ilike(like)))
    if category_id:
        filters.append(Product.category_id == category_id)

    if size or color:
        # filter products that have at least one matching variant
        pv = ProductVariant
        conds = [pv.product_id == Product.id]
        if size:
            conds.append(pv.size == size)
        if color:
            conds.append(pv.color == color)
        stmt = stmt.where(select(pv.id).where(and_(*conds)).exists())
        count_stmt = count_stmt.where(select(pv.id).where(and_(*conds)).exists())

    if filters:
        stmt = stmt.where(and_(*filters))
        count_stmt = count_stmt.where(and_(*filters))

    total = int(db.execute(count_stmt).scalar_one())
    items = list(
        db.execute(stmt.offset((page - 1) * page_size).limit(page_size)).unique().scalars().all()
    )
    return total, items


def create_product(
    db: Session,
    *,
    name: str,
    description: str | None,
    price: float,
    category_id: int,
    image_url: str | None,
) -> Product:
    product = Product(
        name=name,
        description=description,
        price=price,
        category_id=category_id,
        image_url=image_url,
        stock=0,
    )
    db.add(product)
    db.flush()
    return product


def update_product(db: Session, product: Product, **changes) -> Product:
    for k, v in changes.items():
        if v is not None:
            setattr(product, k, v)
    db.flush()
    return product


def delete_product(db: Session, product: Product) -> None:
    db.delete(product)
    db.flush()


def add_variant(
    db: Session,
    *,
    product: Product,
    size: str,
    color: str,
    stock: int,
) -> ProductVariant:
    variant = ProductVariant(product_id=product.id, size=size, color=color, stock=stock)
    db.add(variant)
    db.flush()
    _recalculate_product_stock(db, product_id=product.id)
    return variant


def update_variant_stock(db: Session, variant: ProductVariant, *, stock: int) -> ProductVariant:
    variant.stock = stock
    db.flush()
    _recalculate_product_stock(db, product_id=variant.product_id)
    return variant


def delete_variant(db: Session, variant: ProductVariant) -> None:
    product_id = variant.product_id
    db.delete(variant)
    db.flush()
    _recalculate_product_stock(db, product_id=product_id)


def _recalculate_product_stock(db: Session, *, product_id: int) -> None:
    total = int(
        db.execute(
            select(func.coalesce(func.sum(ProductVariant.stock), 0)).where(ProductVariant.product_id == product_id)
        ).scalar_one()
    )
    db.execute(update(Product).where(Product.id == product_id).values(stock=total))
    db.flush()
