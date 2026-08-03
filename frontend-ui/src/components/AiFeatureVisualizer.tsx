import React, { useState } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Cpu,
  Database,
  Lock,
  Unlock,
  Layers,
  FileText,
  Video,
  Presentation,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export type FeatureType =
  | 'agentic_rag'
  | 'role_based_context'
  | 'multi_format_ingestion'
  | 'prompt_compare'
  | 'ragas_eval'
  | 'graph_tracing';

interface AiFeatureVisualizerProps {
  feature: FeatureType;
  className?: string;
}

export const AiFeatureVisualizer: React.FC<AiFeatureVisualizerProps> = ({
  feature,
  className = '',
}) => {
  const [activeRole, setActiveRole] = useState<'hr' | 'technical_manager' | 'finance_manager'>('hr');

  switch (feature) {
    case 'agentic_rag':
      return (
        <div className={`p-4 rounded-2xl bg-[#090c15] border border-indigo-500/20 space-y-3 font-mono text-xs overflow-hidden max-w-full relative ${className}`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-indigo-400 font-bold truncate">
              <Zap className="w-3.5 h-3.5 shrink-0" /> LangGraph Routing & Caching
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shrink-0 font-bold">
              Cache: 0ms Hit
            </span>
          </div>

          <div className="relative flex items-center justify-between py-3 px-1 gap-1 overflow-hidden">
            {/* SVG Connecting Flow Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-indigo-500/30" strokeWidth="2">
              <line x1="15%" y1="50%" x2="50%" y2="50%" strokeDasharray="4 4" />
              <line x1="50%" y1="50%" x2="85%" y2="50%" strokeDasharray="4 4" />
            </svg>

            {/* Node 1: User Query */}
            <div className="relative z-10 p-2 rounded-xl bg-black/60 border border-white/10 text-center flex-1 min-w-0 shadow-lg animate-pulse-glow">
              <span className="text-[9px] text-slate-400 block uppercase truncate">Chat Input</span>
              <span className="text-white font-bold text-[10px] truncate block">User Query</span>
            </div>

            {/* Node 2: LangGraph Router & Semantic Cache */}
            <div className="relative z-10 p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-emerald-500/20 border border-indigo-500/40 text-center flex-1 min-w-0 shadow-xl">
              <span className="text-[9px] text-indigo-300 block uppercase font-bold truncate">Cache Check</span>
              <span className="text-emerald-300 font-extrabold text-[10px] flex items-center justify-center gap-1 truncate">
                <Zap className="w-3 h-3 text-emerald-400 shrink-0" /> 0ms Hit
              </span>
            </div>

            {/* Node 3: Instant Return / Bypasses LLM */}
            <div className="relative z-10 p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-center flex-1 min-w-0 shadow-lg">
              <span className="text-[9px] text-emerald-400 block uppercase font-bold truncate">Response</span>
              <span className="text-emerald-200 font-bold text-[10px] truncate block">Bypasses LLM</span>
            </div>
          </div>
        </div>
      );

    case 'role_based_context':
      return (
        <div className={`p-4 rounded-2xl bg-[#090c15] border border-cyan-500/20 space-y-3 font-mono text-xs overflow-hidden max-w-full relative ${className}`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-cyan-400 font-bold truncate">
              <Lock className="w-3.5 h-3.5 shrink-0" /> Role Context Alignment
            </span>
            <div className="flex gap-1 shrink-0">
              {(['hr', 'technical_manager', 'finance_manager'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setActiveRole(r)}
                  className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold transition-all ${
                    activeRole === r
                      ? 'bg-cyan-500 text-black shadow-md'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 'hr' ? 'HR' : r === 'technical_manager' ? 'Tech' : 'Finance'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className={`p-2 rounded-xl border flex items-center justify-between transition-all overflow-hidden ${
              activeRole === 'hr' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/5 border-rose-500/20 text-slate-500 opacity-60'
            }`}>
              <span className="flex items-center gap-1.5 truncate text-[10px]">
                {activeRole === 'hr' ? <Unlock className="w-3 h-3 text-emerald-400 shrink-0" /> : <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                <span className="truncate">/hr/compensation.pdf</span>
              </span>
              <span className="text-[9px] font-bold uppercase shrink-0">{activeRole === 'hr' ? 'GRANTED' : 'BLOCKED'}</span>
            </div>

            <div className={`p-2 rounded-xl border flex items-center justify-between transition-all overflow-hidden ${
              activeRole === 'technical_manager' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300' : 'bg-rose-500/5 border-rose-500/20 text-slate-500 opacity-60'
            }`}>
              <span className="flex items-center gap-1.5 truncate text-[10px]">
                {activeRole === 'technical_manager' ? <Unlock className="w-3 h-3 text-emerald-400 shrink-0" /> : <Lock className="w-3 h-3 text-rose-400 shrink-0" />}
                <span className="truncate">/engineering/architecture.pdf</span>
              </span>
              <span className="text-[9px] font-bold uppercase shrink-0">{activeRole === 'technical_manager' ? 'GRANTED' : 'BLOCKED'}</span>
            </div>
          </div>
        </div>
      );

    case 'multi_format_ingestion':
      return (
        <div className={`p-4 rounded-2xl bg-[#090c15] border border-purple-500/20 space-y-3 font-mono text-xs overflow-hidden max-w-full relative ${className}`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-purple-400 font-bold truncate">
              <Layers className="w-3.5 h-3.5 shrink-0" /> Ingestion Scanner
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 shrink-0">
              Hybrid Mode
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 space-y-1 overflow-hidden">
              <FileText className="w-4 h-4 text-indigo-400 mx-auto animate-bounce" />
              <span className="text-[9px] font-bold text-slate-300 block truncate">PDF / OCR</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 space-y-1 overflow-hidden">
              <Video className="w-4 h-4 text-purple-400 mx-auto animate-pulse" />
              <span className="text-[9px] font-bold text-slate-300 block truncate">Audio / Whisper</span>
            </div>
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 space-y-1 overflow-hidden">
              <Presentation className="w-4 h-4 text-cyan-400 mx-auto animate-bounce" />
              <span className="text-[9px] font-bold text-slate-300 block truncate">Slides / Docx</span>
            </div>
          </div>

          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-center text-purple-300 font-bold text-[10px] flex items-center justify-center gap-1.5 truncate">
            <Database className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Lazy Embedding (ChromaDB)
          </div>
        </div>
      );

    case 'prompt_compare':
      return (
        <div className={`p-4 rounded-2xl bg-[#090c15] border border-pink-500/20 space-y-3 font-mono text-xs overflow-hidden max-w-full relative ${className}`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-pink-400 font-bold truncate">
              <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" /> Prompt Benchmark Suite
            </span>
            <span className="px-2 py-0.5 rounded bg-pink-500/10 text-pink-300 border border-pink-500/20 shrink-0 font-bold">
              3 Modes
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="p-2 rounded-xl bg-black/60 border border-white/10 space-y-1">
              <span className="text-[9px] text-slate-400 font-bold block truncate">Standard</span>
              <span className="text-[10px] font-bold text-slate-200 block">1,500 tok</span>
              <span className="text-[8px] text-slate-500 block">1.8s (Base)</span>
            </div>

            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-1">
              <span className="text-[9px] text-purple-300 font-bold block truncate">Caveman</span>
              <span className="text-[10px] font-bold text-purple-200 block">920 tok</span>
              <span className="text-[8px] text-emerald-400 block font-bold">-38.6%</span>
            </div>

            <div className="p-2 rounded-xl bg-pink-500/15 border border-pink-500/40 space-y-1 shadow-lg">
              <span className="text-[9px] text-pink-300 font-extrabold block truncate">Optimized</span>
              <span className="text-[10px] font-bold text-pink-200 block">720 tok</span>
              <span className="text-[8px] text-emerald-400 block font-bold">-52.0%</span>
            </div>
          </div>
        </div>
      );

    case 'ragas_eval':
      return (
        <div className={`p-4 rounded-2xl bg-[#090c15] border border-amber-500/20 space-y-3 font-mono text-xs overflow-hidden max-w-full relative ${className}`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold truncate">
              <Sparkles className="w-3.5 h-3.5 shrink-0" /> RAGAS Evaluation
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold shrink-0">
              Pass
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-[9px] text-slate-300 font-bold mb-0.5">
                <span>Faithfulness</span>
                <span className="text-emerald-400">98.2%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[98%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9px] text-slate-300 font-bold mb-0.5">
                <span>Answer Relevancy</span>
                <span className="text-amber-300">92.5%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 w-[92%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-[9px] text-slate-300 font-bold mb-0.5">
                <span>Context Precision</span>
                <span className="text-indigo-400">95.0%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-400 w-[95%]" />
              </div>
            </div>
          </div>
        </div>
      );

    default: // 'graph_tracing'
      return (
        <div className={`p-4 rounded-2xl bg-[#090c15] border border-emerald-500/20 space-y-3 font-mono text-xs overflow-hidden max-w-full relative ${className}`}>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-white/5">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold truncate">
              <Activity className="w-3.5 h-3.5 shrink-0" /> Graph Trace Logger
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold shrink-0">
              Langfuse
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/60 border border-white/10 space-y-1 text-[9px] leading-relaxed overflow-hidden">
            <div className="flex justify-between text-slate-400 truncate">
              <span>[0.00s] intent_detection</span>
              <span className="text-emerald-400 shrink-0 ml-1">35 ms</span>
            </div>
            <div className="flex justify-between text-slate-400 truncate">
              <span>[0.04s] vector_rerank</span>
              <span className="text-emerald-400 shrink-0 ml-1">120 ms</span>
            </div>
            <div className="flex justify-between text-slate-400 truncate">
              <span>[0.16s] llm_synthesis</span>
              <span className="text-emerald-400 shrink-0 ml-1">225 ms</span>
            </div>
            <div className="pt-1 border-t border-white/10 flex justify-between font-bold text-slate-200 truncate">
              <span>Total Latency</span>
              <span className="text-indigo-300 shrink-0 ml-1">380 ms</span>
            </div>
          </div>
        </div>
      );
  }
};
