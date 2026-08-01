from typing import TypedDict, List, Dict, Any, Optional
from app.ingestion.models import DocumentModel
from app.search.models import HybridSearchRequest, Citation, Metrics
from app.authentication.models import UserInDB

class GraphState(TypedDict):
    # Inputs
    search_type: str
    request: Any
    user: UserInDB
    db_client: Any # AsyncIOMotorDatabase
    
    # Internal State
    intent: Optional[str]
    candidate_docs: List[DocumentModel]
    retrieved_chunks: List[Dict[str, Any]]
    context_text: str
    llm_response: str
    evaluation_score: Optional[str]
    
    # Outputs
    final_answer: str
    citations: List[Citation]
    metrics: Metrics
