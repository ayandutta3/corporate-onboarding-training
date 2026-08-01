from fastapi import APIRouter, Depends
from app.authentication.dependencies import get_current_user
from app.authentication.models import UserInDB
from app.search.models import SearchRequest, SearchResponse, HybridSearchRequest
from app.repository.database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.langgraph.workflow import build_search_graph
from app.langgraph.state import GraphState
from app.configuration.settings import get_settings
from langfuse.langchain import CallbackHandler
import uuid
import os

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

@router.post("/vector", response_model=SearchResponse, summary="Perform a vector search", description="Executes LangGraph RAG pipeline using pure vector similarity.")
async def search_vector(
    request: SearchRequest,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
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
        metrics=None
    )
    
    langfuse_handler = CallbackHandler()
    
    run_config = {
        "callbacks": [langfuse_handler],
        "metadata": {
            "langfuse_user_id": current_user.email,
            "langfuse_session_id": str(uuid.uuid4()),
            "langfuse_tags": ["vector_search"]
        }
    }
    
    final_state = await graph.ainvoke(initial_state, config=run_config)
    
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
        metrics=None
    )
    
    langfuse_handler = CallbackHandler()
    
    run_config = {
        "callbacks": [langfuse_handler],
        "metadata": {
            "langfuse_user_id": current_user.email,
            "langfuse_session_id": str(uuid.uuid4()),
            "langfuse_tags": ["hybrid_search"]
        }
    }
    
    final_state = await graph.ainvoke(initial_state, config=run_config)
    
    return SearchResponse(
        answer=final_state["final_answer"],
        citations=final_state["citations"],
        metrics=final_state["metrics"]
    )
