import os
import re
from typing import List, Dict, Any, Tuple
from app.ingestion.pii_scrubber import scrub_pii_for_llm

try:
    import tiktoken
    tokenizer = tiktoken.get_encoding("cl100k_base")
except Exception:
    tokenizer = None

def count_tokens(text: str) -> int:
    if not text:
        return 0
    if tokenizer:
        try:
            return len(tokenizer.encode(text))
        except Exception:
            pass
    # Fallback heuristic: ~4 characters per token
    return max(1, len(text) // 4)

class HeadroomOptimizer:
    """
    Headroom: Input Token Context Optimizer
    - Deduplicates overlapping text paragraphs across retrieved chunks.
    - Strips redundant whitespace, blank lines, and boilerplate headers.
    - Enforces maximum input token context window budget without slicing sentences.
    - Measures exact input token savings and compression ratio.
    """
    def __init__(self, max_token_budget: int = 750):
        self.max_token_budget = max_token_budget

    @staticmethod
    def _clean_text(text: str) -> str:
        if not text:
            return ""
        # Scrub PII strictly for context window
        text = scrub_pii_for_llm(text)
        # Normalize multiple spaces, tabs, and excess newlines
        text = re.sub(r'[ \t]+', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text.strip()

    def optimize_context(
        self, 
        retrieved_chunks: List[Dict[str, Any]], 
        max_budget: int = None
    ) -> Tuple[str, int, int, int, float]:
        """
        Returns:
            (optimized_context_text, raw_tokens, optimized_tokens, saved_tokens, compression_ratio)
        """
        budget = max_budget or self.max_token_budget
        
        # 1. Calculate Raw Baseline (unoptimized)
        raw_text_parts = []
        for i, res in enumerate(retrieved_chunks):
            doc_str = res.get("document", "")
            raw_text_parts.append(f"\n--- Source {i+1} ---\n{doc_str}\n")
        raw_full_text = "".join(raw_text_parts)
        raw_tokens = count_tokens(raw_full_text)

        # 2. Optimization: Deduplicate & Clean Paragraphs
        seen_paragraphs = set()
        optimized_sources = []
        current_tokens = 0

        for i, res in enumerate(retrieved_chunks):
            doc_str = res.get("document", "")
            meta = res.get("metadata", {})
            doc_name = meta.get("document_name", f"Source {i+1}")

            cleaned_doc = self._clean_text(doc_str)
            paragraphs = cleaned_doc.split("\n\n")

            unique_paragraphs = []
            for p in paragraphs:
                p_normalized = p.strip().lower()
                if len(p_normalized) > 20:
                    if p_normalized in seen_paragraphs:
                        continue
                    seen_paragraphs.add(p_normalized)
                unique_paragraphs.append(p.strip())

            source_body = "\n".join([p for p in unique_paragraphs if p])
            if not source_body:
                continue

            source_block = f"[{doc_name}]\n{source_body}\n"
            block_tokens = count_tokens(source_block)

            if current_tokens + block_tokens <= budget:
                optimized_sources.append(source_block)
                current_tokens += block_tokens
            else:
                # Truncate remaining budget cleanly at paragraph boundary
                remaining_budget = budget - current_tokens
                if remaining_budget > 50:
                    truncated_paragraphs = []
                    sub_tokens = 0
                    for p in unique_paragraphs:
                        pt = count_tokens(p)
                        if sub_tokens + pt <= remaining_budget:
                            truncated_paragraphs.append(p)
                            sub_tokens += pt
                        else:
                            break
                    if truncated_paragraphs:
                        trunc_block = f"[{doc_name}]\n" + "\n".join(truncated_paragraphs) + "\n"
                        optimized_sources.append(trunc_block)
                        current_tokens += sub_tokens
                break

        optimized_context = "\n".join(optimized_sources).strip()
        optimized_tokens = count_tokens(optimized_context)
        saved_tokens = max(0, raw_tokens - optimized_tokens)
        ratio = round((saved_tokens / max(1, raw_tokens)) * 100.0, 2) if raw_tokens > 0 else 0.0

        return optimized_context, raw_tokens, optimized_tokens, saved_tokens, ratio
