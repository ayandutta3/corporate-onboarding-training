import React, { useState, useEffect } from 'react';
import { AuthUser } from '../types';
import { fetchDocuments, deleteDocument, ApiState } from '../services/api';
import { DocumentPreviewModal } from './DocumentPreviewModal';
import {
  FileText, Database, Building2, Search, Trash2, Eye, Download,
  Filter, ChevronLeft, ChevronRight, AlertCircle, RefreshCw
} from 'lucide-react';

interface PolicyHubProps {
  user: AuthUser;
  backendUrl: string;
}

export const PolicyHub: React.FC<PolicyHubProps> = ({ user, backendUrl }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filtering state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [divisionFilter, setDivisionFilter] = useState('');
  const [businessLineFilter, setBusinessLineFilter] = useState('');
  
  // Preview state
  const [previewDoc, setPreviewDoc] = useState<{id: string, name: string} | null>(null);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await fetchDocuments(user.token || '', backendUrl, {
        page,
        size: 10,
        search: searchQuery,
        department: deptFilter,
        division: divisionFilter,
        businessLine: businessLineFilter
      });
      setDocuments(data.items);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [page, deptFilter, divisionFilter, businessLineFilter]);
  
  // Reload when search query changes after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadDocuments();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone and will remove it from the vector database.`)) return;
    
    try {
      await deleteDocument(id, user.token || '', backendUrl);
      loadDocuments();
    } catch (err) {
      alert('Failed to delete document.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileType = (filename: string) => {
    const ext = filename.split('.').pop()?.toUpperCase() || 'UNKNOWN';
    return ext;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
              <Database className="w-8 h-8 text-indigo-400" />
              Policy Hub
            </h1>
            <p className="text-slate-400 mt-2">
              Browse, preview, and manage all documents across the enterprise knowledge base.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-white/5">
            <div className="text-right px-2">
              <div className="text-xs font-bold uppercase text-slate-500">Total Records</div>
              <div className="text-lg font-mono text-white">{totalCount}</div>
            </div>
            <button onClick={loadDocuments} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-300">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-2xl border border-white/5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, tags, uploader..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 appearance-none"
            >
              <option value="" className="bg-[#0e1117]">All Departments</option>
              <option value="Corporate Finance & Ops" className="bg-[#0e1117]">Corporate Finance & Ops</option>
              <option value="Engineering" className="bg-[#0e1117]">Engineering</option>
              <option value="HR" className="bg-[#0e1117]">HR</option>
              <option value="Management" className="bg-[#0e1117]">Management</option>
            </select>
          </div>

          <div className="flex flex-wrap gap-3 mt-4">
            <select 
              value={divisionFilter}
              onChange={(e) => {
                setDivisionFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">All Divisions</option>
              <option value="Corporate">Corporate</option>
              <option value="BusinessLine">Business Line</option>
            </select>
            
            <select 
              value={businessLineFilter}
              onChange={(e) => {
                setBusinessLineFilter(e.target.value);
                setPage(1);
              }}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500/50"
            >
              <option value="">All Business Lines</option>
              <option value="Insurance">Insurance</option>
              <option value="Banking">Banking</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Retail">Retail</option>
              <option value="Telecom">Telecom</option>
            </select>
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-black/40">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs font-bold uppercase tracking-wider text-slate-500 bg-white/5">
                <th className="py-3 px-4">Document</th>
                <th className="py-3 px-4">Metadata</th>
                <th className="py-3 px-4">Uploader</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {documents.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No documents found matching the current filters.
                  </td>
                </tr>
              )}
              {documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-white/5 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 mt-1">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-white font-mono">{doc.filename}</p>
                        {doc.title && <p className="text-xs text-slate-400 mt-0.5">{doc.title}</p>}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {getFileType(doc.filename)}
                          </span>
                          <span className="text-[10px] text-slate-500">v{doc.version}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-300 text-xs rounded border border-indigo-500/20">
                        {doc.division || 'Unknown'}
                      </span>
                      {doc.businessLine && (
                        <span className="px-2 py-1 bg-amber-500/10 text-amber-300 text-xs rounded border border-amber-500/20">
                          {doc.businessLine}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {doc.uploaded_by}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-xs">
                    {formatDate(doc.created_at)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setPreviewDoc({id: doc._id, name: doc.filename})}
                        className="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition-colors border border-indigo-500/20"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={`${backendUrl}/documents/${doc._id}/download?token=${user.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-colors border border-emerald-500/20"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      {user.role === 'admin' && (
                        <button
                          onClick={() => handleDelete(doc._id, doc.filename)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <p className="text-xs text-slate-500 font-mono">
              Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
      
      <DocumentPreviewModal 
        isOpen={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        documentId={previewDoc?.id || ''}
        filename={previewDoc?.name || ''}
        backendUrl={backendUrl}
        user={user}
      />
    </div>
  );
};
