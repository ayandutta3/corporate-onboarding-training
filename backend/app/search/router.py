from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from app.authentication.dependencies import get_current_user
from app.authentication.models import UserInDB
from app.search.models import SearchRequest, SearchResponse, HybridSearchRequest
from app.optimization.caveman import CavemanCompressor
from app.repository.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.langgraph.workflow import build_search_graph
from app.langgraph.state import GraphState
from app.configuration.settings import get_settings
from langfuse.langchain import CallbackHandler
import uuid
import os
import time

# Disable SSL verification for Langfuse if requested
os.environ["CURL_CA_BUNDLE"] = ""

settings = get_settings()

# Set Langfuse credentials in environment for the Langfuse client
if settings.langfuse_public_key:
    os.environ["LANGFUSE_PUBLIC_KEY"] = settings.langfuse_public_key
if settings.langfuse_secret_key:
    os.environ["LANGFUSE_SECRET_KEY"] = settings.langfuse_secret_key
if settings.langfuse_host:
    os.environ["LANGFUSE_HOST"] = settings.langfuse_host

router = APIRouter(prefix="/search", tags=["Search"])
graph = build_search_graph()

from app.search.semantic_cache import SemanticCacheService
from app.search.models import Metrics

cache_service = SemanticCacheService()

@router.post("/vector", response_model=SearchResponse, summary="Perform a vector search", description="Executes LangGraph RAG pipeline using pure vector similarity.")
async def search_vector(
    request: SearchRequest,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check 0.80 threshold Semantic Cache
    cached_res = await cache_service.get(request.query, current_user.email, "vector")
    if cached_res:
        cm = cached_res.get("metrics")
        return SearchResponse(
            answer=cached_res["answer"],
            citations=cached_res["citations"],
            metrics=Metrics(
                embedding_time_ms=0,
                retrieval_time_ms=0,
                prompt_tokens=getattr(cm, 'prompt_tokens', 0) if cm else 0,
                completion_tokens=getattr(cm, 'completion_tokens', 0) if cm else 0,
                total_tokens=getattr(cm, 'total_tokens', 0) if cm else 0,
                total_time_ms=1,
                semantic_cache_hit=True,
                cache_similarity=cached_res["similarity_score"],
                headroom_raw_input_tokens=getattr(cm, 'headroom_raw_input_tokens', 0) if cm else 0,
                headroom_saved_tokens=getattr(cm, 'headroom_saved_tokens', 0) if cm else 0,
                input_compression_ratio=getattr(cm, 'input_compression_ratio', 0.0) if cm else 0.0,
                caveman_saved_tokens=getattr(cm, 'caveman_saved_tokens', 0) if cm else 0,
                output_compression_ratio=getattr(cm, 'output_compression_ratio', 0.0) if cm else 0.0,
                prompt_optimization_mode=getattr(cm, 'prompt_optimization_mode', 'optimized_with_system') if cm else 'optimized_with_system',
                ragas_metrics=cached_res.get("ragas_metrics")
            )
        )

    initial_state = GraphState(
        search_type="vector",
        request=request,
        user=current_user,
        db_client=db,
        intent=None,
        candidate_docs=[],
        retrieved_chunks=[],
        context_text="",
        llm_response="",
        evaluation_score=None,
        final_answer="",
        citations=[],
        metrics=None,
        user_long_term_facts=[],
        is_cached=False
    )
    
    try:
        langfuse_handler = CallbackHandler()
        run_config = {
            "callbacks": [langfuse_handler],
            "metadata": {
                "langfuse_user_id": current_user.email,
                "langfuse_session_id": str(uuid.uuid4()),
                "langfuse_tags": ["vector_search"]
            }
        }
    except Exception as e:
        run_config = {}
    
    start_time = time.time()
    final_state = await graph.ainvoke(initial_state, config=run_config)
    total_time_ms = max(1, int((time.time() - start_time) * 1000))
    if final_state.get("metrics"):
        final_state["metrics"].total_time_ms = total_time_ms
    
    # Store in Semantic Cache
    if final_state.get("final_answer"):
        ragas_data = final_state["metrics"].ragas_metrics if final_state.get("metrics") else None
        await cache_service.put(
            query=request.query, 
            user_id=current_user.email, 
            mode="vector",
            answer=final_state["final_answer"],
            citations=final_state["citations"],
            ragas_metrics=ragas_data,
            metrics=final_state.get("metrics")
        )

    return SearchResponse(
        answer=final_state["final_answer"],
        citations=final_state["citations"],
        metrics=final_state["metrics"]
    )

@router.post("/hybrid", response_model=SearchResponse, summary="Perform a hybrid search", description="Executes LangGraph RAG pipeline using metadata filtering and lazy embedding.")
async def search_hybrid(
    request: HybridSearchRequest,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Check 0.80 threshold Semantic Cache
    cached_res = await cache_service.get(request.query, current_user.email, "hybrid")
    if cached_res:
        cm = cached_res.get("metrics")
        return SearchResponse(
            answer=cached_res["answer"],
            citations=cached_res["citations"],
            metrics=Metrics(
                embedding_time_ms=0,
                retrieval_time_ms=0,
                prompt_tokens=getattr(cm, 'prompt_tokens', 0) if cm else 0,
                completion_tokens=getattr(cm, 'completion_tokens', 0) if cm else 0,
                total_tokens=getattr(cm, 'total_tokens', 0) if cm else 0,
                total_time_ms=1,
                semantic_cache_hit=True,
                cache_similarity=cached_res["similarity_score"],
                headroom_raw_input_tokens=getattr(cm, 'headroom_raw_input_tokens', 0) if cm else 0,
                headroom_saved_tokens=getattr(cm, 'headroom_saved_tokens', 0) if cm else 0,
                input_compression_ratio=getattr(cm, 'input_compression_ratio', 0.0) if cm else 0.0,
                caveman_saved_tokens=getattr(cm, 'caveman_saved_tokens', 0) if cm else 0,
                output_compression_ratio=getattr(cm, 'output_compression_ratio', 0.0) if cm else 0.0,
                prompt_optimization_mode=getattr(cm, 'prompt_optimization_mode', 'optimized_with_system') if cm else 'optimized_with_system',
                ragas_metrics=cached_res.get("ragas_metrics")
            )
        )

    initial_state = GraphState(
        search_type="hybrid",
        request=request,
        user=current_user,
        db_client=db,
        intent=None,
        candidate_docs=[],
        retrieved_chunks=[],
        context_text="",
        llm_response="",
        evaluation_score=None,
        final_answer="",
        citations=[],
        metrics=None,
        user_long_term_facts=[],
        is_cached=False
    )
    
    try:
        langfuse_handler = CallbackHandler()
        run_config = {
            "callbacks": [langfuse_handler],
            "metadata": {
                "langfuse_user_id": current_user.email,
                "langfuse_session_id": str(uuid.uuid4()),
                "langfuse_tags": ["hybrid_search"]
            }
        }
    except Exception as e:
        run_config = {}
    
    start_time = time.time()
    final_state = await graph.ainvoke(initial_state, config=run_config)
    total_time_ms = max(1, int((time.time() - start_time) * 1000))
    if final_state.get("metrics"):
        final_state["metrics"].total_time_ms = total_time_ms
    
    # Store in Semantic Cache
    if final_state.get("final_answer"):
        ragas_data = final_state["metrics"].ragas_metrics if final_state.get("metrics") else None
        await cache_service.put(
            query=request.query, 
            user_id=current_user.email, 
            mode="hybrid",
            answer=final_state["final_answer"],
            citations=final_state["citations"],
            ragas_metrics=ragas_data,
            metrics=final_state.get("metrics")
        )

    return SearchResponse(
        answer=final_state["final_answer"],
        citations=final_state["citations"],
        metrics=final_state["metrics"]
    )

from app.search.memory_service import MemoryService

@router.get("/memory", summary="Get User Session History & Long-Term Memory", description="Retrieves user short-term conversation turns and long-term facts.")
async def get_user_memory_history(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    memory_service = MemoryService(db)
    turns = MemoryService.get_short_term_turns(current_user.email)
    facts = await memory_service.get_user_long_term_facts(current_user.email, current_user.role.value)
    return {
        "user_email": current_user.email,
        "turns": turns,
        "long_term_facts": facts
    }

@router.delete("/memory", summary="Clear User Session History", description="Clears active short-term conversation history for the current user session.")
async def clear_user_memory_history(
    current_user: UserInDB = Depends(get_current_user)
):
    MemoryService.clear_short_term_turns(current_user.email)
    return {"message": f"Session history cleared for {current_user.email}"}

class PromptCompareRequest(BaseModel):
    query: str
    top_k: int = 5
    department: Optional[str] = None
    division: Optional[str] = None
    businessLine: Optional[str] = None

@router.post("/prompt-compare", summary="Compare Prompt Optimization Modes", description="Executes the RAG pipeline across 3 prompt modes: base, optimized_no_system, and optimized_with_system.")
async def compare_prompt_modes(
    request: PromptCompareRequest,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    results = {}
    modes = ["base", "optimized_no_system", "optimized_with_system"]
    
    for mode in modes:
        search_req = HybridSearchRequest(
            query=request.query,
            top_k=request.top_k,
            department=request.department,
            division=request.division,
            businessLine=request.businessLine,
            prompt_optimization_mode=mode
        )
        
        initial_state = GraphState(
            search_type="hybrid",
            request=search_req,
            user=current_user,
            db_client=db,
            intent=None,
            candidate_docs=[],
            retrieved_chunks=[],
            context_text="",
            llm_response="",
            evaluation_score=None,
            final_answer="",
            citations=[],
            metrics=None,
            user_long_term_facts=[],
            is_cached=False
        )
        
        final_state = await graph.ainvoke(initial_state, config={})
        
        messages = CavemanCompressor.build_prompt_messages(
            mode=mode,
            query=request.query,
            context_text=final_state.get("context_text", ""),
            long_term_facts=final_state.get("user_long_term_facts", [])
        )
        prompt_display = CavemanCompressor.format_prompt_display(messages)

        results[mode] = {
            "mode": mode,
            "prompt_text": prompt_display,
            "answer": final_state["final_answer"],
            "citations": final_state["citations"],
            "metrics": final_state["metrics"]
        }
        
    return {
        "query": request.query,
        "comparisons": results
    }

