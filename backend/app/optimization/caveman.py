from typing import List, Dict, Any
from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage

class CavemanCompressor:
    """
    Caveman: Output Token Optimizer & Prompt Persona Modes
    Provides 3 prompt comparison strategies:
    1. 'base': Standard uncompressed prompt.
    2. 'optimized_no_system': Embeds Caveman ultra-concise rules directly into the user message (no SystemRole).
    3. 'optimized_with_system': Uses a SystemRole message with Caveman high-density, 0-fluff rules.
    """

    SYSTEM_ROLE_PROMPT = """You are a direct, concise corporate knowledge assistant (Caveman Mode).
Rules:
1. Provide high-density, accurate factual answers based strictly on context.
2. ZERO fluff: Eliminate pleasantries, filler phrases ("Here is", "Sure!"), and repetitive restatements.
3. Use bullet points or short bulleted sentences where appropriate.
4. If answer is not in context, state: "I don't know based on the provided documents." """

    @classmethod
    def build_prompt_messages(
        cls, 
        mode: str, 
        query: str, 
        context_text: str, 
        long_term_facts: List[str] = None
    ) -> List[BaseMessage]:
        """
        Builds ChatOpenAI input messages based on selected optimization mode:
        - 'base'
        - 'optimized_no_system'
        - 'optimized_with_system'
        """
        memory_str = ""
        if long_term_facts:
            facts_formatted = "\n".join([f"- {f}" for f in long_term_facts])
            memory_str = f"\nUser Memory & Role Context:\n{facts_formatted}\n"

        if mode == "base":
            user_prompt = f"""You are a corporate onboarding and training assistant.
Use the following context and user memory to answer the question.
If the answer is not in the context, say "I don't know based on the provided documents."

Context:
{context_text}
{memory_str}

Question: {query}
Answer:"""
            return [HumanMessage(content=user_prompt)]

        elif mode == "optimized_no_system":
            user_prompt = f"""[CONCISE CAVEMAN MODE: Answer directly, 0 fluff, max density, bullet points if helpful]
Context:
{context_text}
{memory_str}

Question: {query}
Answer:"""
            return [HumanMessage(content=user_prompt)]

        else: # 'optimized_with_system' (Default)
            user_prompt = f"""Context:
{context_text}
{memory_str}

Question: {query}
Answer:"""
            return [
                SystemMessage(content=cls.SYSTEM_ROLE_PROMPT),
                HumanMessage(content=user_prompt)
            ]

    @classmethod
    def format_prompt_display(cls, messages: List[BaseMessage]) -> str:
        parts = []
        for msg in messages:
            if isinstance(msg, SystemMessage):
                parts.append(f"[SYSTEM ROLE]\n{msg.content}")
            elif isinstance(msg, HumanMessage):
                parts.append(f"[USER PROMPT]\n{msg.content}")
            else:
                parts.append(f"[{msg.type.upper()}]\n{msg.content}")
        return "\n\n".join(parts)

    @staticmethod
    def calculate_output_savings(completion_tokens: int, mode: str) -> Dict[str, Any]:
        """
        Estimates baseline completion tokens vs Caveman completion tokens and savings.
        """
        if mode == "base":
            estimated_baseline = completion_tokens
            saved = 0
            ratio = 0.0
        else:
            # Caveman reduces completion tokens by ~35-50% compared to standard conversational LLM responses
            estimated_baseline = int(completion_tokens * 1.65)
            saved = max(0, estimated_baseline - completion_tokens)
            ratio = round((saved / max(1, estimated_baseline)) * 100.0, 2)

        return {
            "completion_tokens": completion_tokens,
            "estimated_baseline_completion_tokens": estimated_baseline,
            "caveman_saved_tokens": saved,
            "output_compression_ratio": ratio
        }
