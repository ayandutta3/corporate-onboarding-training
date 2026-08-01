from langchain_openai import OpenAIEmbeddings
from app.configuration.settings import get_settings
import time

settings = get_settings()

class EmbeddingService:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings(openai_api_key=settings.openai_api_key)

    async def generate_embedding(self, text: str):
        start_time = time.time()
        embedding = self.embeddings.embed_query(text)
        end_time = time.time()
        embedding_time_ms = int((end_time - start_time) * 1000)
        return embedding, embedding_time_ms
