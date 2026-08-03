# Corporate Onboarding & Training - Hackathon Presentation Speech

## 1. Elevator Pitch (1 Minute)

"Hello everyone! We’re excited to present the **Corporate Onboarding & Training Intelligence Hub**. In large enterprises, finding the right policy, training material, or video recording is like finding a needle in a haystack—and worse, employees often accidentally stumble upon confidential documents meant for other departments or business lines.

Our solution is a fully secure, Agentic AI-powered Knowledge Management platform. It uses Retrieval-Augmented Generation (RAG) orchestrated by LangGraph to answer employee questions instantly. But here's what sets us apart: 

First, it features strict, Business Line and Division-based Role-Based Access Control right down to the database query level. An Insurance manager only sees Insurance policies, while HR sees Corporate policies. 

Second, we support multi-modal ingestion for PDFs, Word docs, Audio recordings, and Video files. Our pipeline transcribes media with Whisper, groups speech into paragraph-level blocks, merges contiguous timestamp intervals, and renders an interactive timeline citation UI with hover tooltips displaying spoken speech snippets. 

Finally, with user-scoped Semantic Caching, Headroom & Caveman token compression, a Prompt Comparison matrix, and real-time RAGAS quality evaluations, we’ve built an enterprise platform that scales corporate knowledge securely, intelligently, and cost-effectively!"

---

## 2. Full Presentation Speech (5–7 Minutes)

### Introduction (1 minute)
"Hi everyone, my name is [Your Name/Team Name], and today I’m thrilled to introduce you to our project: The Corporate Onboarding & Training Intelligence Hub.

If you’ve ever joined a large enterprise, you know the friction of onboarding. You have dozens of questions: *'What’s the travel policy?'*, *'How do I set up my VPN?'*, *'What are my Business Line's specific compliance rules?'* Usually, finding these answers means digging through endless intranet pages or pinging busy colleagues.

Even worse, standard enterprise search tools lack domain context and suffer from security flaws where employees can search and access documents from business lines they shouldn't see. We set out to solve this by building a secure, multi-modal, and context-aware conversational AI search engine."

### Solution Overview & Technical Highlights (1.5 minutes)
"To solve this, we built a full-stack Agentic AI application using React with Framer Motion animations on the frontend and FastAPI with Python on the backend. 

At the heart of our platform is an Agentic RAG pipeline orchestrated by **LangGraph**. Instead of basic vector lookups, LangGraph acts as a deterministic state machine that detects query intent, enforces security, and routes retrieval. We use **MongoDB** for document metadata & RBAC filtering, and **ChromaDB** for vector similarity search.

We implemented three critical technical innovations:

1. **Multi-Format Audio & Video Ingestion**: We ingest PDFs, DOCX, PPTX, Images via OCR, and Audio/Video files (`.mp4`, `.avi`, `.mp3`, `.wav`). Video audio is extracted in under 0.5s via MoviePy and transcribed using OpenAI Whisper. To prevent vector bloat, we aggregate speech into 30–60 second paragraph blocks (`[MM:SS - MM:SS]`).

2. **User-Scoped Semantic Caching**: Before calling the LLM, we check our Semantic Cache. If the data is available in cache for that specific user identity, we return it instantly—slashing latency by 90% and saving token costs.

3. **Headroom & Caveman Token Compression**: We use Headroom for input context budgeting and Caveman for output token compression, dramatically reducing LLM token consumption while keeping answers accurate."

### Key Features & Demo Flow (2.5 minutes)
"Let me walk you through our interactive platform.

**[Demo Step 1: 3D Onboarding Orbit & Enterprise Roles]**
When you enter the application, you’re greeted by an interactive 3D Onboarding Orbit screen featuring circulating planetary roles. We log in as a Technical Manager assigned to the **BusinessLine** division for **Insurance**.

**[Demo Step 2: Overview Architecture Cards]**
Our Overview dashboard presents 6 core architectural modules:
- Multi-Format Hybrid Ingestion Engine
- Agentic RAG & LangGraph Routing (with Caching)
- RAGAS Automated Quality Assessment
- Dynamic Context Optimization (Headroom & Caveman)
- Prompt Comparison Matrix
- Enterprise Role & Business Line Alignment

**[Demo Step 3: Audio/Video Knowledge Upload]**
Next, we navigate to the Upload Portal. We select a video recording or audio file. Our ingestion pipeline extracts the audio track, transcribes it via Whisper, auto-generates AI summary tags, and stores paragraph-level timestamp chunks in our vector index.

