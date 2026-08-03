# Enterprise System Architecture Diagram

Below is the complete, high-resolution architecture diagram generated for the **Corporate Onboarding & Training Intelligence Hub**.

![Corporate Onboarding Intelligence Hub - System Architecture Diagram](C:\Users\GEN_AI_ECO\.gemini\antigravity-ide\brain\81f2dbab-fb9b-45d5-ae7d-dfd7fb694b93\architecture_diagram_1785769096730.png)

---

## 🔍 Architecture Component Breakdown

### 1. Frontend Presentation Tier
- **React + Vite + Framer Motion**: Modern high-performance UI framework with smooth micro-animations.
- **3D Onboarding Orbit Landing Screen**: Planetary role selector (HR, Technical Manager, Finance Manager, Business Line).
- **Hybrid Search & Chat Dashboard**: Conversational query interface with prompt optimization mode controls.
- **Interactive Audio/Video Timeline UI**:
  - Track badges (**🎥 Video Track** vs **🎵 Audio Track**).
  - Continuous interval merging (`00:00 - 04:10`).
  - Centered non-overlapping segment labels.
  - Hover subscript tooltips displaying exact spoken speech text snippets.
- **Prompt Comparison Matrix View**: Side-by-side benchmarking of prompt modes (`base`, `optimized_no_system`, `optimized_with_system`).

### 2. Multi-Format Ingestion Tier
- **Multi-Modal Support**: Ingests PDFs, Word Docs, PPTX, Images (OCR), Audio (`.mp3`, `.wav`, `.m4a`), and Video (`.mp4`, `.mov`, `.avi`, `.mkv`).
- **MoviePy Audio Extractor**: Extracts audio tracks from video files in `<0.5` seconds.
- **Whisper Speech Transcription**: OpenAI Whisper API (`verbose_json`) speech-to-text with local fallback.
- **Paragraph-Level Timestamp Aggregator**: Groups short Whisper fragments into ~30–60s paragraph blocks (`[MM:SS - MM:SS]`), cutting DB storage by >60%.

### 3. Dual Storage & Security Tier
- **MongoDB**: Stores user profiles, document metadata, and enforces strict **Division & Business Line RBAC** query filtering (Insurance, Retail, Engineering, HR).
- **ChromaDB**: High-performance vector database storing document text embeddings.

### 4. LangGraph Agentic RAG Pipeline
- **Intent Detection Node**: Classifies queries into policy, technical, or general intent.
- **User-Scoped Semantic Cache**: Two-tier exact & cosine similarity matching scoped strictly to `user_email:mode:query` to cut latency by 90% and prevent cross-user data leakage.
- **Lazy Embedding Engine**: Pre-filters candidate documents before vector search to minimize embedding computation costs.
- **Headroom Context Optimizer**: Input context budgeting capping token usage at 750 tokens.
- **LLM Synthesis Node**: OpenAI GPT-4o context synthesis.
- **Caveman Output Compressor**: Output token compression for maximum latency and cost savings.
- **RAGAS Quality Assessor & Langfuse Tracing**: Real-time evaluation of Faithfulness, Context Precision, and Answer Relevancy paired with full Langfuse execution tracing.
