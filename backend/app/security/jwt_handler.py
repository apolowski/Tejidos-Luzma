from __future__ import annotations

"""Herramientas para crear y leer tokens JWT.

Los tokens permiten autenticar a los usuarios sin guardar la sesión en el servidor.
"""

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.config.settings import settings


def create_access_token(*, subject: str, role: str, expires_minutes: int | None = None) -> str:
    # Definir el tiempo de expiración del token.
    exp_minutes = expires_minutes if expires_minutes is not None else settings.access_token_expire_minutes
    now = datetime.now(tz=timezone.utc)
    payload = {
        "sub": subject,  # Id del usuario dentro del token.
        "role": role,  # Rol del usuario para permisos.
        "iat": int(now.timestamp()),  # Fecha de creación.
        "exp": int((now + timedelta(minutes=exp_minutes)).timestamp()),  # Fecha de expiración.
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str) -> dict:
    # Validar un token y devolver su contenido si sigue siendo válido.
    try:
        return jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise ValueError("Invalid token") from exc