**[Demo Step 4: Secure Hybrid Search & Interactive Timeline Citations]**
Now we ask a question: *'What was discussed in the team onboarding call?'*
LangGraph executes our Hybrid search. The answer appears alongside **Interactive Audio/Video Timeline Citations**:
- It displays a **🎥 Video Track** or **🎵 Audio Track** badge.
- Adjacent speech intervals (`00:00-00:52`, `00:52-01:39`) automatically merge into **1 continuous timestamp** (`00:00 - 04:10`).
- Non-overlapping centered labels highlight the exact cited ranges (`Cited (00:00 - 04:10)`).
- When hovering your cursor over the timeline bar, a **hover subscript tooltip** pops up displaying the exact spoken speech snippet for that timestamp!

**[Demo Step 5: Prompt Comparison & RAGAS Quality Metrics]**
We can also navigate to the **Prompt Comparison View** to benchmark how our prompt optimization modes perform side by side. Every response is automatically evaluated in real-time using **RAGAS metrics** (Faithfulness, Context Precision, and Answer Relevancy) and tracked via **Langfuse observability**."

### Business Value (1 minute)
"The business value of this architecture is tremendous:
1. **Uncompromised Security**: Strict RBAC enforced natively at the database level prevents cross-division data leakage.
2. **Multi-Modal Accessibility**: Employees can search across documents, townhall recordings, and training videos as easily as reading text.
3. **Implicit Trust**: Clickable document citations and interactive video timeline tooltips let employees verify facts instantly.
4. **Massive Cost-Efficiency**: With paragraph aggregation (>60% DB reduction), user-scoped Semantic Caching, and Headroom/Caveman token compression, LLM operating costs drop by up to 90%."

### Conclusion (30 seconds)
"In conclusion, we haven't just built a simple wrapper around an LLM. We've created an enterprise-grade, multi-modal, highly secure, and observable AI knowledge platform that transforms corporate onboarding and training. Thank you, and we’d be thrilled to take any questions!"

---

## 3. Likely Judge Questions & Suggested Answers

**Q1: How do you handle audio and video files during ingestion and search?**
*Answer:* "We support native audio (`.mp3`, `.wav`, `.m4a`) and video (`.mp4`, `.avi`, `.mov`, `.mkv`). For videos, we use MoviePy to extract the audio track in under 0.5 seconds. We then pass the audio to OpenAI Whisper API with `response_format='verbose_json'`. To avoid token bloat from 2-second speech fragments, we aggregate speech into 30–60 second paragraph blocks (`[MM:SS - MM:SS]`). During search, we merge adjacent intervals (e.g. `00:00-00:52` and `00:52-01:39` merge to `00:00 - 04:10`) and render an interactive timeline bar with hover tooltips displaying the exact spoken speech snippet."

**Q2: How does your Semantic Cache work and how do you prevent data leaks between users?**
*Answer:* "Our SemanticCacheService operates on two tiers: fast exact string match and cosine similarity matching on query embeddings (threshold 0.80). If a query is cached, we bypass the LLM and return the cached answer instantly. To guarantee security and privacy, every cache key is strictly scoped to the user's normalized identity (`user_email:mode:query`). User B can never hit or view User A's cached answers."

**Q3: How do you enforce security and Role-Based Access Control (RBAC)?**
*Answer:* "RBAC is enforced directly at the MongoDB metadata and ChromaDB query layer *before* any LLM processing happens. When a user queries the system, our backend extracts their role, division, and business line from their authenticated session token. Non-admin users are restricted to querying documents in the 'Corporate' division or their assigned 'Business Line' (e.g. Insurance, Retail, Engineering). Unauthorized documents are filtered out at the database level and never enter the prompt context."

**Q4: What is the purpose of the Prompt Comparison view and how does it optimize performance?**
*Answer:* "The Prompt Comparison View allows enterprise admins to benchmark three prompt optimization modes side by side: Base, Optimized without System Prompt, and Optimized with System Prompt. It visually highlights token savings from our Headroom context optimizer and Caveman output compressor while displaying live RAGAS quality scores so admins can tune prompts for maximum accuracy and lowest token cost."

**Q5: How do you measure answer quality and evaluate hallucinations?**
*Answer:* "We integrate the RAGAS evaluation framework and Langfuse observability. Every response is scored for Faithfulness, Answer Relevancy, and Context Precision. Additionally, every citation includes clickable document previews or interactive audio/video timeline tooltips, enabling human-in-the-loop verification."
