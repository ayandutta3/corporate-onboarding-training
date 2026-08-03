export type UserRole = 'admin' | 'hr' | 'finance_manager' | 'technical_manager' | 'user';

export type UserStatus = 'Approved' | 'PendingApproval' | 'Rejected';

export interface AuthUser {
  email: string;
  role: UserRole;
  division?: string;
  businessLine?: string;
  token?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  status: UserStatus;
  designation?: string;
  businessLine?: string;
  division?: string;
  rejection_reason?: string;
}

export type SearchMode = 'vector' | 'hybrid';
export type IngestionMode = 'vector' | 'hybrid';

export interface SearchFilters {
  division?: string;
  businessLine?: string;
  department?: string;
  category?: string;
  securityLevel?: string;
  dateRange?: string;
}

export interface Citation {
  document_id: string;
  document_name: string;
  file_type: string;
  version?: number;
  page_number?: number;
  section?: string;
  timestamp?: string;
  chunkId?: string;
  audio_timestamp?: string;
  snippet?: string;
  segment_snippets?: Record<string, string>;
}

export interface RagasMetrics {
  faithfulness: number;
  answer_relevancy: number;
  context_precision: number;
  ragas_score: number;
}

export interface Metrics {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens?: number;
  embedding_time_ms: number;
  retrieval_time_ms: number;
  total_time_ms?: number;
  ragas_metrics?: RagasMetrics;
  semantic_cache_hit?: boolean;
  cache_similarity?: number;
  
  // Headroom & Caveman Token Optimization Fields
  headroom_raw_input_tokens?: number;
  headroom_saved_tokens?: number;
  input_compression_ratio?: number;
  caveman_saved_tokens?: number;
  output_compression_ratio?: number;
  prompt_optimization_mode?: string;
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
  id?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mode: IngestionMode;
  department?: string;
  division?: string;
  businessLine?: string;
  uploadedBy: string;
  timestamp: string;
  chunksCount: number;
  status: 'indexing' | 'completed' | 'failed';
  vectorId?: string;
  embeddingModel?: string;
  document_id?: string;
  vectordocument_id?: string;
}
