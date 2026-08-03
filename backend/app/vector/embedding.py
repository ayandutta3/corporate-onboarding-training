import os
import time
from langchain_openai import OpenAIEmbeddings
from app.configuration.settings import get_settings
from app.configuration.http_client import get_http_client, get_async_http_client

# Ensure Tiktoken cache directory is configured for embedding tokenizer
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

settings = get_settings()

class EmbeddingService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key,
            openai_api_base=settings.openai_api_base,
            http_client=get_http_client(),
            http_async_client=get_async_http_client()
        )

    async def generate_embedding(self, text: str):
        start_time = time.time()
        embedding = self.embeddings.embed_query(text)
        end_time = time.time()
        embedding_time_ms = int((end_time - start_time) * 1000)
        return embedding, embedding_time_ms
