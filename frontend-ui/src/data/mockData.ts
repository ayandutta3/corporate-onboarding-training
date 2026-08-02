import { AuthUser, Citation, SearchResponse, Trace, UploadedDoc } from '../types';

export const DEMO_PERSONAS: AuthUser[] = [
  {
    email: 'admin@corp.internal',
    role: 'admin',
    token: 'mock-jwt-admin-token-8849',
  },
  {
    email: 'hr.director@corp.internal',
    role: 'hr',
    token: 'mock-jwt-hr-token-3920',
  },
  {
    email: 'tech.lead@corp.internal',
    role: 'technical_manager',
    token: 'mock-jwt-tech-token-1102',
  },
  {
    email: 'finance.lead@corp.internal',
    role: 'finance_manager',
    token: 'mock-jwt-finance-token-7741',
  },
  {
    email: 'alex.employee@corp.internal',
    role: 'user',
    token: 'mock-jwt-user-token-9982',
  },
];

export const SUGGESTED_QUERIES = [
  {
    title: 'Q3 Expense & Travel Policy',
    query: 'What are the spending limits, receipt requirements, and travel pre-approval guidelines for Q3 employee travel?',
    department: 'Corporate Finance & Ops',
    icon: 'Receipt',
  },
  {
    title: 'Developer Onboarding & Local Setup',
    query: 'How do I request AWS sandbox credentials, configure Git SSO keys, and spin up local Docker dev environments?',
    department: 'Core Architecture',
    icon: 'Terminal',
  },
  {
    title: 'Health Benefits & Dental Plan',
    query: 'What are the coverage tiers for family dental care, mental health counseling allowances, and vision claims submission procedures?',
    department: 'People & Culture',
    icon: 'HeartHandshake',
  },
  {
    title: 'Remote Work Compliance & Security',
    query: 'What are the strict IT security requirements for operating on public Wi-Fi networks when working internationally?',
    department: 'Global Infrastructure & IT',
    icon: 'ShieldCheck',
  },
];

export const INITIAL_DOCUMENTS: UploadedDoc[] = [
  {
    id: 'doc-101',
    fileName: 'Global_Travel_and_Expense_Policy_Q3_2026.pdf',
    fileSize: 2450000,
    fileType: 'application/pdf',
    mode: 'hybrid',
    department: 'Corporate Finance & Ops',
    uploadedBy: 'David Chen',
    timestamp: '2026-07-28 14:22',
    chunksCount: 142,
    status: 'completed',
    vectorId: 'chroma-col-fin-101',
    embeddingModel: 'text-embedding-3-large',
  },
  {
    id: 'doc-102',
    fileName: 'Engineering_Security_and_SSO_Handbook_v4.md',
    fileSize: 890000,
    fileType: 'text/markdown',
    mode: 'vector',
    department: 'Core Architecture',
    uploadedBy: 'Marcus Vance',
    timestamp: '2026-07-29 09:15',
    chunksCount: 88,
    status: 'completed',
    vectorId: 'chroma-col-eng-102',
    embeddingModel: 'text-embedding-3-small',
  },
  {
    id: 'doc-103',
    fileName: 'Comprehensive_HR_Benefits_Guide_2026.pdf',
    fileSize: 4120000,
    fileType: 'application/pdf',
    mode: 'hybrid',
    department: 'People & Culture',
    uploadedBy: 'Elena Rostova',
    timestamp: '2026-07-30 11:40',
    chunksCount: 210,
    status: 'completed',
    vectorId: 'chroma-col-hr-103',
    embeddingModel: 'text-embedding-3-large',
  },
  {
    id: 'doc-104',
    fileName: 'Information_Security_Incident_Response_Plan.pdf',
    fileSize: 1850000,
    fileType: 'application/pdf',
    mode: 'hybrid',
    department: 'Global Infrastructure & IT',
    uploadedBy: 'Sarah Connor',
    timestamp: '2026-07-31 16:05',
    chunksCount: 94,
    status: 'completed',
    vectorId: 'chroma-col-it-104',
    embeddingModel: 'text-embedding-3-large',
  },
];

