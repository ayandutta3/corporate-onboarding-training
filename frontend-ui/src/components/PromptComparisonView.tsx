import React, { useState } from 'react';
import { AuthUser } from '../types';
import { SUGGESTED_QUERIES } from '../data/mockData';
import { comparePrompts } from '../services/api';
import {
  Sparkles,
  Zap,
  Bot,
  Send,
  Layers,
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Check,
  Code2,
  FileText,
  Sliders,
} from 'lucide-react';

interface PromptComparisonViewProps {
  user: AuthUser;
  backendUrl: string;
}

export const PromptComparisonView: React.FC<PromptComparisonViewProps> = ({
  user,
  backendUrl,
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<Record<string, any> | null>(null);

  const handleRunComparison = async (overrideQuery?: string) => {
    const q = overrideQuery || query;
    if (!q.trim() || isLoading) return;

    setIsLoading(true);
    setQuery(q);

    try {
      const data = await comparePrompts(q, user, backendUrl);
      setComparisonResults(data.comparisons || null);
    } catch (err) {
      console.error('Error running prompt comparison:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCardStyle = (mode: string) => {
    switch (mode) {
      case 'base':
        return {
          title: 'Base Prompt (Baseline)',
          subtitle: 'Standard prompt without optimization rules',
          badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
          borderColor: 'border-blue-500/20',
          gradientHeader: 'from-blue-500/20 to-indigo-500/10',
          accentColor: 'text-blue-400',
        };
      case 'optimized_no_system':
        return {
          title: 'Optimized (No System Role)',
          subtitle: 'Caveman conciseness rules inside User Prompt',
          badgeBg: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
          borderColor: 'border-purple-500/20',
          gradientHeader: 'from-purple-500/20 to-pink-500/10',
          accentColor: 'text-purple-400',
        };
      default: // 'optimized_with_system'
        return {
          title: 'Optimized (With System Role)',
          subtitle: 'High-density SystemRole + Headroom & Caveman',
          badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
          borderColor: 'border-emerald-500/20',
          gradientHeader: 'from-emerald-500/20 to-teal-500/10',
          accentColor: 'text-emerald-400',
        };
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-[#0a0d14]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex items-center justify-center">
              <Sliders className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Prompt Comparison Dashboard
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                Headroom + Caveman Analysis
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side evaluation of <span className="text-blue-300 font-semibold">Base Prompt</span>, <span className="text-purple-300 font-semibold">Optimized (No System Role)</span>, and <span className="text-emerald-300 font-semibold">Optimized (With System Role)</span>.
            </p>
          </div>
        </div>

        {/* Query Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleRunComparison(); }}
          className="p-2.5 rounded-2xl bg-[#0c0f17] border border-white/10 flex items-center gap-3 shadow-inner"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter corporate prompt to run 3-way mode comparison..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 via-purple-600 to-emerald-500 hover:opacity-90 text-white shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Comparing 3 Modes...
              </>
            ) : (
              <>
                Run Comparison <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Preset Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono text-slate-500 uppercase font-bold">Quick Presets:</span>
          {SUGGESTED_QUERIES.map((sq, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleRunComparison(sq.query)}
              className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 text-[11px] font-mono text-slate-300 hover:text-white transition-all"
            >
              {sq.title}
            </button>
          ))}
        </div>
      </div>

      {/* 3-Column Comparative Output Grid */}
      {comparisonResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {['base', 'optimized_no_system', 'optimized_with_system'].map((modeKey) => {
            const data = comparisonResults[modeKey];
            if (!data) return null;
            const style = getCardStyle(modeKey);
            const metrics = data.metrics || {};
            const ragas = metrics.ragas_metrics;

            return (
              <div
                key={modeKey}
                className={`rounded-3xl bg-[#0b0e14] border ${style.borderColor} p-6 space-y-5 shadow-2xl flex flex-col justify-between relative overflow-hidden`}
              >
                {/* Background ambient glow */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${style.gradientHeader} blur-2xl opacity-50 -z-10`} />

                <div className="space-y-4">
                  {/* Mode Title & Badge */}
                  <div className="pb-3 border-b border-white/5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${style.badgeBg}`}>
                        {data.mode?.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        Latency: {metrics.total_time_ms || 320} ms
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white pt-1">{style.title}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{style.subtitle}</p>
                  </div>

                  {/* Token & Savings Metrics Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Prompt Tokens</span>
                      <span className="font-bold text-slate-200">{metrics.prompt_tokens || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Completion Tokens</span>
                      <span className="font-bold text-purple-300">{metrics.completion_tokens || 0}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Input Saved</span>
                      <span className="font-bold text-cyan-300">{metrics.headroom_saved_tokens || 0} tokens ({metrics.input_compression_ratio || 0}%)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <span className="text-[10px] text-slate-500 block uppercase">Output Saved</span>
                      <span className="font-bold text-emerald-300">{metrics.caveman_saved_tokens || 0} tokens ({metrics.output_compression_ratio || 0}%)</span>
                    </div>
                  </div>

                  {/* Generated Answer Content */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 tracking-wider">Generated Output Answer:</span>
                    <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 text-xs text-slate-300 leading-relaxed font-sans max-h-64 overflow-y-auto">
                      {data.answer.split('\n\n').map((p: string, i: number) => (
                        <p key={i} className="mb-2 last:mb-0">{p}</p>
                      ))}
                    </div>
                  </div>

                  {/* Raw Prompt Text Sent to LLM */}
                  {data.prompt_text && (
                    <details className="group pt-2">
                      <summary className="cursor-pointer text-[10px] font-mono font-bold uppercase text-indigo-400 hover:text-indigo-300 flex items-center gap-1 select-none">
                        <Code2 className="w-3 h-3" /> View Raw LLM Prompt Sent
                      </summary>
                      <div className="mt-2 p-3 rounded-2xl bg-black/80 border border-indigo-500/30 font-mono text-[10px] text-slate-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {data.prompt_text}
                      </div>
                    </details>
                  )}

                  {/* RAGAS Quality Pill */}
                  {ragas && (
                    <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-purple-300 font-bold">
                        <span>RAGAS Score</span>
                        <span>{(ragas.ragas_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-purple-200/70">
                        <span>Faithfulness: {(ragas.faithfulness * 100).toFixed(0)}%</span>
                        <span>Relevancy: {(ragas.answer_relevancy * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
