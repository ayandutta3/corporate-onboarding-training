import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import {
  Search,
  UploadCloud,
  Activity,
  Users,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  Server,
  Building2,
  Lock
} from 'lucide-react';

export type NavTab = 'search' | 'upload' | 'monitoring' | 'policy' | 'users' | 'ragas_report';

interface SidebarProps {
  user: AuthUser;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenUserModal: () => void;
  isConnected: boolean | null;
  isDemoMode: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenSettings,
  onOpenUserModal,
  isConnected,
  isDemoMode,
  isCollapsed,
  setIsCollapsed,
}) => {
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
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#080a0f]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section: Brand & Collapse Toggle */}
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => setActiveTab('search')}
            className="flex items-center gap-3 cursor-pointer overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <div className="w-5 h-5 bg-white/20 rounded-sm rotate-45" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold tracking-tight text-lg text-white">
                    CORP<span className="text-indigo-400">_RAG</span>
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">LangGraph v2.4</span>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Backend Status Pill */}
        <div
          onClick={onOpenSettings}
          className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center gap-2.5 ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              : isDemoMode
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30 hover:bg-purple-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
          }`}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isConnected ? 'bg-emerald-400' : isDemoMode ? 'bg-purple-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isConnected ? 'bg-emerald-500' : isDemoMode ? 'bg-purple-500' : 'bg-amber-500'
              }`}
            />
          </span>
          {!isCollapsed && (
            <span className="text-xs font-mono font-semibold truncate">
              {isConnected ? 'Backend Live' : isDemoMode ? 'Demo Mode' : 'Offline'}
            </span>
          )}
        </div>

        {/* Navigation Item Links */}
        <nav className="space-y-1.5 pt-2">
          <button
            onClick={() => setActiveTab('search')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'search'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Semantic Search"
          >
            <Search className="w-4 h-4 shrink-0 text-indigo-400" />
            {!isCollapsed && <span>Semantic Search</span>}
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'upload'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Knowledge Upload"
          >
            <div className="flex items-center gap-3">
              <UploadCloud className="w-4 h-4 shrink-0 text-purple-400" />
              {!isCollapsed && <span>Knowledge Upload</span>}
            </div>
            {!isCollapsed && !isManagerOrAdmin && (
              <Lock className="w-3 h-3 text-slate-500 shrink-0" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('monitoring')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'monitoring'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Tracing & Metrics"
          >
            <Activity className="w-4 h-4 shrink-0 text-emerald-400" />
            {!isCollapsed && <span>Tracing & Metrics</span>}
          </button>

          <button
            onClick={() => setActiveTab('policy')}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'policy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title="Policy Hub"
          >
            <Database className="w-4 h-4 shrink-0 text-cyan-400" />
            {!isCollapsed && <span>Policy Hub</span>}
          </button>

          {user.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('ragas_report')}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'ragas_report'
                    ? 'bg-purple-500/25 text-purple-200 border border-purple-500/50 shadow-lg shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="RAGAS Report"
              >
                <Sparkles className="w-4 h-4 shrink-0 text-purple-400" />
                {!isCollapsed && <span>RAGAS Report</span>}
              </button>

              <button
                onClick={onOpenUserModal}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'users'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
                title="User Admin"
              >
                <Users className="w-4 h-4 shrink-0 text-amber-400" />
                {!isCollapsed && <span>User Admin</span>}
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Bottom Section: Settings & Active User Profile */}
      <div className="p-4 border-t border-white/10 space-y-3">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          title="System Settings"
        >
          <Settings className="w-4 h-4 shrink-0 text-slate-400" />
          {!isCollapsed && <span>Settings</span>}
        </button>

        <div className="pt-2 flex items-center justify-between gap-2 bg-black/40 p-2.5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
              {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden text-left">
                <div className="text-xs font-bold text-white truncate">{user.name}</div>
                <span className={`px-1.5 py-0.2 text-[9px] font-semibold border rounded ${getRoleBadgeColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