export const INITIAL_TRACES: Trace[] = [
  {
    id: 'trace-8841-a1',
    timestamp: '2026-08-01 05:42:12',
    query: 'What are the domestic per diem meal limits for executive travel?',
    user_email: 'finance.lead@corp.internal',
    role: 'finance_manager',
    search_mode: 'hybrid',
    total_latency_ms: 382,
    prompt_tokens: 1240,
    completion_tokens: 280,
    status: 'success',
    graph_nodes: ['QueryRewriter', 'ChromaDBHybridSearch', 'CrossEncoderReranker', 'GeminiSynthesis'],
    top_relevance: 0.962,
    department_filter: 'Corporate Finance & Ops',
    embedding_time_ms: 42,
    retrieval_time_ms: 118,
    llm_generation_time_ms: 222,
  },
  {
    id: 'trace-8840-b2',
    timestamp: '2026-08-01 05:15:09',
    query: 'How do I set up SSO credentials for local Kubernetes cluster access?',
    user_email: 'alex.employee@corp.internal',
    role: 'user',
    search_mode: 'vector',
    total_latency_ms: 415,
    prompt_tokens: 1580,
    completion_tokens: 395,
    status: 'success',
    graph_nodes: ['QueryRewriter', 'ChromaDBVectorSearch', 'GeminiSynthesis'],
    top_relevance: 0.915,
    department_filter: 'Core Architecture',
    embedding_time_ms: 51,
    retrieval_time_ms: 144,
    llm_generation_time_ms: 220,
  },
  {
    id: 'trace-8839-c3',
    timestamp: '2026-08-01 04:30:44',
    query: 'What is the parental leave duration for primary vs secondary caregivers?',
    user_email: 'hr.director@corp.internal',
    role: 'hr',
    search_mode: 'hybrid',
    total_latency_ms: 310,
    prompt_tokens: 990,
    completion_tokens: 210,
    status: 'success',
    graph_nodes: ['QueryRewriter', 'ChromaDBHybridSearch', 'CrossEncoderReranker', 'GeminiSynthesis'],
    top_relevance: 0.984,
    department_filter: 'People & Culture',
    embedding_time_ms: 38,
    retrieval_time_ms: 92,
    llm_generation_time_ms: 180,
  },
  {
    id: 'trace-8838-d4',
    timestamp: '2026-08-01 03:50:11',
    query: 'Zero-trust network access key rotation frequency policy',
    user_email: 'admin@corp.internal',
    role: 'admin',
    search_mode: 'hybrid',
    total_latency_ms: 512,
    prompt_tokens: 2100,
    completion_tokens: 420,
    status: 'success',
    graph_nodes: ['QueryRewriter', 'ChromaDBHybridSearch', 'CrossEncoderReranker', 'HallucinationCheck', 'GeminiSynthesis'],
    top_relevance: 0.941,
    department_filter: 'Global Infrastructure & IT',
    embedding_time_ms: 64,
    retrieval_time_ms: 188,
    llm_generation_time_ms: 260,
  },
  {
    id: 'trace-8837-e5',
    timestamp: '2026-08-01 02:10:00',
    query: 'How to claim annual home office ergonomics equipment reimbursement?',
    user_email: 'alex.employee@corp.internal',
    role: 'user',
    search_mode: 'vector',
    total_latency_ms: 295,
    prompt_tokens: 840,
    completion_tokens: 195,
    status: 'success',
    graph_nodes: ['QueryRewriter', 'ChromaDBVectorSearch', 'GeminiSynthesis'],
    top_relevance: 0.892,
    department_filter: 'All Departments',
    embedding_time_ms: 35,
    retrieval_time_ms: 95,
    llm_generation_time_ms: 165,
  },
];

