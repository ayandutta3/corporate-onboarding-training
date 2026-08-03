import app.configuration.ssl_patch
import os

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

# Tiktoken Cache configuration
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
tiktoken_cache_dir = os.path.join(base_dir, "tiktoken_cache")
os.makedirs(tiktoken_cache_dir, exist_ok=True)
os.environ["TIKTOKEN_CACHE_DIR"] = tiktoken_cache_dir

assert os.path.exists(
    os.path.join(
        tiktoken_cache_dir,
        "9b5ad71b2ce5302211f9c61530b329a4922fc6a4"
    )
), f"Tiktoken cache file not found in {tiktoken_cache_dir}"

class Settings(BaseSettings):
    app_name: str = "Corporate Onboarding API"
    app_env: str = "development"
    debug: bool = True

    # MongoDB
    mongodb_uri: str
    mongodb_db_name: str

    # OpenAI / API Endpoint
    openai_api_key: str
    openai_api_base: str = "https://genailab.tcs.in/"
    api_endpoint: str = "https://genailab.tcs.in/"

    # Model Deployments
    llm_model: str = "azure/genailab-maas-gpt-4o-mini"
    embedding_model: str = "azure/genailab-maas-text-embedding-3-large"
    whisper_model: str = "azure/genailab-maas-whisper"

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
