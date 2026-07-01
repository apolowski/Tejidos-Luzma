from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.order_schema import OrderCreateOut, OrderOut
from app.services.order_service import create_order_from_cart, get_order, list_orders


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderCreateOut, status_code=201)
def create_order(db: Session = Depends(get_db), user=Depends(get_current_user)) -> OrderCreateOut:
    try:
        with db.begin():
            order = create_order_from_cart(db, user=user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return OrderCreateOut(order=OrderOut.model_validate(order), message="Pedido creado. Pago: simulacion (pendiente).")


@router.get("", response_model=list[OrderOut])
def orders(db: Session = Depends(get_db), user=Depends(get_current_user)) -> list[OrderOut]:
    return [OrderOut.model_validate(o) for o in list_orders(db, user=user)]


@router.get("/{order_id}", response_model=OrderOut)
def order_detail(order_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)) -> OrderOut:
    order = get_order(db, user=user, order_id=order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderOut.model_validate(order)

