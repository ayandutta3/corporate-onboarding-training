from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    app_name: str = "Corporate Onboarding API"
    app_env: str = "development"
    debug: bool = True

    # MongoDB
    mongodb_uri: str
    mongodb_db_name: str

    # OpenAI
    openai_api_key: str

    # Langfuse
    langfuse_secret_key: str = ""
    langfuse_public_key: str = ""
    langfuse_host: str = "https://cloud.langfuse.com"

    # JWT Authentication
    jwt_secret_key: str = "default_insecure_secret_key"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

def get_settings() -> Settings:
    return Settings()
