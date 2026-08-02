export type UserRole = 'admin' | 'user' | 'hr' | 'finance_manager' | 'technical_manager';

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  department: string;
  division?: string;
  businessLine?: string;
  designation?: string;
  token?: string;
}

export type SearchMode = 'vector' | 'hybrid';
export type IngestionMode = 'vector' | 'hybrid';

export interface SearchFilters {
  department?: string;
  category?: string;
  securityLevel?: string;
  dateRange?: string;
}

export interface Citation {
  id: string;
  document_id?: string;
  title: string;
  source: string;
  department: string;
  score: number; // 0 to 1 or percentage
  excerpt: string;
  pageNumber?: number;
  chunkId?: string;
  author?: string;
}

export interface Metrics {
  prompt_tokens: number;
  completion_tokens: number;
  embedding_time_ms: number;
  retrieval_time_ms: number;
  total_time_ms?: number;
}

export interface SearchResponse {
  answer: string;
  citations: Citation[];
  metrics: Metrics;
  graph_execution_path?: string[];
  query?: string;
  mode?: SearchMode;
  timestamp?: string;
}

export interface Trace {
  id: string;
  timestamp: string;
  query: string;
  user_email: string;
  role: UserRole;
  search_mode: SearchMode;
  total_latency_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  status: 'success' | 'error' | 'warning';
  graph_nodes: string[];
  top_relevance: number;
  department_filter?: string;
  embedding_time_ms: number;
  retrieval_time_ms: number;
  llm_generation_time_ms: number;
}

export interface UploadedDoc {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mode: IngestionMode;
  department: string;
  division?: string;
  businessLine?: string;
  uploadedBy: string;
  timestamp: string;
  chunksCount: number;
  status: 'indexing' | 'completed' | 'failed';
  vectorId?: string;
  embeddingModel?: string;
}
