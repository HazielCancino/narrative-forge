"""LLM streaming via LiteLLM.

LiteLLM normalises the API surface across providers — Ollama,
DeepSeek, OpenRouter, Groq, OpenAI. Adding a new provider never
requires changes to this file or to chat.py.
"""

import logging
from collections.abc import AsyncGenerator
from dataclasses import dataclass

import litellm

logger = logging.getLogger(__name__)

# Silence LiteLLM's own verbose logging in development
litellm.suppress_debug_info = True


@dataclass(frozen=True)
class ModelConfig:
    provider: str
    model: str
    temperature: float
    api_key: str | None = None
    api_base: str | None = None


async def stream_chat(
    messages: list[dict[str, str]],
    system: str,
    model_config: ModelConfig,
) -> AsyncGenerator[str, None]:
    """Yield text chunks from a streaming LLM completion.

    Inserts the system prompt as the first message so callers don't
    have to handle it — the context_service result goes straight here.

    Raises:
        Exception: propagated from LiteLLM on connection or API errors.
    """
    full_messages: list[dict[str, str]] = [
        {"role": "system", "content": system},
        *messages,
    ]

    # LiteLLM model string: "ollama/llama3", "deepseek/deepseek-chat", etc.
    litellm_model = f"{model_config.provider}/{model_config.model}"

    kwargs: dict[str, object] = {
        "model": litellm_model,
        "messages": full_messages,
        "temperature": model_config.temperature,
        "stream": True,
    }

    if model_config.api_key is not None:
        kwargs["api_key"] = model_config.api_key

    if model_config.api_base is not None:
        kwargs["api_base"] = model_config.api_base

    logger.info(
        "Starting stream: provider=%s model=%s",
        model_config.provider,
        model_config.model,
    )

    response = await litellm.acompletion(**kwargs)

    async for chunk in response:  # type: ignore[union-attr]
        delta: str | None = chunk.choices[0].delta.content
        if delta:
            yield delta
