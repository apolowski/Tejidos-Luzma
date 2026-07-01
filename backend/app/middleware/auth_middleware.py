from __future__ import annotations

import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.security.jwt_handler import decode_token


logger = logging.getLogger("app.auth")


class AuthContextMiddleware(BaseHTTPMiddleware):
    """
    Parses Bearer token (if any) and stores basic auth context in request.state.
    Authorization decisions still happen via dependencies.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        request.state.user_id = None
        request.state.user_role = None

        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth.removeprefix("Bearer ").strip()
            if token:
                try:
                    payload = decode_token(token)
                    request.state.user_id = payload.get("sub")
                    request.state.user_role = payload.get("role")
                except ValueError:
                    # Don't block here; dependencies will enforce when required.
                    logger.debug("Invalid token received")

        return await call_next(request)

