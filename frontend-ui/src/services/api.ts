import { AuthUser, SearchFilters, SearchResponse, Trace, UploadedDoc, UserRole } from '../types';

export const DEFAULT_BACKEND_URL = 'http://localhost:8000';

export interface ApiState {
  backendUrl: string;
  isDemoMode: boolean;
  isConnected: boolean | null;
  lastChecked: string | null;
}

let activeDocs: UploadedDoc[] = [];

// Helper to decode JWT
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function checkBackendHealth(backendUrl: string = DEFAULT_BACKEND_URL): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 1500);
    // /monitoring/traces will return 401 if unauthorized, which means the backend is ALIVE.
    const res = await fetch(`${backendUrl}/monitoring/traces`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(id);
    return res.ok || res.status === 401 || res.status === 403;
  } catch {
    return false;
  }
}

export async function loginUser(
  email: string,
  password: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<{ user: AuthUser; token: string }> {
  
  // FastAPI OAuth2PasswordRequestForm expects x-www-form-urlencoded
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const res = await fetch(`${backendUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  if (!res.ok) {
    throw new Error('Invalid credentials or backend unavailable.');
  }

  const data = await res.json();
  const token = data.access_token;
  
  // Decode JWT to get user details
  const payload = parseJwt(token);
  const role: UserRole = payload?.role || 'user';
  
  const user: AuthUser = {
    email: payload?.sub || email,
    role,
    name: email.split('@')[0].toUpperCase(),
    department: 'Enterprise Operations',
    token,
  };
  
  return { user, token };
}

export async function createAdminUser(
  userData: { email: string; password: string; role: UserRole },
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<{ success: boolean; message: string }> {
  
  const res = await fetch(`${backendUrl}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  if (res.ok) {
    return { success: true, message: `User ${userData.email} successfully created!` };
  }
  const err = await res.json().catch(() => ({}));
  return { success: false, message: err.detail || 'Failed to create user.' };
}

export async function uploadDocument(
  file: File,
  mode: 'vector' | 'hybrid',
  department: string,
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<UploadedDoc> {
  const endpoint = mode === 'hybrid' ? '/upload/hybrid' : '/upload/vector';
  
  const formData = new FormData();
  formData.append('file', file);
  // Backend infers department from JWT, but we send it just in case.
  formData.append('department', department);

  const res = await fetch(`${backendUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Upload failed.');
  }

  const data = await res.json();
  
  const doc: UploadedDoc = {
    id: data.document_id || `doc-${Date.now()}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    mode,
    department,
    uploadedBy: 'Active User',
    timestamp: new Date().toLocaleString(),
    chunksCount: Math.floor(file.size / 1500) + 1, // Synthesized
    status: 'completed',
    vectorId: data.document_id || `chroma-${Date.now()}`,
    embeddingModel: mode === 'hybrid' ? 'text-embedding-3-large' : 'text-embedding-3-small',
  };
  
  activeDocs.unshift(doc);
  return doc;
}

export async function searchRAG(
  query: string,
  mode: 'vector' | 'hybrid',
  filters: SearchFilters,
  user: AuthUser,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<SearchResponse> {
  const endpoint = mode === 'hybrid' ? '/search/hybrid' : '/search/vector';
  
  // Construct request body based on mode
  const requestBody: any = { query, top_k: 5 };
  if (mode === 'hybrid') {
    if (filters.department) requestBody.department = filters.department;
    // Map any other frontend filters to backend HybridSearchRequest
  }

  const res = await fetch(`${backendUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user.token || ''}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    throw new Error('Search failed.');
  }

  const data = await res.json();
  
  const searchResp: SearchResponse = {
    answer: data.answer || 'No answer provided.',
    citations: (data.citations || []).map((c: any, i: number) => ({
      id: `cit-${i}`,
      title: c.section || c.document_name || 'Document Reference',
      source: c.document_name || 'Unknown',
      department: 'Corporate',
      score: c.relevance_score || 0.95,
      excerpt: c.text || '',
      pageNumber: c.page_number,
    })),
    metrics: data.metrics || {
      prompt_tokens: 0,
      completion_tokens: 0,
      embedding_time_ms: 0,
      retrieval_time_ms: 0,
      total_time_ms: 0,
    },
    graph_execution_path: ['LangGraph Route', mode === 'hybrid' ? 'Hybrid DB' : 'Vector DB', 'LLM Synthesis'],
    query,
    mode,
    timestamp: new Date().toLocaleTimeString(),
  };

  return searchResp;
}

export async function fetchTraces(
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<Trace[]> {
  const res = await fetch(`${backendUrl}/monitoring/traces`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return [];
  }

  const langfuseData = await res.json();
  const rawTraces = langfuseData.data || [];
  
  return rawTraces.map((trace: any) => {
    return {
      id: trace.id,
      timestamp: new Date(trace.timestamp).toLocaleString(),
      query: typeof trace.input === 'string' ? trace.input : JSON.stringify(trace.input || {}),
      user_email: trace.userId || 'Unknown User',
      role: 'user', // Default mapping
      search_mode: (trace.tags && trace.tags.length > 0) ? trace.tags[0] : 'vector',
      total_latency_ms: trace.latency ? Math.round(trace.latency * 1000) : 0,
      prompt_tokens: trace.usage?.promptTokens || 0,
      completion_tokens: trace.usage?.completionTokens || 0,
      status: 'success',
      graph_nodes: ['LangGraph Execution'],
      top_relevance: 0,
      embedding_time_ms: 0,
      retrieval_time_ms: 0,
      llm_generation_time_ms: trace.latency ? Math.round(trace.latency * 1000) : 0,
    };
  });
}

export function getActiveDocuments(): UploadedDoc[] {
  return [...activeDocs];
}
