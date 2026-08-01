from app.vector.repository import VectorRepository
from app.vector.embedding import EmbeddingService
from typing import List, Dict, Any
import time

class SemanticReranker:
    def __init__(self, vector_repo: VectorRepository, embedding_service: EmbeddingService):
        self.vector_repo = vector_repo
        self.embedding_service = embedding_service

    async def search_and_rerank(self, query: str, candidate_document_ids: List[str], top_k: int = 5) -> tuple[List[Dict[str, Any]], int, int]:
        if not candidate_document_ids:
            return [], 0, 0
            
        start_embedding = time.time()
        query_embedding, _ = await self.embedding_service.generate_embedding(query)
        embedding_time_ms = int((time.time() - start_embedding) * 1000)
        
        start_search = time.time()
        
        # We can construct a ChromaDB where filter based on document IDs
        # Since Chroma allows filtering by metadata:
        where_filter = None
        if len(candidate_document_ids) == 1:
            where_filter = {"document_id": candidate_document_ids[0]}
        else:
            where_filter = {"document_id": {"$in": candidate_document_ids}}
            
        results = self.vector_repo.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            where=where_filter,
            include=["documents", "metadatas", "distances"]
        )
        
        search_time_ms = int((time.time() - start_search) * 1000)
        
        formatted_results = []
        if results and "documents" in results and results["documents"]:
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            for doc, meta in zip(docs, metas):
                formatted_results.append({
                    "document": doc,
                    "metadata": meta
                })
                
        return formatted_results, embedding_time_ms, search_time_ms
