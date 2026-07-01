from __future__ import annotations

import time
from collections import defaultdict, deque
from typing import Deque

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Basic in-memory fixed-window-ish limiter (per IP).
    OK for single-instance dev; in production use Redis or a gateway.
    """

    def __init__(self, app, requests_per_minute: int = 120) -> None:
        super().__init__(app)
        self.requests_per_minute = max(1, int(requests_per_minute))
        self._hits: dict[str, Deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next) -> Response:
        now = time.time()
        ip = request.client.host if request.client else "unknown"
        q = self._hits[ip]

        cutoff = now - 60.0
        while q and q[0] < cutoff:
            q.popleft()

        if len(q) >= self.requests_per_minute:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests"},
                headers={"Retry-After": "60"},
            )

        q.append(now)
        return await call_next(request)

