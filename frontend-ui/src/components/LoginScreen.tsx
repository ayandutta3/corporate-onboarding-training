import React, { useState } from 'react';
import { AuthUser } from '../types';
import { loginUser } from '../services/api';
import { Onboarding3dOrbit } from './Onboarding3dOrbit';
import { LottieAnimation } from './LottieAnimation';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Server,
  Eye,
  EyeOff,
  UserCheck,
  Zap,
  Building2,
  Cpu,
} from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser, token: string) => void;
  backendUrl: string;
  isDemoMode: boolean;
  onOpenSettings: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  backendUrl,
  isDemoMode,
  onOpenSettings,
}) => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const { user, token } = await loginUser(email, password, backendUrl);
      onLoginSuccess(user, token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials or backend endpoint.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('admin');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-hidden bg-[#050608]">
      {/* Bento ambient lighting background */}
      <div className="bento-ambient-bg" />

      {/* Main 12-Column Responsive Layout */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl w-full mx-auto">

        {/* LEFT COLUMN (lg:col-span-7): Greeting & 3D Orbit Visualizer */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Corporate Onboarding RAG Intelligence
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Enterprise Knowledgebase <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                AI Onboarding Platform
              </span>
            </h1>
            <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
              LangGraph RAG pipeline featuring <span className="text-indigo-300 font-semibold">Headroom token window compression</span>, <span className="text-purple-300 font-semibold">Caveman output optimization</span>, and <span className="text-emerald-300 font-semibold font-mono">0ms Semantic Caching</span>.
            </p>
          </div>

          {/* 3D Orbit Visualizer */}
          <div className="pt-2">
            <Onboarding3dOrbit />
          </div>
        </div>

        {/* RIGHT COLUMN (lg:col-span-5): Login Card & Lottie Asset */}
        <div className="lg:col-span-5">
          <div className="rounded-3xl bg-[#0e1117]/95 border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden space-y-6">

            {/* Top header & Lottie Welcome Asset */}
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  System Login
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Online
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  Enter authorized credentials
                </p>
              </div>

              {/* Lottie Animation Wrapper with Offline Fallback */}
              <LottieAnimation
                className="w-12 h-12 shrink-0"
                src="https://assets2.lottiefiles.com/packages/lf20_mbe902p9.json"
              />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-mono">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@corp.internal"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:opacity-90 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2 font-mono"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Role Presets */}
            <div className="pt-2 space-y-2">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold tracking-wider">Quick Preset Logins:</span>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@example.com')}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/40 text-slate-300 hover:text-white text-left transition-all"
                >
                  <div className="font-bold text-indigo-300">Admin</div>
                  <div className="text-slate-500">admin@example.com</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('hr@example.com')}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/40 text-slate-300 hover:text-white text-left transition-all"
                >
                  <div className="font-bold text-purple-300">HR Director</div>
                  <div className="text-slate-500">hr@example.com</div>
                </button>
              </div>
            </div>

            {/* Footer info */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span className="flex items-center gap-1 text-slate-500">
                <Server className="w-3 h-3 text-indigo-400" /> Target: {backendUrl}
              </span>
              <button
                onClick={onOpenSettings}
                className="text-indigo-400 hover:underline flex items-center gap-1"
              >
                Configure Endpoint
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
