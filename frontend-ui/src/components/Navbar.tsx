import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  Search,
  UploadCloud,
  Activity,
  Users,
  Settings,
  LogOut,
  ShieldAlert,
  Server,
  Sparkles,
  ChevronDown,
  UserCheck,
  Building2,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface NavbarProps {
  user: AuthUser;
  activeTab: 'search' | 'upload' | 'monitoring' | 'users';
  setActiveTab: (tab: 'search' | 'upload' | 'monitoring' | 'users') => void;
  onLogout: () => void;
  onSwitchUser: (persona: AuthUser) => void;
  onOpenSettings: () => void;
  onOpenUserModal: () => void;
  isConnected: boolean | null;
  isDemoMode: boolean;
  backendUrl: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onSwitchUser,
  onOpenSettings,
  onOpenUserModal,
  isConnected,
  isDemoMode,
  backendUrl,
}) => {
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const isManagerOrAdmin = ['admin', 'hr', 'finance_manager', 'technical_manager'].includes(user.role);

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'hr':
        return 'bg-pink-500/10 text-pink-400 border-pink-500/30';
      case 'technical_manager':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
      case 'finance_manager':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'System Admin';
      case 'hr':
        return 'HR Director';
      case 'technical_manager':
        return 'VP Engineering';
      case 'finance_manager':
        return 'Finance Lead';
      default:
        return 'Employee';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#080a0f]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('search')}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-4 h-4 bg-white/20 rounded-sm rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white">
                  CORP<span className="text-indigo-400">_RAG</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full">
                  LangGraph v2.4
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('search')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'search'
                  ? 'bg-white/10 text-white border border-white/10 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Search className="w-4 h-4" />
              Semantic Search
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'upload'
                  ? 'bg-white/10 text-white border border-white/10 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              Knowledge Upload
              {!isManagerOrAdmin && (
                <span className="px-1.5 py-0.2 text-[9px] bg-slate-800 text-slate-400 rounded">Restricted</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('monitoring')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'monitoring'
                  ? 'bg-white/10 text-white border border-white/10 shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-4 h-4" />
              Tracing & Metrics
            </button>

            {user.role === 'admin' && (
              <button
                onClick={onOpenUserModal}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'users'
                    ? 'bg-white/10 text-white border border-white/10 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="w-4 h-4" />
                User Admin
              </button>
            )}
          </nav>

          {/* Right Action Controls & Status */}
          <div className="flex items-center gap-2">
            {/* Backend Connectivity Status Badge */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : isDemoMode
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Click to configure FastAPI Backend Endpoint"
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isConnected ? 'bg-emerald-400' : isDemoMode ? 'bg-purple-400' : 'bg-amber-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-500' : isDemoMode ? 'bg-purple-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <Server className="w-3 h-3 hidden sm:inline" />
              <span className="hidden sm:inline font-semibold">
                {isConnected ? 'Backend Ready' : isDemoMode ? 'Demo RAG Mode' : 'Offline / Standby'}
              </span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
              title="API & Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Active User Dropdown with Quick Persona Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowPersonaMenu(!showPersonaMenu)}
                className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                  {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                </div>
                <div className="hidden lg:block">
                  <div className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-semibold border rounded ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPersonaMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0e1626] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2.5">
                    <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                      Active User Profile
                    </p>
                    <p className="text-xs font-bold text-white mt-1">{user.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{user.email}</p>
                    <div className="flex items-center gap-1 mt-2 text-[11px] text-cyan-400">
                      <Building2 className="w-3 h-3" />
                      {user.department}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setShowPersonaMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Tab bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-slate-950/90 py-2 px-2">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'search' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Search className="w-4 h-4" />
          RAG Search
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'upload' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Ingestion
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex flex-col items-center gap-1 text-[10px] ${
            activeTab === 'monitoring' ? 'text-emerald-400 font-bold' : 'text-slate-400'
          }`}
        >
          <Activity className="w-4 h-4" />
          Traces
        </button>
      </div>
    </header>
  );
};
