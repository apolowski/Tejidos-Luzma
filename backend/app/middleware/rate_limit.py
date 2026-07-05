from __future__ import annotations

"""Middleware simple para limitar peticiones por IP.

Sirve para evitar que un cliente haga demasiadas solicitudes seguidas en desarrollo.
"""

import time
from collections import defaultdict, deque
from typing import Deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Limita peticiones en memoria usando una ventana de tiempo simple."""

    def __init__(self, app, requests_per_minute: int = 120) -> None:
        super().__init__(app)
        self.requests_per_minute = max(1, int(requests_per_minute))
        self._hits: dict[str, Deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Obtener el tiempo actual y la IP del cliente.
        now = time.time()
        ip = request.client.host if request.client else "unknown"
        q = self._hits[ip]

        # Quitar registros viejos para mantener solo los últimos 60 segundos.
        cutoff = now - 60.0
        while q and q[0] < cutoff:
            q.popleft()

        # Si ya pasó el límite, devolver error 429.
        if len(q) >= self.requests_per_minute:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"},
                headers={"Retry-After": "60"},
            )

        # Registrar esta petición y dejarla pasar.
        q.append(now)
        return await call_next(request)

