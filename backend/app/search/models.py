from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class Citation(BaseModel):
    document_id: str = ""
    document_name: str
    file_type: str = "txt"
    version: Optional[int] = None
    page_number: Optional[int] = None
    section: Optional[str] = None
    timestamp: Optional[str] = None

class HybridSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    department: Optional[str] = None
    division: Optional[str] = None
    businessLine: Optional[str] = None
    access_roles: Optional[str] = None
    status: Optional[str] = None
    version: Optional[int] = None

class RagasMetrics(BaseModel):
    faithfulness: float
    answer_relevancy: float
    context_precision: float
    ragas_score: float

class Metrics(BaseModel):
    embedding_time_ms: int = 0
    retrieval_time_ms: int = 0
    semantic_search_time_ms: Optional[int] = 0
    embedding_generated_count: Optional[int] = 0
    prompt_tokens: int = 0
    completion_tokens: int = 0
    total_tokens: int = 0
    total_time_ms: Optional[int] = 0
    ragas_metrics: Optional[RagasMetrics] = None
    semantic_cache_hit: Optional[bool] = False
    cache_similarity: Optional[float] = 0.0

class SearchResponse(BaseModel):
    answer: str
    citations: List[Citation]
    metrics: Metrics


