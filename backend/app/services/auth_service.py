from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.cart import Cart
from app.models.user import User, UserRole
from app.security.password_hash import hash_password, verify_password


def register_user(db: Session, *, name: str, email: str, password: str) -> User:
    existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if existing:
        raise ValueError("Email already registered")

    user = User(name=name, email=email, password_hash=hash_password(password), role=UserRole.user)
    db.add(user)
    db.flush()  # assign user.id

    cart = Cart(user_id=user.id)
    db.add(cart)
    db.flush()

    return user


def authenticate_user(db: Session, *, email: str, password: str) -> User | None:
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

