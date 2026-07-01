from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.dependencies.auth import get_current_user
from app.schemas.user_schema import AuthResponse, LoginIn, TokenOut, UserCreate, UserOut, UserUpdate
from app.models.user import User
from app.security.jwt_handler import create_access_token
from app.services.auth_service import authenticate_user, register_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(payload: UserCreate, db: Session = Depends(get_db)) -> AuthResponse:
    try:
        with db.begin():
            user = register_user(db, name=payload.name, email=str(payload.email).lower(), password=payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    token = TokenOut(access_token=create_access_token(subject=str(user.id), role=str(user.role.value)))
    return AuthResponse(user=UserOut.model_validate(user), token=token)


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginIn, db: Session = Depends(get_db)) -> AuthResponse:
    user = authenticate_user(db, email=str(payload.email).lower(), password=payload.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = TokenOut(access_token=create_access_token(subject=str(user.id), role=str(user.role.value)))
    return AuthResponse(user=UserOut.model_validate(user), token=token)


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(user)


@router.put("/profile", response_model=UserOut)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserOut:
    with db.begin():
        current_user.name = payload.name
        current_user.phone = payload.phone
        current_user.address = payload.address
    return UserOut.model_validate(current_user)

