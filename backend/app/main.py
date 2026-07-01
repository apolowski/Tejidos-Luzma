from __future__ import annotations

import logging
import os
import time
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config.settings import settings
from app.config.database import Base, engine
import app.models  # noqa: F401

# Create tables automatically on startup
Base.metadata.create_all(bind=engine)

from app.middleware.auth_middleware import AuthContextMiddleware
from app.middleware.rate_limit import RateLimitMiddleware
from app.routers.auth_router import router as auth_router
from app.routers.cart_router import router as cart_router
from app.routers.order_router import router as order_router
from app.routers.product_router import router as product_router


def _configure_logging() -> None:
    level = logging.INFO if settings.env != "dev" else logging.DEBUG
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s %(message)s",
    )


_configure_logging()
logger = logging.getLogger("app.http")

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuthContextMiddleware)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.rate_limit_per_minute)


uploads_dir = Path(os.getcwd()) / settings.upload_dir
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(uploads_dir)), name="static")


@app.middleware("http")
async def log_requests(request, call_next):
    start = time.perf_counter()
    response = await call_next(request)
    ms = (time.perf_counter() - start) * 1000.0
    logger.info("%s %s -> %s (%.1fms)", request.method, request.url.path, response.status_code, ms)
    return response


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(auth_router, prefix="/api")
app.include_router(product_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(order_router, prefix="/api")
