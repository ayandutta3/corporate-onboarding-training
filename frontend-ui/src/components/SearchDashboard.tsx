import React, { useState } from 'react';
import { AuthUser, Citation, SearchFilters, SearchResponse, SearchMode } from '../types';
import { SUGGESTED_QUERIES } from '../data/mockData';
import { searchRAG } from '../services/api';
import {
  Search,
  Sparkles,
  Zap,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Info,
  Terminal,
  Receipt,
  HeartHandshake,
  ShieldCheck,
  Code2,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  Filter,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

interface SearchDashboardProps {
  user: AuthUser;
  backendUrl: string;
  isDemoMode: boolean;
}

export const SearchDashboard: React.FC<SearchDashboardProps> = ({
  user,
  backendUrl,
  isDemoMode,
}) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [isLoading, setIsLoading] = useState(false);
  const [activeResponse, setActiveResponse] = useState<SearchResponse | null>(null);
  const [history, setHistory] = useState<SearchResponse[]>([]);

  const [expandedCitations, setExpandedCitations] = useState(true);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'up' | 'down' | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  const handleSearch = async (overrideQuery?: string) => {
    const searchQuery = overrideQuery || query;
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setCopiedAnswer(false);
    setFeedbackGiven(null);

    const filters: SearchFilters = {
      department: departmentFilter !== 'All' ? departmentFilter : undefined,
      category: categoryFilter !== 'All' ? categoryFilter : undefined,
    };

    try {
      const response = await searchRAG(searchQuery, searchMode, filters, user, backendUrl, isDemoMode);
      setActiveResponse(response);
      setHistory((prev) => [response, ...prev.slice(0, 4)]);
    } catch (err) {
      console.error('Error conducting RAG search:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!activeResponse) return;
    navigator.clipboard.writeText(activeResponse.answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Receipt':
        return <Receipt className="w-4 h-4 text-emerald-400" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4 text-cyan-400" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-pink-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-purple-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner / Search Header Controls */}
      <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-6 sm:p-8 relative overflow-hidden shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LangGraph RAG Engine
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                v2.4.1-stable
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-3">
              Intelligence <span className="text-indigo-400">Hub</span>
            </h1>
          </div>

          {/* CRITICAL REQUIRED UI TOGGLE SWITCH: VECTOR vs HYBRID */}
          <div className="flex items-center gap-3 bg-black p-1.5 rounded-2xl border border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> Search Mode:
            </span>

            <div className="flex items-center p-1 bg-[#080a0f] rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setSearchMode('vector')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  searchMode === 'vector'
                    ? 'text-indigo-400 bg-indigo-400/10 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Vector
              </button>

              <button
                type="button"
                onClick={() => setSearchMode('hybrid')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  searchMode === 'hybrid'
                    ? 'text-indigo-400 bg-indigo-400/10 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Hybrid
              </button>
            </div>
          </div>
        </div>

        {/* Search Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-4"
        >
          <div className="bg-white/5 rounded-2xl border border-white/10 flex items-center px-4 py-3 focus-within:border-indigo-500/50 transition-all">
            <Search className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about corporate policy, dev docs, or travel allowance..."
              className="bg-transparent border-none outline-none text-sm w-full text-slate-200 placeholder-slate-600 font-sans"
            />

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0 ml-2"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  Query
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Department Metadata Filters & Info Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-indigo-400" /> Dept Filter:
              </span>
              {[
                'All',
                'Corporate Finance & Ops',
                'Core Architecture',
                'People & Culture',
                'Global Infrastructure & IT',
              ].map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDepartmentFilter(dept)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all border ${
                    departmentFilter === dept
                      ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {dept === 'All' ? 'All Depts' : dept.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
              <Database className="w-3 h-3 text-purple-400" />
              Target Endpoint:
              <span className="text-indigo-300 font-semibold">
                {searchMode === 'hybrid' ? 'POST /search/hybrid' : 'POST /search/vector'}
              </span>
            </div>
          </div>
        </form>

        {/* Suggested Queries Prompts */}
        {!activeResponse && !isLoading && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Frequently Asked Corporate Prompts
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {SUGGESTED_QUERIES.map((sq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(sq.query);
                    handleSearch(sq.query);
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 p-4 rounded-2xl text-left flex flex-col justify-between space-y-2 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="p-2 rounded-xl bg-black/40 border border-white/5 group-hover:border-indigo-500/30">
                      {renderIcon(sq.icon)}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">
                      {sq.department.split(' ')[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {sq.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{sq.query}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="glass-panel rounded-3xl p-8 space-y-6 border border-slate-800 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20" />
              <div className="h-4 w-48 bg-slate-800 rounded" />
            </div>
            <div className="h-6 w-32 bg-slate-800 rounded-full" />
          </div>

          <div className="space-y-3">
            <div className="h-4 w-3/4 bg-slate-800 rounded" />
            <div className="h-4 w-full bg-slate-800/60 rounded" />
            <div className="h-4 w-5/6 bg-slate-800/60 rounded" />
            <div className="h-4 w-2/3 bg-slate-800/40 rounded" />
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-3">
            <div className="h-8 w-28 bg-slate-800/80 rounded-xl" />
            <div className="h-8 w-28 bg-slate-800/80 rounded-xl" />
            <div className="h-8 w-28 bg-slate-800/80 rounded-xl" />
          </div>
        </div>
      )}

      {/* Active Response Display */}
      {activeResponse && !isLoading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Main Answer Card */}
          <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 relative">
            {/* AI Generated Badge */}
            <div className="absolute top-6 right-6 py-1 px-3 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span className="text-[10px] uppercase font-black text-indigo-300 tracking-tighter">AI Generated Response</span>
            </div>

            {/* Header / Mode & Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">LangGraph RAG Synthesis</span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase rounded-full border ${
                        activeResponse.mode === 'hybrid'
                          ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                          : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {activeResponse.mode?.toUpperCase()} SEARCH
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Query: "{activeResponse.query}"
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 pr-32 sm:pr-0">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-300 hover:text-white hover:border-white/20 transition-colors"
                >
                  {copiedAnswer ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy
                    </>
                  )}
                </button>

                <div className="flex items-center bg-black/40 border border-white/5 rounded-xl p-0.5">
                  <button
                    onClick={() => setFeedbackGiven('up')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      feedbackGiven === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setFeedbackGiven('down')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      feedbackGiven === 'down' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 text-xs font-mono text-slate-400 hover:text-indigo-300 hover:border-indigo-500/30 transition-colors"
                >
                  <Code2 className="w-3.5 h-3.5 inline mr-1" />
                  JSON
                </button>
              </div>
            </div>

            {/* LangGraph Node Pipeline Execution Trace Bar */}
            <div className="bg-black/40 p-3.5 rounded-2xl border border-white/5">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-indigo-400">
                  <Layers className="w-3 h-3" /> LangGraph Node Traversal Path
                </span>
                <span className="text-emerald-400 font-bold">Graph Execution Success</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {activeResponse.graph_execution_path?.map((node, idx) => (
                  <React.Fragment key={idx}>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {node}
                    </div>
                    {idx < (activeResponse.graph_execution_path?.length || 0) - 1 && (
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Formatted Answer Output */}
            <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed space-y-3 font-sans">
              {activeResponse.answer.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('###')) {
                  return (
                    <h3 key={i} className="text-base font-bold text-indigo-300 pt-2">
                      {paragraph.replace('###', '').trim()}
                    </h3>
                  );
                }
                if (paragraph.startsWith('*') || paragraph.startsWith('-')) {
                  return (
                    <ul key={i} className="list-disc pl-5 space-y-1 text-slate-300">
                      {paragraph.split('\n').map((line, j) => (
                        <li key={j}>{line.replace(/^[*|-]\s*/, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={i}>{paragraph}</p>;
              })}
            </div>

            {/* METRICS BADGE BAR (REQUIRED RESPONSE METRICS) */}
            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> Inference Metrics
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Retrieval Latency</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">
                    {activeResponse.metrics.retrieval_time_ms} <span className="text-xs text-slate-500">ms</span>
                  </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Embedding Time</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">
                    {activeResponse.metrics.embedding_time_ms} <span className="text-xs text-slate-500">ms</span>
                  </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Prompt Tokens</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">
                    {activeResponse.metrics.prompt_tokens}
                  </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Completion Tokens</div>
                  <div className="text-lg font-mono font-bold text-white mt-0.5">
                    {activeResponse.metrics.completion_tokens}
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-black/40 rounded-2xl p-3 border border-white/5">
                  <div className="text-[10px] text-slate-500 uppercase">Total Latency</div>
                  <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                    {activeResponse.metrics.total_time_ms || 320} <span className="text-xs opacity-50">ms</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPANDABLE CITATIONS SECTION */}
            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Source Citations</p>
                <button
                  onClick={() => setExpandedCitations(!expandedCitations)}
                  className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1"
                >
                  {expandedCitations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {expandedCitations && (
                <div className="flex flex-wrap gap-3 pt-1">
                  {activeResponse.citations.map((cit) => (
                    <div
                      key={cit.id}
                      className="px-3.5 py-2.5 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-white/10 transition-colors"
                    >
                      <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-[10px] font-mono text-indigo-300 font-bold">
                        {cit.source.endsWith('.pdf') ? 'PDF' : 'MD'}
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-300 font-medium">{cit.title}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{cit.source} • {(cit.score * 100).toFixed(0)}% match</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Raw JSON Modal Toggle */}
            {showRawJson && (
              <div className="p-4 bg-black rounded-2xl border border-white/10 font-mono text-xs text-emerald-300 overflow-x-auto max-h-60">
                <pre>{JSON.stringify(activeResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
