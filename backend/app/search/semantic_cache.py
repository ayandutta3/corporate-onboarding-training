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
            cls._instance.exact_map = {} # normalized_key -> entry dict
            cls._instance.threshold = 0.80
            cls._instance.embedding_service = EmbeddingService()
        return cls._instance

    @staticmethod
    def _normalize_query(query: str) -> str:
        if not query:
            return ""
        return " ".join(query.lower().strip("?.,! \t\n").split())

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

    def clear_user_cache(self, user_id: str):
        if not user_id:
            return
        user_norm = user_id.strip().lower()
        self.cache = [e for e in self.cache if e.get("user_id") != user_norm]
        self.exact_map = {k: v for k, v in self.exact_map.items() if not k.startswith(f"{user_norm}:")}

    def clear(self):
        self.cache = []
        self.exact_map = {}

    async def get(self, query: str, user_id: str, mode: str) -> Optional[Dict[str, Any]]:
        if not user_id:
            return None
        user_norm = user_id.strip().lower()
        norm_q = self._normalize_query(query)
        exact_key = f"{user_norm}:{mode}:{norm_q}"
        
        # 1. Fast Path: User-Specific Exact / Normalized String Match
        if exact_key in self.exact_map:
            entry = self.exact_map[exact_key]
            return {
                "answer": entry["answer"],
                "citations": entry["citations"],
                "ragas_metrics": entry.get("ragas_metrics"),
                "metrics": entry.get("metrics"),
                "similarity_score": 1.0,
                "cached": True,
                "match_type": "exact"
            }

        # 2. User-Specific Semantic Similarity Path (Cosine similarity >= threshold)
        try:
            query_embedding, _ = await self.embedding_service.generate_embedding(query)
        except Exception:
            return None

        best_match = None
        best_score = 0.0

        for entry in self.cache:
            if entry.get("user_id") == user_norm and entry.get("mode") == mode and "embedding" in entry:
                sim = self._cosine_similarity(query_embedding, entry["embedding"])
                if sim >= self.threshold and sim > best_score:
                    best_score = sim
                    best_match = entry

        if best_match:
            # Store in exact_map for future instant lookup
            self.exact_map[exact_key] = best_match
            return {
                "answer": best_match["answer"],
                "citations": best_match["citations"],
                "ragas_metrics": best_match.get("ragas_metrics"),
                "metrics": best_match.get("metrics"),
                "similarity_score": round(best_score, 3),
                "cached": True,
                "match_type": "semantic"
            }
            
        return None

    async def put(self, query: str, user_id: str, mode: str, answer: str, citations: List[Any], ragas_metrics: Optional[Any] = None, metrics: Optional[Any] = None):
        if not user_id:
            return
        user_norm = user_id.strip().lower()
        norm_q = self._normalize_query(query)
        exact_key = f"{user_norm}:{mode}:{norm_q}"
        
        try:
            query_embedding, _ = await self.embedding_service.generate_embedding(query)
        except Exception:
            query_embedding = []

        entry = {
            "query": query,
            "norm_query": norm_q,
            "user_id": user_norm,
            "mode": mode,
            "embedding": query_embedding,
            "answer": answer,
            "citations": citations,
            "ragas_metrics": ragas_metrics,
            "metrics": metrics,
            "timestamp": time.time()
        }

        self.exact_map[exact_key] = entry
        self.cache.append(entry)

        # Limit cache size to 200 entries
        if len(self.cache) > 200:
            removed = self.cache.pop(0)
            rem_key = f"{removed.get('user_id')}:{removed.get('mode')}:{removed.get('norm_query')}"
            self.exact_map.pop(rem_key, None)
