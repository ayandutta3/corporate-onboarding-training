import React, { useState, useEffect } from 'react';
import { AuthUser, UserRole, AdminUser } from '../types';
import { createUser, getUsers, approveUser, rejectUser } from '../services/api';
import { Users, UserPlus, Mail, Lock, CheckCircle2, AlertCircle, Building2, Briefcase } from 'lucide-react';

interface UserAdminPageProps {
  user: AuthUser;
  backendUrl: string;
}

export const UserAdminPage: React.FC<UserAdminPageProps> = ({ user, backendUrl }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [division, setDivision] = useState<'Corporate' | 'Business Line'>(user.role === 'hr' ? 'Business Line' : 'Corporate');
  const [role, setRole] = useState<UserRole>(user.role === 'hr' ? 'user' : 'admin');
  const [businessLine, setBusinessLine] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Approval state
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [actionType, setActionType] = useState<'reject' | null>(null);
  const [selectedDesignations, setSelectedDesignations] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const designations = [
    'DevOps Engineer',
    'AI Engineer',
    'QA Engineer',
    'Java Developer',
    'Full Stack Developer',
    'Support Engineer'
  ];

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(user.token || '', backendUrl);
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (user.role === 'hr' && !businessLine) {
      setFeedback({ success: false, message: 'Business Line is required.' });
      return;
    }
    if (division === 'Business Line' && !businessLine) {
      setFeedback({ success: false, message: 'Business Line is required for Business Line Division.' });
      return;
    }

    setIsCreating(true);
    setFeedback(null);

    try {
      const res = await createUser(
        { email, password, role, division, businessLine: businessLine || undefined },
        user.token || '',
        backendUrl
      );
      setFeedback(res);
      if (res.success) {
        setEmail('');
        setPassword('');
        loadUsers();
      }
    } catch (err: any) {
      setFeedback({ success: false, message: err.message || 'Failed to create user.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleApprove = async (userToApprove: AdminUser) => {
    setActionLoading(true);
    try {
      const desig = selectedDesignations[userToApprove.id] || designations[0];
      await approveUser(userToApprove.id, desig, user.token || '', backendUrl);
      loadUsers();
    } catch (err) {
      alert('Failed to approve user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!actionUser) return;
    setActionLoading(true);
    try {
      await rejectUser(actionUser.id, rejectReason, user.token || '', backendUrl);
      setActionUser(null);
      setActionType(null);
      loadUsers();
    } catch (err) {
      alert(`Failed to ${actionType} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const isHr = user.role === 'hr';
  const isTechManager = user.role === 'technical_manager';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-outfit text-lg font-bold text-white">User Administration</h3>
            <p className="text-xs font-mono text-slate-400">Manage platform access and security roles</p>
          </div>
        </div>

        {user.role === 'technical_manager' && !user.businessLine && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm mb-4">
            Warning: Your Technical Manager account is missing a Business Line assignment. Because of this, you cannot view or approve any users. Please contact an Admin to recreate your account or reassign your business line.
          </div>
        )}

        {/* Create User Form (Admin & HR) */}
        {(user.role === 'admin' || user.role === 'hr') && (
          <div className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" /> Provision New User
            </h4>
            
            {feedback && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                feedback.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                {feedback.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-1">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@corp"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
              <div className="lg:col-span-1">
                <select
                  value={division}
                  onChange={(e) => {
                    const newDiv = e.target.value as 'Corporate' | 'Business Line';
                    setDivision(newDiv);
                    if (newDiv === 'Corporate') setRole('admin');
                    else setRole('user');
                  }}
                  disabled={isHr}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 appearance-none disabled:opacity-50"
                >
                  <option value="Corporate" className="bg-[#0e1117]">Corporate</option>
                  <option value="Business Line" className="bg-[#0e1117]">Business Line</option>
                </select>
              </div>
              <div className="lg:col-span-1">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  disabled={isHr}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 appearance-none capitalize disabled:opacity-50"
                >
                  {division === 'Corporate' ? (
                    <>
                      <option value="admin" className="bg-[#0e1117]">Admin</option>
                      <option value="hr" className="bg-[#0e1117]">HR Manager</option>
                      <option value="finance_manager" className="bg-[#0e1117]">Finance Manager</option>
                    </>
                  ) : (
                    <>
                      <option value="technical_manager" className="bg-[#0e1117]">Technical Manager</option>
                      <option value="user" className="bg-[#0e1117]">User</option>
                    </>
                  )}
                </select>
              </div>
              <div className="lg:col-span-1">
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <select
                    value={businessLine}
                    onChange={(e) => setBusinessLine(e.target.value)}
                    disabled={division === 'Corporate'}
                    required={division === 'Business Line'}
                    className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-amber-500 appearance-none disabled:opacity-50"
                  >
                    <option value="" className="bg-[#0e1117]">Select Business Line...</option>
                    <option value="Insurance" className="bg-[#0e1117]">Insurance</option>
                    <option value="Banking" className="bg-[#0e1117]">Banking</option>
                    <option value="Healthcare" className="bg-[#0e1117]">Healthcare</option>
                    <option value="Retail" className="bg-[#0e1117]">Retail</option>
                  </select>
                </div>
              </div>
              <div className="lg:col-span-1">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                >
                  {isCreating ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40 mt-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/5">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Division / Line</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-mono text-white">{u.email}</td>
                    <td className="py-3 px-4 capitalize text-slate-300">{u.role.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {u.division || '-'} {u.businessLine ? `(${u.businessLine})` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-400 flex items-center gap-2">
                      {u.designation ? (
                        <>
                          <Briefcase className="w-3.5 h-3.5" /> {u.designation}
                        </>
                      ) : isTechManager && u.status === 'PendingApproval' ? (
                        <select
                          value={selectedDesignations[u.id] || designations[0]}
                          onChange={(e) => setSelectedDesignations({ ...selectedDesignations, [u.id]: e.target.value })}
                          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none"
                        >
                          {designations.map(d => <option key={d} value={d} className="bg-[#0e1117]">{d}</option>)}
                        </select>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        u.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' :
                        u.status === 'Rejected' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {u.status}
                      </span>
                      {!u.is_active && u.status === 'Rejected' && u.rejection_reason && (
                        <p className="text-[10px] text-rose-400/70 mt-1 max-w-[150px] truncate" title={u.rejection_reason}>
                          {u.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {isTechManager && u.status === 'PendingApproval' && (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleApprove(u)}
                            disabled={actionLoading}
                            className="px-2 py-1 text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded transition-colors disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => { setActionUser(u); setActionType('reject'); }}
                            className="px-2 py-1 text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval / Rejection Modal */}
      {actionUser && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-lg">
              {actionType === 'approve' ? 'Approve User' : 'Reject User'}
            </h3>
            <p className="text-sm text-slate-400">User: <span className="font-mono">{actionUser.email}</span></p>
            
              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason for Rejection</label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full p-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none"
                  placeholder="e.g. Incomplete background check"
                />
              </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setActionUser(null); setActionType(null); }}
                className="flex-1 py-2 text-sm text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason}
                className="flex-1 py-2 text-sm font-bold rounded-xl transition-all disabled:opacity-50 bg-rose-500/10 text-rose-400 border border-rose-500/30"
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
