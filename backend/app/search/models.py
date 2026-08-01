from pydantic import BaseModel
from typing import List, Optional

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5

class Citation(BaseModel):
    document_name: str
    version: Optional[int] = None
    page_number: Optional[int] = None
    section: Optional[str] = None
    timestamp: Optional[str] = None

class HybridSearchRequest(BaseModel):
    query: str
    top_k: int = 5
    department: Optional[str] = None
    knowledge_type: Optional[str] = None
    access_roles: Optional[str] = None
    status: Optional[str] = None
    version: Optional[int] = None

class Metrics(BaseModel):
    embedding_time_ms: int
    retrieval_time_ms: int
    semantic_search_time_ms: Optional[int] = None
    embedding_generated_count: Optional[int] = None
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int

class SearchResponse(BaseModel):
    answer: str
    citations: List[Citation]
    metrics: Metrics
