import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Layers,
  Video,
  ShieldCheck,
  Cpu,
  Zap,
} from 'lucide-react';

export const Onboarding3dOrbit: React.FC = () => {
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [orbitAngle, setOrbitAngle] = useState(0);
  const [hoveredCardIndex, setHoveredCardIndex] = useState<number | null>(null);

  const sampleQueries = [
    "What is the Work From Home (WFH) eligibility and core availability hours?",
    "How many casual leave days am I entitled to per calendar year?",
    "What are the mandatory approval steps for remote onboarding equipment?",
    "Show the leave encashment formula and carry-forward limits."
  ];

  // Rotate query simulation text
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveQueryIndex((prev) => (prev + 1) % sampleQueries.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [sampleQueries.length]);

  // Smooth continuous orbital rotation animation loop (pauses when user hovers over any card)
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (hoveredCardIndex === null) {
        setOrbitAngle((prev) => (prev + 0.35) % 360);
      }
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [hoveredCardIndex]);

  const cards = [
    { title: 'Agentic RAG & Routing', tag: '• LANGGRAPH ENGINE', icon: <Layers className="w-5 h-5 text-indigo-400" />, activeBorder: 'border-indigo-400 shadow-indigo-500/30' },
    { title: 'Multi-Format Ingestion', tag: '• PDF, AUDIO & VIDEO', icon: <Video className="w-5 h-5 text-purple-400" />, activeBorder: 'border-purple-400 shadow-purple-500/30' },
    { title: 'Division & Business RBAC', tag: '• STRICT RBAC SECURITY', icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />, activeBorder: 'border-emerald-400 shadow-emerald-500/30' },
    { title: 'User Semantic Caching', tag: '• 0MS LATENCY CACHE', icon: <Cpu className="w-5 h-5 text-cyan-400" />, activeBorder: 'border-cyan-400 shadow-cyan-500/30' },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center py-6 space-y-6">

      {/* 3D Orbit Coordinate Frame Container */}
      <div
        className="relative w-80 h-80 sm:w-96 sm:h-96 flex items-center justify-center"
        style={{ perspective: '1200px' }}
      >
        {/* Orbital Ring Plane */}
        <div
          className="relative w-full h-full flex items-center justify-center"
        >
          {/* Outer Orbital Path Ring */}
          <div className="absolute w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] rounded-full border-2 border-indigo-500/40 border-dashed animate-spin-slow shadow-2xl" />

          {/* Center Glowing Hub Node */}
          <div
            className="absolute z-20 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-0.5 shadow-2xl glow-violet flex items-center justify-center"
          >
            <div className="w-full h-full bg-[#0a0d14] rounded-full flex flex-col items-center justify-center p-2 text-center">
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
              <span className="text-[10px] font-extrabold text-white tracking-tight leading-tight mt-1">
                AI Onboarder Hub
              </span>
            </div>
          </div>

          {/* Orbiting 4 Cards with Dynamic Continuous Rotation & High-Contrast Sharp Text */}
          {cards.map((card, index) => {
            const baseAngleDeg = index * 90 + orbitAngle;
            const angleRad = (baseAngleDeg * Math.PI) / 180;
            const radius = 140;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;

            const isHovered = hoveredCardIndex === index;
            const isFront = y > 0;
            
            const depthScale = isHovered ? 1.15 : (0.92 + ((y + radius) / (2 * radius)) * 0.16);
            const opacity = isHovered ? 1.0 : (0.85 + ((y + radius) / (2 * radius)) * 0.15);
            const zIndex = isHovered ? 100 : Math.round(40 + y);

            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredCardIndex(index)}
                onMouseLeave={() => setHoveredCardIndex(null)}
                className="absolute transition-transform duration-75 pointer-events-auto cursor-pointer"
                style={{
                  transform: `translate3d(${x}px, ${y}px, 0px) scale(${depthScale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                }}
              >
                {/* 2D High-Contrast Crisp Card Container */}
                <div
                  className={`p-3.5 rounded-2xl transition-all duration-200 flex items-center gap-3 w-52 border ${
                    isHovered
                      ? 'bg-[#0b0f1d] border-2 border-cyan-400 shadow-2xl shadow-cyan-500/80 text-white ring-4 ring-cyan-400/90 scale-105'
                      : isFront
                      ? `bg-[#0e1220] ${card.activeBorder} shadow-2xl text-white ring-1 ring-indigo-400/50`
                      : 'bg-[#0f1424] border-white/20 text-white shadow-xl hover:border-cyan-400/60'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 transition-colors ${isHovered ? 'bg-cyan-500/30 border border-cyan-400/60' : isFront ? 'bg-indigo-500/30' : 'bg-indigo-950/60 border border-white/10'}`}>
                    {card.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-xs font-black tracking-wide leading-tight transition-colors ${isHovered ? 'text-cyan-200 text-sm font-bold' : 'text-white'}`}>
                      {card.title}
                    </span>
                    <span className={`text-[9px] font-mono font-extrabold tracking-wider uppercase mt-0.5 ${isHovered ? 'text-cyan-300' : isFront ? 'text-cyan-300' : 'text-indigo-300/80'}`}>
                      {card.tag}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Typing Query Simulation Display */}
      <div className="w-full max-w-lg p-4 rounded-2xl bg-[#0a0d14]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-2">

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/5 pb-1.5">
          <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
            <Zap className="w-3.5 h-3.5" /> Simulated Onboarding Query
          </span>
          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Real-time RAG
          </span>
        </div>
        <div className="min-h-[44px] flex items-center font-mono text-xs text-indigo-200">
          <span className="text-purple-400 font-bold mr-2">&gt;</span>
          <span className="animate-in fade-in duration-300">
            "{sampleQueries[activeQueryIndex]}"
          </span>
        </div>
      </div>

    </div>
  );
};
