from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    supabase_url: str = ""
    supabase_service_key: str = ""
    default_llm_provider: str = "ollama"
    ollama_base_url: str = "http://localhost:11434"
    replicate_api_key: str = ""
    environment: str = "development"
    allowed_origins: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",")]


settings = Settings()
