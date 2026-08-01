import React, { useState } from 'react';
import { AuthUser, UserRole } from '../types';
import { createAdminUser } from '../services/api';
import {
  Users,
  UserPlus,
  Mail,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  UserCheck,
} from 'lucide-react';

interface UserManagementModalProps {
  currentUser: AuthUser;
  isOpen: boolean;
  onClose: () => void;
  backendUrl: string;
  isDemoMode: boolean;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  backendUrl,
  isDemoMode,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await createAdminUser(
        { email, password, role },
        currentUser.token || 'admin-token',
        backendUrl,
        isDemoMode
      );
      setFeedback(res);
      if (res.success) {
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to create user.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-outfit text-lg font-bold text-white">Admin User Provisioning</h3>
              <p className="text-xs font-mono text-slate-400">Endpoint: POST /admin/users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              feedback.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleCreateUser} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1">User Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="new.employee@corp.internal"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Initial Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 mb-1">Assign Security Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500 capitalize"
            >
              <option value="user">User (Standard RAG Search)</option>
              <option value="hr">HR Manager (HR Documents Ingestion)</option>
              <option value="technical_manager">Technical Manager (Engineering Ingestion)</option>
              <option value="finance_manager">Finance Manager (Financial Policy Ingestion)</option>
              <option value="admin">Admin (Full System Access)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl font-outfit font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              'Posting to /admin/users...'
            ) : (
              <>
                <UserPlus className="w-4 h-4" /> Provision New User
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
