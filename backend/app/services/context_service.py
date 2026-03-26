"""Builds the LLM system prompt from project context.

Every chat call injects this prompt so the model knows which story
world it is assisting with. Kept intentionally brief — context
windows fill fast with long-form prose from the editor.
"""

from dataclasses import dataclass, field


@dataclass(frozen=True)
class ActiveCharacter:
    name: str
    personality: str


@dataclass(frozen=True)
class ProjectContext:
    title: str
    genre: str
    current_scene_title: str
    active_characters: list[ActiveCharacter] = field(
        default_factory=list,
    )


def build_system_prompt(ctx: ProjectContext) -> str:
    """Return the system prompt for a Manuscript AI chat turn."""
    lines: list[str] = [
        "You are a creative writing assistant embedded in a " "storytelling project.",
        "",
        f"Project: {ctx.title}",
    ]

    if ctx.genre:
        lines[-1] += f" — {ctx.genre}"

    if ctx.current_scene_title:
        lines.append(f"Current scene: {ctx.current_scene_title}")

    if ctx.active_characters:
        lines.append("")
        lines.append("Active characters:")
        for char in ctx.active_characters:
            lines.append(f"- {char.name}: {char.personality}")

    lines += [
        "",
        "Your role: assist the writer with suggestions, expansions, "
        "rewrites, or scene beats. Be concise and preserve the "
        "author's voice. Never write more than requested.",
    ]

    return "\n".join(lines)
