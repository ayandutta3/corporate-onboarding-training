import React, { useState, useEffect } from 'react';
import { AuthUser, Trace } from '../types';
import { fetchTraces } from '../services/api';
import {
  Activity,
  Layers,
  Clock,
  Cpu,
  BarChart3,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  Zap,
  ArrowRight,
  Filter,
  Eye,
  Info,
} from 'lucide-react';

interface MonitoringDashboardProps {
  user: AuthUser;
  backendUrl: string;
}

export const MonitoringDashboard: React.FC<MonitoringDashboardProps> = ({
  user,
  backendUrl,
}) => {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  const [filterMode, setFilterMode] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTraces(user.token || '', backendUrl);
      setTraces(data);
    } catch (err) {
      console.error('Error fetching Langfuse traces:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [backendUrl]);

  const filteredTraces = traces.filter((t) => {
    if (filterMode !== 'All' && t.search_mode !== filterMode.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.query.toLowerCase().includes(q) ||
        t.user_email.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Derived metrics
  const totalTraces = traces.length;
  const avgLatency = totalTraces
    ? Math.round(traces.reduce((acc, t) => acc + t.total_latency_ms, 0) / totalTraces)
    : 0;
  const totalPromptTokens = traces.reduce((acc, t) => acc + t.prompt_tokens, 0);
  const totalCompletionTokens = traces.reduce((acc, t) => acc + t.completion_tokens, 0);
  const avgRelevance = totalTraces
    ? (traces.reduce((acc, t) => acc + t.top_relevance, 0) / totalTraces) * 100
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Langfuse Engine Active
              </span>
              <span className="text-xs text-slate-400">Endpoint: GET /monitoring/traces</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-3">
              Real-time <span className="text-indigo-400">Tracing</span>
            </h1>
          </div>

          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-mono text-slate-300 transition-all self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            Refresh Traces
          </button>
        </div>

        {/* Metrics Grid inside Bento Card */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5">
          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Activity className="w-3.5 h-3.5 text-indigo-400" /> Total Traces
            </div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{totalTraces}</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">100% Node Traversal</div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Avg Latency
            </div>
            <div className="text-2xl font-mono font-bold text-white mt-1">{avgLatency}<span className="text-xs text-slate-500 ml-1">ms</span></div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Vector + Synthesis</div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Tokens
            </div>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {(totalPromptTokens + totalCompletionTokens).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {totalPromptTokens.toLocaleString()} in / {totalCompletionTokens.toLocaleString()} out
            </div>
          </div>

          <div className="bg-black/40 p-4 rounded-2xl border border-white/5">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Recall
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {avgRelevance.toFixed(1)}<span className="text-xs opacity-50 ml-1">%</span>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Grounding Precision</div>
          </div>
        </div>
      </div>

      {/* Latency Visualizer & Traces Bento Grid */}
      <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-6 shadow-2xl space-y-4">
        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter trace by query, email, or trace ID..."
              className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase font-bold">Mode:</span>
            {['All', 'Hybrid', 'Vector'].map((m) => (
              <button
                key={m}
                onClick={() => setFilterMode(m)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition-all border ${
                  filterMode === m
                    ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300 font-bold'
                    : 'bg-black/40 border-white/5 text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Traces Cards Grid (Bento Tracing Feed) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredTraces.map((t, idx) => {
            const borderAccent =
              idx % 3 === 0
                ? 'border-l-indigo-500'
                : idx % 3 === 1
                ? 'border-l-purple-500'
                : 'border-l-emerald-500';

            return (
              <div
                key={t.id}
                onClick={() => setSelectedTrace(t)}
                className={`bg-black/30 rounded-2xl p-4 border border-white/5 border-l-4 ${borderAccent} hover:bg-white/5 cursor-pointer transition-all space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 font-mono">{t.id}</p>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">SUCCESS</span>
                </div>
                <p className="text-xs text-white font-medium truncate">{t.query}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>{t.search_mode.toUpperCase()}</span>
                  <span className="text-slate-300 font-bold">{t.total_latency_ms}ms</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trace Detail Modal */}
      {selectedTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white font-outfit">
                  Langfuse Trace Inspection
                </h3>
                <p className="text-xs font-mono text-cyan-400">{selectedTrace.id}</p>
              </div>
              <button
                onClick={() => setSelectedTrace(null)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-slate-500 uppercase text-[10px]">User Query</div>
                <div className="text-white font-sans text-sm font-semibold">{selectedTrace.query}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">User Email & Role</div>
                  <div className="text-slate-200 mt-0.5">{selectedTrace.user_email}</div>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-slate-500 text-[10px]">Execution Timestamp</div>
                  <div className="text-slate-200 mt-0.5">{selectedTrace.timestamp}</div>
                </div>
              </div>

              {/* LangGraph Node traversal */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-slate-500 uppercase text-[10px]">LangGraph Traversal Path</div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {selectedTrace.graph_nodes.map((n, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2.5 py-1 rounded bg-slate-900 text-cyan-300 border border-slate-800">
                        {n}
                      </span>
                      {i < selectedTrace.graph_nodes.length - 1 && (
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Latency Breakdown */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="text-slate-500 uppercase text-[10px]">Latency Breakdown</div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <div className="text-slate-400 text-[10px]">Embedding</div>
                    <div className="text-cyan-400 font-bold">{selectedTrace.embedding_time_ms} ms</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <div className="text-slate-400 text-[10px]">Retrieval</div>
                    <div className="text-emerald-400 font-bold">{selectedTrace.retrieval_time_ms} ms</div>
                  </div>
                  <div className="p-2 bg-slate-900 rounded-lg">
                    <div className="text-slate-400 text-[10px]">LLM Generation</div>
                    <div className="text-purple-400 font-bold">{selectedTrace.llm_generation_time_ms} ms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
