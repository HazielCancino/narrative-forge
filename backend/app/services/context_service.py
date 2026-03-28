"""Service responsible for building LLM system prompts from project context."""

from __future__ import annotations

import logging

from pydantic import BaseModel

logger = logging.getLogger(__name__)

# Maximum number of characters from scene content injected into the prompt.
# Limits token usage without losing relevant context.
_SCENE_CONTENT_MAX_CHARS = 2_000


class CharacterInfo(BaseModel):
    """Minimal character data for context injection."""

    name: str
    personality: str


class ProjectContext(BaseModel):
    """All project data available from the frontend to build the system prompt."""

    title: str
    genre: str
    active_characters: list[CharacterInfo] = []
    current_scene_title: str = ""
    current_scene_content: str | None = None  # ← new field


def build_system_prompt(context: ProjectContext) -> str:
    """Build a system prompt string from project context.

    Injects project metadata, active characters, and the current scene
    content (truncated to _SCENE_CONTENT_MAX_CHARS chars).
    """
    lines: list[str] = [
        "You are a creative writing assistant embedded in a storytelling project.",
        "",
        f"Project: {context.title} — {context.genre}",
    ]

    if context.current_scene_title:
        lines.append(f"Current scene: {context.current_scene_title}")

    if context.active_characters:
        lines.append("")
        lines.append("Active characters:")
        for char in context.active_characters:
            lines.append(f"- {char.name}: {char.personality}")

    if context.current_scene_content:
        excerpt = context.current_scene_content[:_SCENE_CONTENT_MAX_CHARS]
        truncated = len(context.current_scene_content) > _SCENE_CONTENT_MAX_CHARS
        suffix = "…" if truncated else ""
        lines += [
            "",
            "What the writer has written so far in this scene:",
            f"{excerpt}{suffix}",
        ]
        logger.debug(
            "Scene content injected: %d chars (truncated=%s)",
            len(excerpt),
            truncated,
        )

    lines += [
        "",
        "Your role: assist the writer by continuing the narrative, offering",
        "suggestions, expanding scenes, or refining prose — always consistent",
        "with the project's genre, tone, and established characters.",
    ]

    return "\n".join(lines)
