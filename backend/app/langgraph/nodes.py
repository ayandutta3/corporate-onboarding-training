from app.langgraph.state import GraphState
from app.search.metadata import MetadataSearchService
from app.search.lazy_embedding import LazyEmbeddingService
from app.search.reranker import SemanticReranker
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.configuration.settings import get_settings
from app.search.models import Citation, Metrics
import time
import json

settings = get_settings()
llm = ChatOpenAI(temperature=0, openai_api_key=settings.openai_api_key)

async def detect_intent(state: GraphState) -> GraphState:
    prompt = PromptTemplate(
        input_variables=["query"],
        template="""Classify the user query intent into one of: 'policy', 'technical', or 'general'.
Query: {query}
Intent:"""
    )
    chain = prompt | llm
    response = await chain.ainvoke({"query": state["request"].query})
    intent = response.content.strip().lower()
    if intent not in ['policy', 'technical', 'general']:
        intent = 'general'
    
    # Initialize metrics if not present
    if "metrics" not in state or state["metrics"] is None:
        state["metrics"] = Metrics(
            embedding_time_ms=0, retrieval_time_ms=0, semantic_search_time_ms=0,
            embedding_generated_count=0, prompt_tokens=0, completion_tokens=0, total_tokens=0
        )
        
    state["intent"] = intent
    return state

async def metadata_search(state: GraphState) -> GraphState:
    if state.get("search_type") == "vector":
        state["candidate_docs"] = []
        return state
        
    start_time = time.time()
    db = state["db_client"]
    request = state["request"]
    user = state["user"]
    
    metadata_service = MetadataSearchService(db)
    role_filter = request.access_roles if request.access_roles else user.role.value
    if user.role.value == "admin":
        role_filter = request.access_roles # Admin can bypass unless explicit
        
    candidates = await metadata_service.get_candidate_documents(
        role=role_filter,
        department=request.department,
        knowledge_type=request.knowledge_type,
        status=request.status,
        version=request.version
    )
    
    state["metrics"].retrieval_time_ms += int((time.time() - start_time) * 1000)
    state["candidate_docs"] = candidates
    return state

async def keyword_search(state: GraphState) -> GraphState:
    if state.get("search_type") == "vector":
        return state
        
    # A simple fallback keyword search over candidate docs metadata/summary since OpenSearch is removed
    query_lower = state["request"].query.lower()
    query_words = {word for word in query_lower.replace("?", "").replace(".", "").split() if len(word) > 3}
    filtered_candidates = []
    
    for doc in state["candidate_docs"]:
        match = False
        
        # 1. Check if any tag appears exactly in the query
        if doc.ai_tags and any(tag.lower() in query_lower for tag in doc.ai_tags):
            match = True
            
        # 2. Check if any meaningful query word appears in filename or tags
        if not match:
            doc_text_to_search = doc.filename.lower() + " " + " ".join([t.lower() for t in (doc.ai_tags or [])])
            if any(word in doc_text_to_search for word in query_words):
                match = True
                
        # 3. Check if query is a substring of the summary
        if not match and doc.ai_summary and query_lower in doc.ai_summary.lower():
            match = True
            
        if match:
            filtered_candidates.append(doc)
            
    # We use keyword search as a strict filter. If no matches, we stop and don't fallback.
    state["candidate_docs"] = filtered_candidates
        
    return state

