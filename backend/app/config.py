import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    # API & Server
    APP_NAME: str = "Workplace SafetyWatch API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://workplace-safetywatch.vercel.app",
        "*"
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        return ["*"]

    # Groq LLM
    GROQ_API_KEY: str = Field(default="", description="Groq API key")
    GROQ_VISION_MODEL: str = "llama-3.2-11b-vision-preview"
    GROQ_TEXT_MODEL: str = "llama-3.3-70b-versatile"

    # Supabase
    SUPABASE_URL: str = Field(default="", description="Supabase project URL")
    SUPABASE_KEY: str = Field(default="", description="Supabase anon or service key")
    SUPABASE_STORAGE_BUCKET: str = "hazard-images"

    # LangSmith Observability
    LANGCHAIN_TRACING_V2: bool = True
    LANGCHAIN_PROJECT: str = "workplace-safetywatch"
    LANGCHAIN_API_KEY: str = Field(default="", description="LangSmith API key")
    LANGCHAIN_ENDPOINT: str = "https://api.smith.langchain.com"

    # Storage paths for local fallback
    UPLOAD_DIR: str = os.path.join(os.path.dirname(__file__), "..", "..", "uploads")
    SQLITE_DB_PATH: str = os.path.join(os.path.dirname(__file__), "..", "..", "safetywatch.db")

settings = Settings()
