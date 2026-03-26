"""Application settings — reads from .env via pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Supabase
    supabase_url: str
    supabase_service_key: str
    # supabase_jwt_secret removed — JWT verification now uses
    # supabase.auth.get_user() which only needs the service key.

    # LLM defaults
    default_llm_provider: str = "ollama"
    ollama_base_url: str = "http://localhost:11434"

    # Image generation (optional)
    replicate_api_key: str = ""

    # App
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def allowed_origins_list(self) -> list[str]:
        """Return ALLOWED_ORIGINS as a list, split by comma."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()  # type: ignore[call-arg]
