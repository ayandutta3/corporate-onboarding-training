import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { loginUser } from '../services/api';
import {
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Server,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
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


  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-[#050608]">
      {/* Bento ambient lighting background */}
      <div className="bento-ambient-bg" />

      {/* Main Bento container */}
      <div className="relative w-full max-w-xl z-10">
        <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          {/* Top header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
              <div className="w-5 h-5 bg-white/20 rounded-sm rotate-45" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              CORP<span className="text-indigo-400">_RAG</span> Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
              Semantic Search & Vector Retrieval System
            </p>
          </div>


          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
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
              className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
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

          {/* Footer info */}
          <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
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
  );
};
