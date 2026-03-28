"""Chat streaming endpoint — Server-Sent Events over HTTP POST.

Why POST instead of GET for SSE?
The request body carries messages, project context, and model config —
too large and too sensitive for query parameters. POST with an SSE
StreamingResponse is the correct pattern.

Why JSON-encoded data lines?
SSE `data:` values cannot contain raw newlines. JSON encoding handles
any text safely without per-character escaping.
"""

import json
import logging
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.core.security import get_current_user_id
from app.services.context_service import (
    CharacterInfo,
    ProjectContext,
    build_system_prompt,
)
from app.services.llm_service import ModelConfig, stream_chat

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["chat"])


# ── Request / response models ────────────────────────────────────


class MessageIn(BaseModel):
    role: str = Field(..., pattern="^(user|assistant|system)$")
    content: str


class ActiveCharacterIn(BaseModel):
    name: str
    personality: str


class ProjectContextIn(BaseModel):
    title: str
    genre: str = ""
    current_scene_title: str = ""
    current_scene_content: str | None = None
    active_characters: list[ActiveCharacterIn] = []


class ModelConfigIn(BaseModel):
    provider: str = "ollama"
    model: str = "llama3"
    temperature: float = Field(0.8, ge=0.0, le=2.0)
    api_key: str | None = None
    api_base: str | None = "http://localhost:11434"


class ChatRequest(BaseModel):
    messages: list[MessageIn]
    project_context: ProjectContextIn
    model_config_: ModelConfigIn = Field(
        alias="model_config",
        default_factory=ModelConfigIn,
    )

    model_config = {"populate_by_name": True}


# ── SSE helpers ──────────────────────────────────────────────────


def _sse_chunk(content: str) -> str:
    """Format a text chunk as an SSE data line."""
    payload = json.dumps({"content": content})
    return f"data: {payload}\n\n"


def _sse_done() -> str:
    """Signal end-of-stream to the client."""
    return "data: [DONE]\n\n"


def _sse_error(message: str) -> str:
    """Signal a server-side error to the client."""
    payload = json.dumps({"error": message})
    return f"data: {payload}\n\n"


async def _generate(
    request: ChatRequest,
) -> AsyncGenerator[str, None]:
    """Inner generator consumed by StreamingResponse."""
    ctx = ProjectContext(
        title=request.project_context.title,
        genre=request.project_context.genre,
        current_scene_title=request.project_context.current_scene_title,
        current_scene_content=request.project_context.current_scene_content,
        active_characters=[
            CharacterInfo(name=c.name, personality=c.personality)
            for c in request.project_context.active_characters
        ],
    )
    system_prompt = build_system_prompt(ctx)

    cfg = request.model_config_
    model_config = ModelConfig(
        provider=cfg.provider,
        model=cfg.model,
        temperature=cfg.temperature,
        api_key=cfg.api_key,
        api_base=cfg.api_base,
    )

    raw_messages = [{"role": m.role, "content": m.content} for m in request.messages]

    try:
        async for chunk in stream_chat(raw_messages, system_prompt, model_config):
            yield _sse_chunk(chunk)
        yield _sse_done()
    except Exception as exc:
        logger.exception("LLM stream error")
        yield _sse_error(str(exc))


# ── Endpoint ─────────────────────────────────────────────────────


@router.post(
    "/stream",
    summary="Stream a chat completion via SSE",
    response_class=StreamingResponse,
)
async def chat_stream(
    request: ChatRequest,
    _user_id: Annotated[str, Depends(get_current_user_id)],
) -> StreamingResponse:
    """Accept a chat request and stream the LLM response as SSE.

    The client reads `data:` lines. Each line is a JSON object with
    either a `content` string (text chunk) or `done: true` (end).
    On error, the line contains an `error` string.
    """
    if not request.messages:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="messages must not be empty.",
        )

    return StreamingResponse(
        _generate(request),
        media_type="text/event-stream",
        headers={
            # Prevent buffering in proxies/nginx
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
        },
    )
