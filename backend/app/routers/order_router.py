from __future__ import annotations

"""Endpoints para crear y ver órdenes del usuario.

Este archivo convierte el carrito en un pedido y permite ver los pedidos hechos.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.order_schema import OrderCreateOut, OrderOut
from app.services.order_service import create_order_from_cart, get_order, list_orders, pay_order


router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", response_model=OrderCreateOut, status_code=201)
def crear_pedido(db: Session = Depends(get_db), usuario=Depends(get_current_user)) -> OrderCreateOut:
    # Tomar el carrito actual del usuario y convertirlo en una orden.
    try:
        pedido = create_order_from_cart(db, user=usuario)
        db.commit()
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        db.rollback()
        raise
    return OrderCreateOut(order=OrderOut.model_validate(pedido), message="Pedido creado. Pago: simulacion (pendiente).")


@router.get("", response_model=list[OrderOut])
def listar_pedidos(db: Session = Depends(get_db), usuario=Depends(get_current_user)) -> list[OrderOut]:
    # Mostrar todos los pedidos del usuario autenticado.
    return [OrderOut.model_validate(pedido) for pedido in list_orders(db, user=usuario)]


@router.get("/{order_id}", response_model=OrderOut)
def ver_pedido(order_id: int, db: Session = Depends(get_db), usuario=Depends(get_current_user)) -> OrderOut:
    # Mostrar un pedido en particular si pertenece al usuario.
    pedido = get_order(db, user=usuario, order_id=order_id)
    if not pedido:
        raise HTTPException(status_code=404, detail="Order not found")
    return OrderOut.model_validate(pedido)


@router.post("/{order_id}/pay", response_model=OrderOut)
def pagar_pedido(order_id: int, db: Session = Depends(get_db), usuario=Depends(get_current_user)) -> OrderOut:
    # Simular el pago de una orden existente
    try:
        pedido = pay_order(db, user=usuario, order_id=order_id)
        db.commit()
        db.refresh(pedido)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception:
        db.rollback()
        raise
    return OrderOut.model_validate(pedido)


