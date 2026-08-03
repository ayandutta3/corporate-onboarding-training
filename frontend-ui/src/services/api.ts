import { AuthUser, SearchFilters, SearchResponse, Trace, UploadedDoc, UserRole, AdminUser } from '../types';

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
    division: payload?.division,
    businessLine: payload?.businessLine,
    token,
  };
  
  return { user, token };
}

export async function createUser(
  userData: { email: string; password: string; role: UserRole; division?: string; businessLine?: string },
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<{ success: boolean; message: string }> {
  
  const res = await fetch(`${backendUrl}/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: userData.email,
      password: userData.password,
      role: userData.role,
      division: userData.division,
      businessLine: userData.businessLine
    }),
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
  division?: string,
  businessLine?: string,
  token?: string,
  backendUrl: string = DEFAULT_BACKEND_URL,
  title?: string,
  description?: string,
  tags?: string,
  autofillTags: boolean = true,
  overrideSummary?: string,
  overrideTags?: string,
  department?: string
): Promise<UploadedDoc> {
  const endpoint = mode === 'hybrid' ? '/upload/hybrid' : '/upload/vector';
  
  const formData = new FormData();
  formData.append('file', file);
  if (division) formData.append('division', division);
  if (businessLine) formData.append('businessLine', businessLine);
  if (department) formData.append('department', department);
  if (title) formData.append('title', title);
  if (description) formData.append('description', description);
  if (tags) formData.append('tags', tags);
  formData.append('autofill_tags', autofillTags ? 'true' : 'false');
  if (overrideSummary) formData.append('override_summary', overrideSummary);
  if (overrideTags) formData.append('override_tags', overrideTags);

  const res = await fetch(`${backendUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token || ''}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `Upload failed with HTTP status ${res.status}`);
  }

  const data = await res.json();
  
  const resolvedDept = department || (division === 'BusinessLine' ? businessLine : division) || 'Corporate';

  const doc: UploadedDoc = {
    id: data.document_id || `doc-${Date.now()}`,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'application/octet-stream',
    mode,
    department: resolvedDept,
    division: division || 'Corporate',
    businessLine: businessLine || '',
    uploadedBy: 'Active User',
    timestamp: new Date().toLocaleString(),
    chunksCount: mode === 'hybrid' ? 0 : Math.floor(file.size / 1500) + 1,
    status: 'completed',
    vectorId: data.document_id || `chroma-${Date.now()}`,
    embeddingModel: mode === 'hybrid' ? 'azure/genailab-maas-text-embedding-3-large' : 'azure/genailab-maas-text-embedding-3-large',
  };
  
  activeDocs.unshift(doc);
  return doc;
}

export async function analyzeDocument(
  file: File,
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<{ summary: string; tags: string[] }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${backendUrl}/upload/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Analysis failed.');
  }

  return await res.json();
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
    if (filters.division) requestBody.division = filters.division;
    if (filters.businessLine) requestBody.businessLine = filters.businessLine;
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
    citations: (data.citations || []).map((c: any) => ({
      document_id: c.document_id || '',
      document_name: c.document_name || 'Unknown',
      file_type: c.file_type || 'txt',
      version: c.version,
      page_number: c.page_number,
      section: c.section,
      timestamp: c.timestamp,
      audio_timestamp: c.audio_timestamp,
      snippet: c.snippet,
      segment_snippets: c.segment_snippets,
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

export async function fetchDocuments(
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL,
  params: Record<string, any> = {}
): Promise<{ items: any[], total: number, page: number, size: number, pages: number }> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value.toString());
  });
  
  const res = await fetch(`${backendUrl}/documents?${queryParams.toString()}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function deleteDocument(
  docId: string,
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<void> {
  const res = await fetch(`${backendUrl}/documents/${docId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete document');
}

export async function updateDocument(
  docId: string,
  data: { title?: string, department?: string, knowledge_type?: string },
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<any> {
  const res = await fetch(`${backendUrl}/documents/${docId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update document');
  return res.json();
}

export async function getUsers(
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<AdminUser[]> {
  const res = await fetch(`${backendUrl}/admin/users`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function approveUser(
  userId: string,
  designation: string,
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<AdminUser> {
  const res = await fetch(`${backendUrl}/admin/users/${userId}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ designation })
  });
  if (!res.ok) throw new Error('Failed to approve user');
  return res.json();
}

export async function rejectUser(
  userId: string,
  reason: string,
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<AdminUser> {
  const res = await fetch(`${backendUrl}/admin/users/${userId}/reject`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ reason })
  });
  if (!res.ok) throw new Error('Failed to reject user');
  return res.json();
}

export async function getUserMemoryHistory(
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<{ user_email: string; turns: Array<{ query: string; answer: string; timestamp: string }>; long_term_facts: string[] }> {
  const res = await fetch(`${backendUrl}/search/memory`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return { user_email: '', turns: [], long_term_facts: [] };
  return res.json();
}

export async function clearUserMemoryHistory(
  token: string,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<void> {
  await fetch(`${backendUrl}/search/memory`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

export async function comparePrompts(
  query: string,
  user: AuthUser,
  backendUrl: string = DEFAULT_BACKEND_URL
): Promise<Record<string, any>> {
  const token = user.token || '';
  const res = await fetch(`${backendUrl}/search/prompt-compare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ query, top_k: 5 })
  });
  if (!res.ok) throw new Error('Failed to run prompt comparison');
  return res.json();
}