export function getMockRAGResponse(query: string, mode: 'vector' | 'hybrid'): SearchResponse {
  const isHybrid = mode === 'hybrid';
  const lowerQ = query.toLowerCase();

  let answer = '';
  let citations: Citation[] = [];

  if (lowerQ.includes('expense') || lowerQ.includes('travel') || lowerQ.includes('receipt')) {
    answer = `Based on the **Q3 2026 Corporate Travel & Expense Policy**, here are the mandatory guidelines for employees:

### 1. Spending Limits & Per Diem Allowances
* **Domestic Travel Meals:** Up to **$85/day** (no single meal exceeding $45).
* **International Travel Meals:** Up to **$135/day** (or actual reasonable cost in High-Cost Tier cities like London, Tokyo, Zurich).
* **Lodging Cap:** Standard hotel limit is **$250/night** for domestic and **$380/night** for international metropolitan centers.

### 2. Receipt Requirements
* Itemized receipts are **mandatory** for any business expenditure exceeding **$25.00 USD**.
* Credit card charge slips alone are *not* acceptable; itemized vendor breakdowns showing tax and line items must be attached via the **Expensify / Concur portal** within **14 calendar days** of transaction.

### 3. Pre-Approval Workflows
* Travel costing over **$1,500 USD** total requires prior written sign-off from your Department VP and Finance Manager via Jira Ticket \`FIN-TRAVEL-REQ\`.`;

    citations = [
      {
        id: 'cit-1',
        title: 'Global Travel & Expense Policy Q3 2026',
        source: 'Global_Travel_and_Expense_Policy_Q3_2026.pdf',
        department: 'Corporate Finance & Ops',
        score: isHybrid ? 0.978 : 0.912,
        excerpt: 'Section 3.2: Itemized receipts are required for all transactions >= $25.00 USD. Per diem rate for domestic standard cities is $85/day split across breakfast ($20), lunch ($25), dinner ($40).',
        pageNumber: 14,
        chunkId: 'chk-fin-089',
        author: 'David Chen',
      },
      {
        id: 'cit-2',
        title: 'Executive Financial Delegation Matrix',
        source: 'Finance_Delegation_Matrix_2026.xlsx',
        department: 'Corporate Finance & Ops',
        score: isHybrid ? 0.945 : 0.880,
        excerpt: 'Level 2 Approvals: Travel expenditure above $1,500 requires dual authorization from VP level and Corporate Finance Director before booking flights.',
        pageNumber: 2,
        chunkId: 'chk-fin-012',
        author: 'Financial Operations Committee',
      },
    ];
  } else if (lowerQ.includes('onboard') || lowerQ.includes('docker') || lowerQ.includes('sso') || lowerQ.includes('git') || lowerQ.includes('aws')) {
    answer = `Welcome to Engineering Onboarding! Follow this step-by-step technical bootstrap protocol:

### 1. Identity & SSO Credentialing
* **Okta / SAML Integration:** Request access via \`idp.corp.internal/request-role\` with key role \`eng-developer-devnet\`.
* **Git SSH Key Provisioning:** Upload your Hardware YubiKey public key to GitHub Enterprise under \`Settings -> SSH and GPG keys\`.

### 2. Local Docker Environment Setup
1. Clone the core engineering repository:
   \`\`\`bash
   git clone git@github.corp.internal:architecture/core-platform.git
   cd core-platform
   \`\`\`
2. Boot the containerized backend stack using local compose:
   \`\`\`bash
   make dev-bootstrap
   docker compose -f docker-compose.dev.yml up -d
   \`\`\`

### 3. AWS Sandbox Allocation
* Run \`aws-vault exec dev-sandbox -- aws sts get-caller-identity\` to verify local security tokens. Sandbox environments automatically auto-terminate unutilized resources after 8 hours of inactivity.`;

    citations = [
      {
        id: 'cit-3',
        title: 'Engineering Security & Developer Handbook',
        source: 'Engineering_Security_and_SSO_Handbook_v4.md',
        department: 'Core Architecture',
        score: isHybrid ? 0.985 : 0.925,
        excerpt: 'Developer Sandbox Provisioning: All local dev environments must run Docker Desktop v4.28+ with hardware-backed SSH key signing via YubiKey. AWS dev sandbox keys rotate every 12 hours.',
        pageNumber: 5,
        chunkId: 'chk-eng-044',
        author: 'Marcus Vance',
      },
      {
        id: 'cit-4',
        title: 'Zero Trust Network Architecture Whitepaper',
        source: 'Zero_Trust_Architecture_v2.pdf',
        department: 'Global Infrastructure & IT',
        score: isHybrid ? 0.910 : 0.865,
        excerpt: 'Access Control: Engineering SSH access requires short-lived certificates issued by HashiCorp Vault CA upon successful WebAuthn MFA prompt.',
        pageNumber: 11,
        chunkId: 'chk-it-102',
        author: 'Sarah Connor',
      },
    ];
  } else if (lowerQ.includes('health') || lowerQ.includes('dental') || lowerQ.includes('benefit') || lowerQ.includes('leave')) {
    answer = `Here is a summary of your **Comprehensive Corporate HR Benefits & Coverage**:

### 1. Family Dental & Vision Tiers
* **Preventive Dental:** Covered at **100%** with zero deductible (includes bi-annual cleanings, X-rays, and fluoride treatment).
* **Major Dental & Orthodontics:** Covered at **80%** up to an annual maximum benefit of **$3,500/member**.
* **Vision Allowance:** **$400/year** per employee for frames/contacts plus full annual eye exam coverage via VSP network.

### 2. Mental Health & Wellness Allowance
* **EAP Counseling:** 12 complimentary 1-on-1 sessions per year per household with certified therapists via Lyra Health.
* **Annual Wellness Stipend:** **$1,200/year** usable for gym memberships, home fitness equipment, or mindfulness apps via the \`Navan Benefits\` portal.

### 3. Parental & Caregiver Leave
* **Primary Caregiver:** **18 weeks** of 100% paid parental leave.
* **Secondary Caregiver:** **12 weeks** of 100% paid parental leave.`;

    citations = [
      {
        id: 'cit-5',
        title: 'Comprehensive HR Benefits Guide 2026',
        source: 'Comprehensive_HR_Benefits_Guide_2026.pdf',
        department: 'People & Culture',
        score: isHybrid ? 0.991 : 0.938,
        excerpt: 'Section 4.1 Dental Care: Delta Dental Premier Plan provides 100% coverage for Class I preventive care, 80% for Class II basic services, 50% for Class III major services up to $3,500 annual limit.',
        pageNumber: 22,
        chunkId: 'chk-hr-112',
        author: 'Elena Rostova',
      },
    ];
  } else {
    answer = `### Retrieval Summary: ${query}

Our **LangGraph RAG pipeline** executed across ChromaDB vector store and metadata index for department documents:

1. **Query Analysis:** Contextual rewriter expanded query keywords and normalized acronyms.
2. **${mode.toUpperCase()} Retrieval:** Extracted top k=5 semantic matches with metadata-boosted ranking score.
3. **Synthesis:** Verified context consistency and synthesized answer with strict citation grounding.

### Recommended Steps:
* Refer to the cited official documentation attachments below for exact compliance text.
* Reach out to your department manager or IT Service Desk via Slack \`#help-onboarding\` if further specific clarification is needed.`;

    citations = [
      {
        id: 'cit-gen-1',
        title: 'Enterprise Policy & Operational Guidelines',
        source: 'Enterprise_Policy_Framework_2026.pdf',
        department: 'Global Infrastructure & IT',
        score: isHybrid ? 0.952 : 0.890,
        excerpt: `Direct excerpt matching user inquiry '${query.slice(0, 40)}...': All employees must abide by standard operational risk frameworks and consult department lead for policy exceptions.`,
        pageNumber: 3,
        chunkId: 'chk-gen-001',
        author: 'Compliance Officer',
      },
    ];
  }

  const prompt_tokens = Math.floor(Math.random() * 400) + 900;
  const completion_tokens = Math.floor(Math.random() * 200) + 220;
  const embedding_time_ms = Math.floor(Math.random() * 25) + 30;
  const retrieval_time_ms = isHybrid ? Math.floor(Math.random() * 45) + 85 : Math.floor(Math.random() * 35) + 60;
  const total_time_ms = embedding_time_ms + retrieval_time_ms + Math.floor(Math.random() * 150) + 180;

  return {
    answer,
    citations,
    metrics: {
      prompt_tokens,
      completion_tokens,
      embedding_time_ms,
      retrieval_time_ms,
      total_time_ms,
    },
    graph_execution_path: isHybrid
      ? ['QueryRewriter', 'ChromaDBHybridSearch', 'CrossEncoderReranker', 'HallucinationCheck', 'GeminiSynthesis']
      : ['QueryRewriter', 'ChromaDBVectorSearch', 'GeminiSynthesis'],
    query,
    mode,
    timestamp: new Date().toLocaleTimeString(),
  };
}
