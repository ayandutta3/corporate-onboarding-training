import React, { useState, useEffect, useRef } from 'react';
import { AuthUser, SearchFilters, SearchResponse, SearchMode, Citation } from '../types';
import { SUGGESTED_QUERIES } from '../data/mockData';
import { searchRAG, getUserMemoryHistory, clearUserMemoryHistory } from '../services/api';
import {
  Search,
  Sparkles,
  Zap,
  FileText,
  Clock,
  Layers,
  Database,
  Check,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ShieldCheck,
  Code2,
  ExternalLink,
  Bot,
  User,
  ArrowRight,
  Filter,
  BarChart3,
  Trash2,
  Send,
  Volume2,
  Play,
  Video,
  BrainCircuit,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';

interface SearchDashboardProps {
  user: AuthUser;
  backendUrl: string;
  isDemoMode: boolean;
}

export interface ChatTurn {
  id: string;
  query: string;
  response: SearchResponse;
  timestamp: string;
}

interface AudioTimelineItemProps {
  citation: Citation;
}

const parseTimeToSeconds = (tsStr: string): number => {
  const parts = tsStr.trim().split(':');
  try {
    if (parts.length === 3) {
      return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseInt(parts[2], 10);
    } else if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return parseInt(parts[0], 10);
  } catch {
    return 0;
  }
};

const formatSecToTs = (secs: number): string => {
  const s = Math.max(0, Math.floor(secs));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const remSecs = s % 60;
  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`;
};

export const AudioTimelineItem: React.FC<AudioTimelineItemProps> = ({ citation }) => {
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [hoverSec, setHoverSec] = useState<number | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  const fileExt = citation.file_type ? citation.file_type.toLowerCase() : citation.document_name.split('.').pop()?.toLowerCase() || '';
  const isVideo = ['mp4', 'avi', 'mov', 'm4v', 'mkv'].includes(fileExt);

  const rawPairs: { startSec: number; endSec: number; rawStr: string }[] = [];
  if (citation.audio_timestamp) {
    const parts = citation.audio_timestamp.split(',');
    parts.forEach((p) => {
      const times = p.split('-').map((t) => t.trim());
      if (times.length === 2) {
        const s = parseTimeToSeconds(times[0]);
        const e = parseTimeToSeconds(times[1]);
        if (e > s) {
          rawPairs.push({ startSec: s, endSec: e, rawStr: `${times[0]} - ${times[1]}` });
        }
      }
    });
  }

  if (rawPairs.length === 0) {
    return null;
  }

  rawPairs.sort((a, b) => a.startSec - b.startSec);
  const mergedSegments: { startSec: number; endSec: number; label: string }[] = [];
  let currStart = rawPairs[0].startSec;
  let currEnd = rawPairs[0].endSec;

  for (let i = 1; i < rawPairs.length; i++) {
    if (rawPairs[i].startSec <= currEnd + 5) {
      currEnd = Math.max(currEnd, rawPairs[i].endSec);
    } else {
      const label = `${formatSecToTs(currStart)} - ${formatSecToTs(currEnd)}`;
      mergedSegments.push({ startSec: currStart, endSec: currEnd, label });
      currStart = rawPairs[i].startSec;
      currEnd = rawPairs[i].endSec;
    }
  }
  const lastLabel = `${formatSecToTs(currStart)} - ${formatSecToTs(currEnd)}`;
  mergedSegments.push({ startSec: currStart, endSec: currEnd, label: lastLabel });

  const maxSec = Math.max(300, ...mergedSegments.map((s) => s.endSec));

  const segmentGeometries = mergedSegments.map((seg) => {
    const leftPercent = (seg.startSec / maxSec) * 100;
    const widthPercent = Math.max(2, ((seg.endSec - seg.startSec) / maxSec) * 100);
    const centerPercent = leftPercent + widthPercent / 2;
    return { ...seg, leftPercent, widthPercent, centerPercent };
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    const curSec = (percent / 100) * maxSec;
    setHoverPercent(percent);
    setHoverSec(curSec);
  };

  const handleMouseLeave = () => {
    setHoverPercent(null);
    setHoverSec(null);
  };

  const activeSeg = hoverSec !== null ? segmentGeometries.find((s) => hoverSec >= s.startSec && hoverSec <= s.endSec) : null;
  const activeSnippet = activeSeg && citation.segment_snippets ? citation.segment_snippets[activeSeg.label] : null;

  return (
    <div className="mt-3 p-4 rounded-2xl bg-[#090c15] border border-indigo-500/20 space-y-4 font-mono text-xs shadow-xl">
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          {isVideo ? (
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 uppercase">
              <Video className="w-3.5 h-3.5 text-purple-400" /> 🎥 Video Track
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 uppercase">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> 🎵 Audio Track
            </span>
          )}
          <span className="text-white font-bold text-xs truncate max-w-xs">{citation.document_name}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-bold">
          Duration: {formatSecToTs(maxSec)}
        </span>
      </div>

      <div className="relative pt-6 pb-2">
        {segmentGeometries.map((geo, idx) => (
          <div
            key={idx}
            className="absolute top-0 text-[10px] font-bold text-indigo-300 whitespace-nowrap pointer-events-none"
            style={{
              left: `${geo.centerPercent}%`,
              transform: 'translateX(-50%)',
            }}
          >
            Cited ({geo.label})
          </div>
        ))}

        <div
          ref={timelineRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-3 rounded-full bg-white/10 overflow-visible cursor-pointer border border-white/10"
        >
          {segmentGeometries.map((geo, idx) => (
            <div
              key={idx}
              className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg"
              style={{
                left: `${geo.leftPercent}%`,
                width: `${geo.widthPercent}%`,
              }}
            />
          ))}

          {hoverPercent !== null && hoverSec !== null && (
            <>
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-xl z-20 pointer-events-none"
                style={{ left: `${hoverPercent}%` }}
              />

              <div
                className="absolute bottom-full mb-3 z-30 p-3 rounded-2xl bg-[#0e1117]/95 border border-indigo-500/40 shadow-2xl backdrop-blur-md text-xs w-72 pointer-events-none animate-in fade-in duration-150 space-y-1.5"
                style={{
                  left: `${hoverPercent}%`,
                  transform: 'translateX(-50%)',
                }}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold border-b border-white/10 pb-1">
                  <span className="text-indigo-400 flex items-center gap-1">
                    <Play className="w-3 h-3 text-indigo-400 fill-indigo-400" /> {formatSecToTs(hoverSec)}
                  </span>
                  {activeSeg && (
                    <span className="text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/30">
                      Segment {activeSeg.label}
                    </span>
                  )}
                </div>

                {activeSnippet ? (
                  <p className="text-slate-200 text-[11px] leading-relaxed font-sans line-clamp-4">
                    "{activeSnippet}"
                  </p>
                ) : (
                  <p className="text-slate-500 text-[10px] italic">
                    Hovering un-cited timeline range. Move cursor over cited segment.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const SearchDashboard: React.FC<SearchDashboardProps> = ({
  user,
  backendUrl,
  isDemoMode,
}) => {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('hybrid');
  const [optimizationMode, setOptimizationMode] = useState<string>('optimized_with_system');
  const [divisionFilter, setDivisionFilter] = useState('All');
  const [businessLineFilter, setBusinessLineFilter] = useState('All');

  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<ChatTurn[]>([]);
  const [userFacts, setUserFacts] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeJsonId, setActiveJsonId] = useState<string | null>(null);
  
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Sync session memory and facts on component mount
  useEffect(() => {
    if (user.token) {
      getUserMemoryHistory(user.token, backendUrl).then((mem) => {
        if (mem.long_term_facts) {
          setUserFacts(mem.long_term_facts);
        }
      }).catch(() => {});
    }
  }, [user.email, user.token, backendUrl]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSession, isLoading]);

  const handleOpenCitation = (c: any) => {
    const token = user.token || '';
    if (c.document_id) {
      window.open(`${backendUrl}/documents/${c.document_id}/preview?token=${token}`, '_blank');
    } else {
      window.open(`${backendUrl}/documents/by-name/${encodeURIComponent(c.document_name)}/preview?token=${token}`, '_blank');
    }
  };

  const handleSendQuery = async (overrideQuery?: string) => {
    const searchQuery = overrideQuery || query;
    if (!searchQuery.trim() || isLoading) return;

    setIsLoading(true);
    setQuery('');

    const filters: SearchFilters = {
      division: divisionFilter !== 'All' ? divisionFilter : undefined,
      businessLine: businessLineFilter !== 'All' ? businessLineFilter : undefined,
    };

    try {
      const response = await searchRAG(searchQuery, searchMode, filters, user, backendUrl);
      const turn: ChatTurn = {
        id: `turn-${Date.now()}`,
        query: searchQuery,
        response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatSession((prev) => [...prev, turn]);
      
      // Refresh user long-term facts
      if (user.token) {
        getUserMemoryHistory(user.token, backendUrl).then((mem) => {
          if (mem.long_term_facts) setUserFacts(mem.long_term_facts);
        }).catch(() => {});
      }
    } catch (err) {
      console.error('Error in Knowledgebase Chatbot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSession = async () => {
    setChatSession([]);
    if (user.token) {
      await clearUserMemoryHistory(user.token, backendUrl).catch(() => {});
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

      {/* Top Header / Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-3xl bg-[#0a0d14]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-[#0a0d14] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Knowledgebase Query <span className="text-indigo-400 font-medium text-sm">& AI Chatbot</span>
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Session
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Continuous Chat Session for <span className="text-purple-300 font-semibold">{user.email}</span> ({user.role})
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 text-xs">
            <button
              onClick={() => setSearchMode('hybrid')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                searchMode === 'hybrid'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hybrid (Lazy)
            </button>
            <button
              onClick={() => setSearchMode('vector')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                searchMode === 'vector'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vector Mode
            </button>
          </div>

          {/* New Chat Session Button */}
          <button
            onClick={handleClearSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all"
            title="Start New Chat Session"
          >
            <PlusCircle className="w-4 h-4" /> New Session
          </button>
        </div>
      </div>

      {/* User Memory & Role Facts Banner */}
      {userFacts.length > 0 && (
        <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-start gap-3">
          <BrainCircuit className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-purple-300 uppercase tracking-wider text-[11px]">
                Active User Long-Term Memory Facts (MongoDB Persisted)
              </span>
              <span className="text-[10px] font-mono text-purple-400">{userFacts.length} Facts Extracted</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {userFacts.map((fact, fIdx) => (
                <span key={fIdx} className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 text-[11px] font-mono">
                  • {fact}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Continuous Chat Messages Stream Container */}
      <div className="space-y-6 min-h-[400px]">
        {chatSession.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[#0b0e14]/80 border border-white/10 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
              <MessageSquare className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Start a Continuous Knowledgebase Chat</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Ask questions about company policies, training manuals, technical specs, or onboarding. RAGAS guardrails, short-term memory, and Headroom/Caveman optimizers are active.
            </p>

            {/* Suggested Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 max-w-4xl mx-auto text-left">
              {SUGGESTED_QUERIES.map((sq, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSendQuery(sq.query)}
                  className="p-3.5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all cursor-pointer group"
                >
                  <p className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">{sq.title}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{sq.query}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          chatSession.map((turn) => (
            <div key={turn.id} className="space-y-4 animate-in fade-in duration-300">
              
              {/* User Query Message Bubble (Right) */}
              <div className="flex items-start justify-end gap-3">
                <div className="max-w-2xl bg-indigo-600 text-white p-4 rounded-3xl rounded-tr-none shadow-lg text-sm font-medium">
                  {turn.query}
                  <div className="text-[10px] opacity-75 font-mono text-right mt-1">{turn.timestamp}</div>
                </div>
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <User className="w-5 h-5" />
                </div>
              </div>

              {/* RAG Bot Response Message Bubble (Left) */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-1">
                  <Bot className="w-5 h-5" />
                </div>
                
                <div className="flex-1 bg-[#0d1017] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl relative">

                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                        {turn.response.mode?.toUpperCase()} RAG SYNTHESIS
                      </span>
                      {turn.response.metrics?.semantic_cache_hit && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                          CACHE HIT (100% SIM)
                        </span>
                      )}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> PII SCRUBBED
                      </span>
                    </div>

                    {/* Toolbar Action Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(turn.id, turn.response.answer)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 transition-all"
                      >
                        {copiedId === turn.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === turn.id ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => setActiveJsonId(activeJsonId === turn.id ? null : turn.id)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-400 hover:text-indigo-300 transition-all"
                      >
                        <Code2 className="w-3.5 h-3.5" /> JSON
                      </button>
                    </div>
                  </div>

                  {/* Node Traversal Trace */}
                  {turn.response.graph_execution_path && (
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-black/40 p-2.5 rounded-xl border border-white/5">
                      <span className="text-indigo-400 font-bold mr-1">LangGraph Path:</span>
                      {turn.response.graph_execution_path.map((n, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-300">{n}</span>
                      ))}
                    </div>
                  )}

                  {/* Formatted Answer */}
                  <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-2">
                    {turn.response.answer.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>

                  {/* Citations Section */}
                  {turn.response.citations && turn.response.citations.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-indigo-400" /> Verified Document Citations ({turn.response.citations.length}):
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {turn.response.citations.map((c, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => handleOpenCitation(c)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-xs font-mono text-indigo-300 flex items-center gap-2 transition-all hover:scale-105 shadow-md group cursor-pointer"
                            title={`Click to preview / view ${c.document_name}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400 group-hover:text-white" />
                            <span className="group-hover:underline font-semibold">{c.document_name}</span>
                            <ExternalLink className="w-3 h-3 text-indigo-400 opacity-60 group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>

                      {/* Interactive Audio/Video Timeline UI */}
                      {turn.response.citations.map((c, cIdx) => (
                        <AudioTimelineItem key={`timeline-${cIdx}`} citation={c} />
                      ))}
                    </div>
                  )}

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/5 text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-500 block">LATENCY</span>
                      <span className="font-bold text-emerald-400">{turn.response.metrics?.total_time_ms ?? turn.response.metrics?.retrieval_time_ms ?? 320} ms</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-500 block">TOKENS (IN/OUT)</span>
                      <span className="font-bold text-purple-300">{turn.response.metrics?.prompt_tokens} / {turn.response.metrics?.completion_tokens}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-500 block">HEADROOM SAVED</span>
                      <span className="font-bold text-cyan-300">{turn.response.metrics?.headroom_saved_tokens || 0} tokens ({turn.response.metrics?.input_compression_ratio || 0}%)</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/30 border border-white/5">
                      <span className="text-[10px] text-slate-500 block">CAVEMAN SAVED</span>
                      <span className="font-bold text-emerald-300">{turn.response.metrics?.caveman_saved_tokens || 0} tokens ({turn.response.metrics?.output_compression_ratio || 0}%)</span>
                    </div>
                  </div>

                  {/* RAGAS Assessment Pill */}
                  {turn.response.metrics?.ragas_metrics && (
                    <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <span className="text-purple-300 font-bold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" /> RAGAS Score: {(turn.response.metrics.ragas_metrics.ragas_score * 100).toFixed(1)}%
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-purple-200">
                        <span>Faithfulness: {(turn.response.metrics.ragas_metrics.faithfulness * 100).toFixed(0)}%</span>
                        <span>Relevancy: {(turn.response.metrics.ragas_metrics.answer_relevancy * 100).toFixed(0)}%</span>
                        <span>Precision: {(turn.response.metrics.ragas_metrics.context_precision * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Raw JSON Trace Modal */}
                  {activeJsonId === turn.id && (
                    <div className="p-4 rounded-2xl bg-black/90 border border-indigo-500/30 text-xs font-mono text-emerald-400 overflow-x-auto">
                      <pre>{JSON.stringify(turn.response, null, 2)}</pre>
                    </div>
                  )}

                </div>
              </div>

            </div>
          ))
        )}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono animate-pulse">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            Executing LangGraph RAG pipeline, retrieving documents, & applying Headroom/Caveman optimization...
          </div>
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Sticky Bottom Chat Input Bar */}
      <div className="sticky bottom-4 z-20">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendQuery(); }}
          className="p-3 rounded-3xl bg-[#0c0f17]/95 border border-indigo-500/30 shadow-2xl backdrop-blur-2xl flex items-center gap-3"
        >
          {/* Metadata Filters & Prompt Mode Selector */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-r border-white/10 pr-3">
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="bg-black/50 border border-white/10 text-slate-300 text-xs rounded-xl px-2.5 py-2 font-mono focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Divisions</option>
              <option value="Corporate">Corporate</option>
              <option value="BusinessLine">Business Line</option>
            </select>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about corporate policy, training, or onboarding..."
            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none font-medium"
          />

          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all disabled:opacity-50 shrink-0"
          >
            Send <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

    </div>
  );
};
