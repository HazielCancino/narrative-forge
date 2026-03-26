"""Narrative Forge — FastAPI backend entry point."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1 import chat, health
from app.core.config import settings

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("Narrative Forge backend starting up")
    logger.info("Allowed origins: %s", settings.allowed_origins_list)
    yield
    logger.info("Narrative Forge backend shutting down")


app = FastAPI(
    title="Narrative Forge API",
    description="LLM orchestration layer for Narrative Forge.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    # Use the parsed list property — never the raw string
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
