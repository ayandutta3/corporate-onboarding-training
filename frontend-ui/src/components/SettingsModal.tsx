import React, { useState } from 'react';
import { checkBackendHealth } from '../services/api';
import {
  Settings,
  Server,
  RefreshCw,
  CheckCircle2,
  XCircle,
  X,
  Zap,
  Globe,
  Code2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  isDemoMode: boolean;
  setIsDemoMode: (demo: boolean) => void;
  isConnected: boolean | null;
  setIsConnected: (status: boolean | null) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  backendUrl,
  setBackendUrl,
  isDemoMode,
  setIsDemoMode,
  isConnected,
  setIsConnected,
}) => {
  const [tempUrl, setTempUrl] = useState(backendUrl);
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestPing = async () => {
    setIsPinging(true);
    setPingResult(null);

    const ok = await checkBackendHealth(tempUrl);
    setIsConnected(ok);
    setIsPinging(false);
    setPingResult(
      ok
        ? `Backend reachable at ${tempUrl}!`
        : `Could not connect to ${tempUrl}. Verify FastAPI server is running with CORS enabled.`
    );
  };

  const handleSave = () => {
    setBackendUrl(tempUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-lg font-bold text-white">Backend API Settings</h3>
              <p className="text-xs font-mono text-slate-400">FastAPI & LangGraph Endpoint</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1">FastAPI Backend Base URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempUrl}
                onChange={(e) => setTempUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="button"
                onClick={handleTestPing}
                disabled={isPinging}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-cyan-400 font-bold shrink-0 flex items-center gap-1"
              >
                {isPinging ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Ping'}
              </button>
            </div>
          </div>

          {pingResult && (
            <div
              className={`p-3 rounded-xl border flex items-center gap-2 ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              {isConnected ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
              <span>{pingResult}</span>
            </div>
          )}

          {/* Mode Switcher */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> Force Demo / Simulated Mode
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Simulates realistic LangGraph RAG responses if local FastAPI backend is offline.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDemoMode(!isDemoMode)}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  isDemoMode ? 'bg-purple-600' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isDemoMode ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300">Registered Backend Endpoints:</p>
            <p>• Auth: POST /auth/login</p>
            <p>• Admin: POST /admin/users</p>
            <p>• Upload: POST /upload/vector | POST /upload/hybrid</p>
            <p>• Search: POST /search/vector | POST /search/hybrid</p>
            <p>• Monitoring: GET /monitoring/traces</p>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl font-outfit font-bold text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
