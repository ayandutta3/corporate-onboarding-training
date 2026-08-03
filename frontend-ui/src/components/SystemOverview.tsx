import React from 'react';
import { AuthUser } from '../types';
import { NavTab } from './Sidebar';
import {
  MessageSquare,
  SlidersHorizontal,
  UploadCloud,
  FileText,
  Activity,
  Sparkles,
  Users,
  ArrowRight,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Database,
  Cpu,
  Layers,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SystemOverviewProps {
  user: AuthUser;
  setActiveTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
}

export const SystemOverview: React.FC<SystemOverviewProps> = ({
  user,
  setActiveTab,
  onOpenSettings,
}) => {
  const isManagerOrAdmin = ['admin', 'hr', 'finance_manager', 'technical_manager'].includes(user.role);

  const featureNavCards = [
    {
      id: 'search' as NavTab,
      title: 'Knowledgebase Chatbot',
      category: 'RAG & Continuous Session',
      description: 'Interactive continuous chat session with short/long-term memory sync and RAGAS guardrails.',
      icon: <MessageSquare className="w-6 h-6 text-indigo-400" />,
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
      badge: 'Interactive AI',
    },
    {
      id: 'prompt_compare' as NavTab,
      title: 'Prompt Comparison Dashboard',
      category: 'Headroom + Caveman',
      description: '3-Way prompt evaluation comparing Base, Optimized (No System), and Optimized (With System Role).',
      icon: <SlidersHorizontal className="w-6 h-6 text-pink-400" />,
      color: 'from-pink-500/20 to-purple-500/10 border-pink-500/30',
      badge: 'Token Optimizer',
    },
    {
      id: 'upload' as NavTab,
      title: 'Knowledge Upload Portal',
      category: 'Ingestion & OCR/Audio',
      description: 'Ingest PDF, DOCX, Images (OCR), and Audio (Whisper) with Hybrid Lazy Embedding support.',
      icon: <UploadCloud className="w-6 h-6 text-purple-400" />,
      color: 'from-purple-500/20 to-indigo-500/10 border-purple-500/30',
      badge: 'Multi-Modal',
    },
    {
      id: 'policy' as NavTab,
      title: 'Policy & Document Hub',
      category: 'Enterprise RBAC',
      description: 'Department & division policy repository with role-based security access control.',
      icon: <FileText className="w-6 h-6 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
      badge: 'RBAC Security',
    },
    {
      id: 'monitoring' as NavTab,
      title: 'Tracing & Latency Metrics',
      category: 'Langfuse Observability',
      description: 'Monitor execution traces, node latency breakdown, token usage, and pipeline span logs.',
      icon: <Activity className="w-6 h-6 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      badge: 'Langfuse Traces',
    },
    {
      id: 'ragas_report' as NavTab,
      title: 'RAGAS Quality Assessment',
      category: 'Python RAGAS Evaluation',
      description: 'Evaluate Faithfulness, Answer Relevancy, and Context Precision scores across queries.',
      icon: <Sparkles className="w-6 h-6 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      badge: 'Quality Guardrail',
    },
    {
      id: 'users' as NavTab,
      title: 'User & Role Administration',
      category: 'Access Management',
      description: 'Manage user registrations, assign division/businessLine roles, and approve user accounts.',
      icon: <Users className="w-6 h-6 text-rose-400" />,
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
      badge: 'Admin Control',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-10">

      {/* Hero Welcome Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0c0f17] via-[#090b12] to-[#080a0f] border border-white/10 shadow-2xl relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-emerald-500/5 blur-3xl rounded-full -z-10" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                LangGraph Enterprise RAG Architecture
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                SSL Bypass & Tiktoken Cache Active
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight pt-3">
              Corporate Onboarding & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Knowledgebase AI Hub</span>
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Welcome back, <span className="text-indigo-300 font-semibold">{user.email}</span> ({user.role}). Access all platform features, run prompt token optimizations, or query corporate policies below.
            </p>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all shadow-lg"
          >
            System Settings & Endpoints
          </button>
        </div>

        {/* System Highlights Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5 font-mono text-xs">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500">SEMANTIC CACHE</div>
              <div className="font-bold text-slate-200">0ms Fast-Path Match</div>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-2.5">
            <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500">OPTIMIZERS</div>
              <div className="font-bold text-purple-300">Headroom + Caveman</div>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-2.5">
            <Database className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500">HYBRID MODE</div>
              <div className="font-bold text-cyan-300">Lazy Embedding Active</div>
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-pink-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-500">PII PROTECTION</div>
              <div className="font-bold text-pink-300">Context Redaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ACCESS FEATURE NAVIGATION CARDS GRID */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" /> Platform Feature Navigation
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {featureNavCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveTab(card.id)}
              className={`p-6 rounded-3xl bg-[#0a0d14] border bg-gradient-to-br ${card.color} hover:border-white/30 transition-all cursor-pointer group shadow-xl flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-2xl bg-black/40 border border-white/10 shrink-0">
                    {card.icon}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/5 text-slate-300 border border-white/10">
                    {card.badge}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-[11px] font-mono text-indigo-400/80 font-medium">
                    {card.category}
                  </p>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {card.description}
                </p>
              </div>

              <div className="flex items-center justify-end text-xs font-bold text-indigo-300 group-hover:translate-x-1 transition-transform">
                Launch Feature <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DETAILED FEATURE SPECIFICATION AT BOTTOM */}
      <div className="pt-6 border-t border-white/10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-purple-400" /> System Architecture & Feature Details
          </h2>
          <span className="text-xs font-mono text-slate-500">Antigravity IDE RAG Platform v2.4</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* Feature 1 */}
          <div className="p-6 rounded-3xl bg-[#090b10] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Zap className="w-4 h-4" /> Dual-Layer Semantic Cache
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Combines 0ms Fast-Path Normalized Hash matching with 0.80 vector similarity threshold. Identical or re-phrased queries return instantly from memory without LLM generation calls.
            </p>
            <div className="text-[10px] font-mono text-indigo-300 bg-indigo-500/10 p-2 rounded-xl border border-indigo-500/20">
              • Normalized Key: mode:normalized_query<br />
              • Semantic Threshold: 0.80 Cosine Similarity
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-3xl bg-[#090b10] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Cpu className="w-4 h-4" /> Headroom + Caveman Optimizers
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Headroom deduplicates context window paragraphs and caps token budgets (1500 max). Caveman applies high-density system roles to cut completion tokens by up to 66%.
            </p>
            <div className="text-[10px] font-mono text-purple-300 bg-purple-500/10 p-2 rounded-xl border border-purple-500/20">
              • Input Savings: ~40% headroom compression<br />
              • Output Savings: ~65% caveman compression
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-3xl bg-[#090b10] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Database className="w-4 h-4" /> Hybrid Mode & Lazy Embedding
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Hybrid documents store raw text in MongoDB with <code className="text-cyan-300">embedding_generated: False</code>. Vector chunk embeddings are created on-the-fly when queried.
            </p>
            <div className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20">
              • Upload Chunks: 0 (Lazy Embedded)<br />
              • ChromaDB On-Demand Generation
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-3xl bg-[#090b10] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-pink-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" /> Role-Based Access (RBAC) & PII
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Filters search candidate documents strictly by user role (System Admin, HR, Technical Manager, Finance Lead). PII is automatically redacted before LLM context synthesis.
            </p>
            <div className="text-[10px] font-mono text-pink-300 bg-pink-500/10 p-2 rounded-xl border border-pink-500/20">
              • MongoDB Raw Text Intact<br />
              • LLM Context Window Redacted
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-3xl bg-[#090b10] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Activity className="w-4 h-4" /> Langfuse Observability & Traces
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Exports span batches to Langfuse via OTLP endpoints. SSL certificate validation is globally patched to ensure continuous trace delivery under corporate proxies.
            </p>
            <div className="text-[10px] font-mono text-emerald-300 bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
              • Endpoint: /api/public/otel/v1/traces<br />
              • SSL Bypass & Unverified Context
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-3xl bg-[#090b10] border border-white/5 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" /> Python RAGAS Quality Guardrails
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Evaluates RAG triplets (query, context, response) using RAGAS python metrics. Responses with Faithfulness below 0.5 are automatically safety-blocked.
            </p>
            <div className="text-[10px] font-mono text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
              • Faithfulness, Relevancy, Precision<br />
              • Auto Guardrail Threshold: 0.50
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
