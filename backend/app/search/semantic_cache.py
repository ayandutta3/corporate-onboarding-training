import time
import math
from typing import List, Dict, Any, Optional
from app.vector.embedding import EmbeddingService

class SemanticCacheService:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(SemanticCacheService, cls).__new__(cls)
            cls._instance.cache = [] # List of dicts
            cls._instance.threshold = 0.92
            cls._instance.embedding_service = EmbeddingService()
        return cls._instance

    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0
        return dot_product / (norm1 * norm2)

    def clear(self):
        self.cache = []

    async def get(self, query: str, user_id: str, mode: str) -> Optional[Dict[str, Any]]:
        query_embedding, _ = await self.embedding_service.generate_embedding(query)
        
        best_match = None
        best_score = 0.0

        for entry in self.cache:
            if entry.get("user_id") == user_id and entry.get("mode") == mode:
                sim = self._cosine_similarity(query_embedding, entry["embedding"])
                if sim >= self.threshold and sim > best_score:
                    best_score = sim
                    best_match = entry

        if best_match:
            return {
                "answer": best_match["answer"],
                "citations": best_match["citations"],
                "ragas_metrics": best_match.get("ragas_metrics"),
                "similarity_score": round(best_score, 3),
                "cached": True
            }
            
        return None

    async def put(self, query: str, user_id: str, mode: str, answer: str, citations: List[Any], ragas_metrics: Optional[Any] = None):
        query_embedding, _ = await self.embedding_service.generate_embedding(query)
        self.cache.append({
            "query": query,
            "user_id": user_id,
            "mode": mode,
            "embedding": query_embedding,
            "answer": answer,
            "citations": citations,
            "ragas_metrics": ragas_metrics,
            "timestamp": time.time()
        })
        # Limit cache size to 100 entries
        if len(self.cache) > 100:
            self.cache.pop(0)
