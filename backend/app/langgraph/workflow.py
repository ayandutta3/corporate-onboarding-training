from langgraph.graph import StateGraph, END
from app.langgraph.state import GraphState
from app.langgraph.nodes import (
    detect_intent,
    metadata_search,
    keyword_search,
    vector_search,
    prompt_builder,
    generate_response,
    evaluate_response
)

def build_search_graph():
    workflow = StateGraph(GraphState)
    
    # Add Nodes
    workflow.add_node("intent_detection", detect_intent)
    workflow.add_node("metadata_search", metadata_search)
    workflow.add_node("keyword_search", keyword_search)
    workflow.add_node("vector_search", vector_search)
    workflow.add_node("prompt_builder", prompt_builder)
    workflow.add_node("openai_generation", generate_response)
    workflow.add_node("evaluation", evaluate_response)
    
    # Add Edges (Linear flow as requested)
    workflow.set_entry_point("intent_detection")
    workflow.add_edge("intent_detection", "metadata_search")
    workflow.add_edge("metadata_search", "keyword_search")
    workflow.add_edge("keyword_search", "vector_search")
    workflow.add_edge("vector_search", "prompt_builder")
    workflow.add_edge("prompt_builder", "openai_generation")
    workflow.add_edge("openai_generation", "evaluation")
    workflow.add_edge("evaluation", END)
    
    # Compile
    return workflow.compile()
