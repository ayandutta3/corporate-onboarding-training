import React, { useState } from 'react';
import { AiFeatureVisualizer, FeatureType } from './AiFeatureVisualizer';
import { NavTab } from './Sidebar';
import {
  Sparkles,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Tv,
  Grid,
  Zap,
  CheckCircle2,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

export interface HighlightedFeaturesProps {
  setActiveTab: (tab: NavTab) => void;
}

interface FeatureItem {
  id: FeatureType;
  title: string;
  category: string;
  navTarget: NavTab;
  description: string;
  bullets: string[];
  techStack: string;
  businessMetric: string;
}

export const HighlightedFeatures: React.FC<HighlightedFeaturesProps> = ({
  setActiveTab,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'presenter'>('grid');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const features: FeatureItem[] = [
    {
      id: 'agentic_rag',
      title: 'Agentic RAG, LangGraph Routing & Semantic Caching',
      category: 'Intelligent Query Pipeline',
      navTarget: 'search',
      description: 'Dynamic graph-based query intent classifier with zero-latency Semantic Caching. When a user communicates via chat, cached answers return instantly in 0ms without calling the LLM.',
      bullets: [
        'Multi-node intent detection (Policy vs Technical vs General)',
        '0ms Semantic Cache: bypasses LLM call when answer is cached',
        'Headroom input context window deduplication (750 token budget)'
      ],
      techStack: 'LangGraph, ChromaDB Semantic Cache, ChatOpenAI GPT-4o',
      businessMetric: '0ms Latency on Cache Hit (100% LLM Cost Saved)',
    },
    {
      id: 'multi_format_ingestion',
      title: 'Multi-Format Hybrid Ingestion Engine',
      category: 'Document Processing',
      navTarget: 'upload',
      description: 'Ingest PDF, DOCX, Images (OCR), and Audio (Whisper) with Hybrid Mode lazy embedding storage.',
      bullets: [
        'Lazy Embedding: Stores raw text in MongoDB without instant vector cost',
        'Audio Transcription using Azure Maas Whisper',
        'Automatic PII scrubbing & AI tag generation'
      ],
      techStack: 'Azure Whisper, Tesseract OCR, PyPDF',
      businessMetric: '80% Reduction in Upload Pre-processing Cost',
    },
    {
      id: 'ragas_eval',
      title: 'RAGAS Automated Quality Assessment',
      category: 'Evaluation & Guardrails',
      navTarget: 'ragas_report',
      description: 'Real-time python RAGAS evaluation measuring Faithfulness, Answer Relevancy, and Context Precision metrics.',
      bullets: [
        'Faithfulness score guardrail (auto-blocks scores below 0.5)',
        'Context Precision and Relevancy metrics logging',
        'Exportable quality compliance reports'
      ],
      techStack: 'Python RAGAS Package, Async LLM Guard',
      businessMetric: '96.5% Grounded Answer Accuracy',
    },
    {
      id: 'prompt_compare',
      title: 'Prompt Comparison Dashboard',
      category: 'Prompt Engineering & Benchmarking',
      navTarget: 'prompt_compare',
      description: 'Side-by-side benchmark dashboard evaluating Standard, Caveman, and System prompt optimization strategies.',
      bullets: [
        'Compare Standard vs Caveman vs System Prompt modes',
        'Real-time token savings and response latency benchmarking',
        'Side-by-side LLM output quality & compression analysis'
      ],
      techStack: 'Headroom Token Budgeting, Caveman Output Compression',
      businessMetric: '52% Prompt Cost Reduction',
    },
    {
      id: 'graph_tracing',
      title: 'Langfuse Graph Tracing & Latency Metrics',
      category: 'Observability & Analytics',
      navTarget: 'monitoring',
      description: 'End-to-end telemetry tracking node latency breakdown, token consumption, and OpenTelemetry span exports.',
      bullets: [
        'SSL certificate verification global patch for corporate proxies',
        'Detailed breakdown: Embedding MS, Retrieval MS, LLM Synthesis MS',
        'Langfuse OTEL background span batch exporter'
      ],
      techStack: 'Langfuse OTEL Exporter, FastApi Middleware',
      businessMetric: 'Complete Observability Coverage',
    },
    {
      id: 'role_based_context',
      title: 'Enterprise Role Context Alignment',
      category: 'Access & Security Control',
      navTarget: 'policy',
      description: 'Strict candidate document filtering ensuring employees only receive search answers from files authorized for their corporate role.',
      bullets: [
        'Granular role levels: Admin, HR, Tech Manager, Finance Lead',
        'Division & BusinessLine metadata isolation (Insurance, Banking, etc.)',
        'Zero cross-departmental data leaks in synthesized answers'
      ],
      techStack: 'MongoDB Metadata Filtering, ChromaDB Scoping',
      businessMetric: '100% RBAC Policy Compliance',
    },
  ];

  const currentSlide = features[currentSlideIndex];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* Top Deck Banner */}
      <div className="p-6 rounded-3xl bg-[#0a0d14]/90 border border-white/10 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex items-center justify-center">
                <Tv className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                RAG Capabilities Deck & Overview
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  Interactive Presenter
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore the key architectural capabilities powering the Corporate Onboarding AI Platform.
              </p>
            </div>
          </div>

          {/* View Toggle Buttons */}
          <div className="flex items-center gap-2 bg-black/50 p-1.5 rounded-2xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Grid className="w-3.5 h-3.5" /> Grid View
            </button>
            <button
              onClick={() => setViewMode('presenter')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                viewMode === 'presenter'
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Tv className="w-3.5 h-3.5" /> Presenter Mode
            </button>
          </div>
        </div>
      </div>

      {/* GRID VIEW MODE */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {features.map((feat) => (
            <div
              key={feat.id}
              className="p-6 rounded-3xl bg-[#0b0e14] border border-white/10 hover:border-indigo-500/60 transition-all duration-300 transform hover:-translate-y-2.5 hover:scale-[1.02] hover:z-20 hover:shadow-2xl hover:shadow-indigo-500/20 flex flex-col justify-between space-y-5 group relative overflow-hidden"
            >
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wider">
                    {feat.category}
                  </span>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors pt-0.5">
                    {feat.title}
                  </h3>
                </div>

                {/* Interactive Visualizer Widget with Strict Container Bounds */}
                <div className="w-full overflow-hidden rounded-2xl">
                  <AiFeatureVisualizer feature={feat.id} />
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  {feat.description}
                </p>
              </div>

              {/* Direct App Redirection Button */}
              <button
                onClick={() => setActiveTab(feat.navTarget)}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 text-xs font-mono font-bold text-indigo-300 flex items-center justify-center gap-2 transition-all group-hover:translate-x-0.5 cursor-pointer"
              >
                Launch Feature <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* PRESENTER SLIDE MODE */}
      {viewMode === 'presenter' && (
        <div className="p-8 rounded-3xl bg-[#0b0e14] border border-indigo-500/30 shadow-2xl space-y-8 animate-in fade-in duration-300">

          {/* Slide Header Nav Controls */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 font-mono text-xs">
            <span className="text-slate-400">
              SLIDE <span className="text-indigo-300 font-bold">{currentSlideIndex + 1}</span> OF {features.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlideIndex((prev) => Math.min(features.length - 1, prev + 1))}
                disabled={currentSlideIndex === features.length - 1}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Slide Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left Column: Details & Bullets */}
            <div className="space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  {currentSlide.category}
                </span>
                <h2 className="text-2xl font-extrabold text-white pt-3">
                  {currentSlide.title}
                </h2>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {currentSlide.description}
                </p>
              </div>

              {/* Key Highlights */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">Key Highlights:</span>
                {currentSlide.bullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>

              {/* Tech Stack & Metric Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Target AI Stack</span>
                  <span className="font-bold text-purple-300">{currentSlide.techStack}</span>
                </div>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
                  <span className="text-[10px] text-slate-500 block uppercase">Business Metric</span>
                  <span className="font-bold text-emerald-300">{currentSlide.businessMetric}</span>
                </div>
              </div>

              {/* Direct App Redirection Button */}
              <button
                onClick={() => setActiveTab(currentSlide.navTarget)}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-xs font-mono font-bold text-white shadow-xl flex items-center gap-2 hover:opacity-90 transition-all"
              >
                Launch Feature Demo <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Column: Live Interactive Visualizer */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block text-center">
                Live Interactive Process Visualizer
              </span>
              <AiFeatureVisualizer feature={currentSlide.id} className="shadow-2xl" />
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
