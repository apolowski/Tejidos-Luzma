from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.cart_schema import CartAddIn, CartOut, CartRemoveIn
from app.services.cart_service import add_to_cart, get_cart_details, remove_from_cart


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("", response_model=CartOut)
def get_cart(db: Session = Depends(get_db), user=Depends(get_current_user)) -> CartOut:
    return CartOut.model_validate(get_cart_details(db, user=user))


@router.post("/add", response_model=CartOut)
def cart_add(payload: CartAddIn, db: Session = Depends(get_db), user=Depends(get_current_user)) -> CartOut:
    try:
        with db.begin():
            cart = add_to_cart(db, user=user, product_variant_id=payload.product_variant_id, quantity=payload.quantity)
        return CartOut.model_validate(cart)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.delete("/remove", response_model=CartOut)
def cart_remove(payload: CartRemoveIn, db: Session = Depends(get_db), user=Depends(get_current_user)) -> CartOut:
    with db.begin():
        cart = remove_from_cart(db, user=user, product_variant_id=payload.product_variant_id)
    return CartOut.model_validate(cart)