async def vector_search(state: GraphState) -> GraphState:
    db = state["db_client"]
    candidates = state["candidate_docs"]
    request = state["request"]
    
    if state.get("search_type") == "vector":
        from app.vector.repository import VectorRepository
        from app.vector.embedding import EmbeddingService
        vector_repo = VectorRepository()
        embedding_service = EmbeddingService()
        
        query_embedding, embedding_time_ms = await embedding_service.generate_embedding(request.query)
        start_time = time.time()
        results = vector_repo.search(query_embedding=query_embedding, top_k=request.top_k)
        retrieval_time_ms = int((time.time() - start_time) * 1000)
        
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        
        parsed_chunks = []
        for doc, meta in zip(documents, metadatas):
            parsed_chunks.append({"document": doc, "metadata": meta})
            
        state["metrics"].embedding_time_ms += embedding_time_ms
        state["metrics"].retrieval_time_ms += retrieval_time_ms
        state["retrieved_chunks"] = parsed_chunks
        return state

    if not candidates:
        state["retrieved_chunks"] = []
        return state
        
    from app.vector.repository import VectorRepository
    from app.vector.embedding import EmbeddingService
    
    vector_repo = VectorRepository()
    embedding_service = EmbeddingService()
    
    lazy_embedding_service = LazyEmbeddingService(db, vector_repo, embedding_service)
    reranker = SemanticReranker(vector_repo, embedding_service)
    
    _, lazy_embed_time_ms, generated_count = await lazy_embedding_service.ensure_embeddings(candidates)
    
    candidate_ids = [str(c.id) for c in candidates]
    results, query_embed_time_ms, semantic_search_time_ms = await reranker.search_and_rerank(
        query=request.query, 
        candidate_document_ids=candidate_ids, 
        top_k=request.top_k
    )
    
    state["metrics"].embedding_time_ms += (lazy_embed_time_ms + query_embed_time_ms)
    state["metrics"].semantic_search_time_ms += semantic_search_time_ms
    state["metrics"].embedding_generated_count += generated_count
    
    state["retrieved_chunks"] = results
    return state

async def prompt_builder(state: GraphState) -> GraphState:
    context_text = ""
    citations = []
    seen_documents = set()
    
    for i, res in enumerate(state.get("retrieved_chunks", [])):
        doc = res["document"]
        meta = res["metadata"]
        context_text += f"\n--- Source {i+1} ---\n{doc}\n"
        
        doc_name = meta.get("document_name", "Unknown")
        if doc_name not in seen_documents:
            seen_documents.add(doc_name)
            citations.append(Citation(
                document_name=doc_name,
                version=meta.get("version"),
                page_number=meta.get("page_number"),
                section=meta.get("section"),
                timestamp=meta.get("timestamp")
            ))
        
    state["context_text"] = context_text
    state["citations"] = citations
    return state

async def generate_response(state: GraphState) -> GraphState:
    if not state.get("retrieved_chunks"):
        state["llm_response"] = "I don't have enough information to answer that based on your access level or current search filters."
        return state
        
    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""You are a helpful corporate onboarding and training assistant.
Use the following pieces of retrieved context to answer the user's question.
If the answer is not in the context, say "I don't know based on the provided documents."

Context:
{context}

Question:
{question}

Answer:"""
    )
    
    chain = prompt | llm
    response = await chain.ainvoke({"context": state["context_text"], "question": state["request"].query})
    
    usage = getattr(response, "usage_metadata", {}) or {}
    token_usage = response.response_metadata.get("token_usage", {})
    
    state["metrics"].prompt_tokens += usage.get("input_tokens", token_usage.get("prompt_tokens", 0))
    state["metrics"].completion_tokens += usage.get("output_tokens", token_usage.get("completion_tokens", 0))
    state["metrics"].total_tokens += usage.get("total_tokens", token_usage.get("total_tokens", 0))
    
    state["llm_response"] = response.content
    return state

async def evaluate_response(state: GraphState) -> GraphState:
    if not state.get("retrieved_chunks"):
        state["evaluation_score"] = "pass"
        state["final_answer"] = state["llm_response"]
        return state
        
    prompt = PromptTemplate(
        input_variables=["context", "answer"],
        template="""Evaluate if the following Answer is supported by the Context.
Reply ONLY with 'pass' if supported or 'fail' if it hallucinates information.

Context:
{context}

Answer:
{answer}"""
    )
    chain = prompt | llm
    eval_response = await chain.ainvoke({"context": state["context_text"], "answer": state["llm_response"]})
    score = eval_response.content.strip().lower()
    
    if "fail" in score:
        state["evaluation_score"] = "fail"
        state["final_answer"] = "I apologize, but I could not formulate a reliable answer from the provided documents."
    else:
        state["evaluation_score"] = "pass"
        state["final_answer"] = state["llm_response"]
        
    return state
