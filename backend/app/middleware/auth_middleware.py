from __future__ import annotations

"""Middleware para leer el token JWT de cada petición.

Este archivo revisa si el cliente manda un token de autenticación y deja
información básica del usuario en la petición para que otros módulos puedan usarla.
"""

import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.security.jwt_handler import decode_token


logger = logging.getLogger("app.auth")


class AuthContextMiddleware(BaseHTTPMiddleware):
    """Lee el token y deja el contexto de usuario disponible en la petición."""

    async def dispatch(self, request: Request, call_next) -> Response:
        # Iniciar valores vacíos por si no hay token.
        request.state.user_id = None
        request.state.user_role = None

        # Leer la cabecera Authorization.
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.removeprefix("Bearer ").strip()
            if token:
                try:
                    # Decodificar el token y guardar los datos del usuario.
                    payload = decode_token(token)
                    request.state.user_id = payload.get("sub")
                    request.state.user_role = payload.get("role")
                except ValueError:
                    # Si el token no sirve, no se bloquea la petición; luego se valida en el endpoint.
                    logger.debug("Invalid token received")

        return await call_next(request)

