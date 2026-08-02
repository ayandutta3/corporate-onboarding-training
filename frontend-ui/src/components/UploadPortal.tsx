import React, { useState, useRef } from 'react';
import { AuthUser, IngestionMode, UploadedDoc } from '../types';
import { getActiveDocuments, uploadDocument } from '../services/api';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Database,
  Building2,
  ShieldAlert,
  Zap,
  ArrowRight,
  RefreshCw,
  HardDrive,
  FileCode,
  Lock,
  Plus,
} from 'lucide-react';

interface UploadPortalProps {
  user: AuthUser;
  backendUrl: string;
  isDemoMode: boolean;
  onSwitchPersonaToManager?: () => void;
}

export const UploadPortal: React.FC<UploadPortalProps> = ({
  user,
  backendUrl,
  isDemoMode,
  onSwitchPersonaToManager,
}) => {
  const isManagerOrAdmin = ['admin', 'hr', 'finance_manager', 'technical_manager'].includes(user.role);

  const getDefaultDepartment = (role: string) => {
    switch(role) {
      case 'hr': return 'HR';
      case 'technical_manager': return 'Engineering';
      case 'finance_manager': return 'Finance';
      case 'admin': return 'Corporate Finance & Ops';
      default: return 'Hidden / Read Only';
    }
  };

  // CRITICAL REQUIRED UI TOGGLE SWITCH: Vector Ingestion vs Hybrid Ingestion
  const [ingestionMode, setIngestionMode] = useState<IngestionMode>('hybrid');
  const [selectedDepartment, setSelectedDepartment] = useState(getDefaultDepartment(user.role));

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [customTags, setCustomTags] = useState('');
  const [autofillTags, setAutofillTags] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastUploadedDoc, setLastUploadedDoc] = useState<UploadedDoc | null>(null);

  const [docList, setDocList] = useState<UploadedDoc[]>(getActiveDocuments());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 200);

    try {
      const doc = await uploadDocument(
        selectedFile,
        ingestionMode,
        selectedDepartment,
        user.token || 'demo-token',
        backendUrl,
        docTitle,
        docDescription,
        customTags,
        autofillTags
      );

      clearInterval(interval);
      setUploadProgress(100);
      setLastUploadedDoc(doc);
      setDocList(getActiveDocuments());
      setSelectedFile(null);
      setDocTitle('');
      setDocDescription('');
      setCustomTags('');
    } catch (err) {
      console.error('Error during document ingestion:', err);
    } finally {
      setIsUploading(false);
    }
  };


  if (!isManagerOrAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="glass-panel rounded-3xl p-8 border border-rose-500/30 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white">Manager & Admin Access Required</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Knowledge Base document upload and vector ingestion is restricted to HR Directors, Technical VPs, Finance Leads, and System Admins.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Upload Portal Header */}
      <div className="rounded-3xl bg-[#0e1117] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                ChromaDB Ingestion Engine
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-slate-300">
                Hybrid Mode
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mt-3">
              Knowledge <span className="text-indigo-400">Upload</span>
            </h1>
          </div>

          {/* CRITICAL REQUIRED UI TOGGLE SWITCH: VECTOR INGESTION vs HYBRID INGESTION */}
          <div className="flex items-center gap-3 bg-black p-1.5 rounded-2xl border border-white/5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-indigo-400" /> Mode:
            </span>

            <div className="flex items-center p-1 bg-[#080a0f] rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setIngestionMode('vector')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  ingestionMode === 'vector'
                    ? 'text-indigo-400 bg-indigo-400/10 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Vector
              </button>

              <button
                type="button"
                onClick={() => setIngestionMode('hybrid')}
                className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
                  ingestionMode === 'hybrid'
                    ? 'text-indigo-400 bg-indigo-400/10 border border-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                Hybrid
              </button>
            </div>
          </div>
        </div>

        {/* Upload Form Area */}
        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Metadata tagging bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-purple-400" /> Department Metadata Tag
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                disabled={user.role !== 'admin'}
                className={`w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono ${user.role !== 'admin' ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="Corporate Finance & Ops" className="bg-[#0e1117]">Corporate Finance & Ops</option>
                <option value="HR" className="bg-[#0e1117]">HR</option>
                <option value="Engineering" className="bg-[#0e1117]">Engineering</option>
                <option value="Finance" className="bg-[#0e1117]">Finance</option>
                <option value="Hidden / Read Only" className="bg-[#0e1117]" disabled>Hidden / Read Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-indigo-400" /> Target Endpoint
              </label>
              <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-mono text-indigo-300">
                {ingestionMode === 'hybrid' ? 'POST /upload/hybrid' : 'POST /upload/vector'}
              </div>
            </div>
          </div>

          {/* Title, Description, and Custom Tags metadata form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Document Title (Optional)
              </label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                placeholder="e.g. Q3 Townhall Recording"
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Description (Optional)
              </label>
              <input
                type="text"
                value={docDescription}
                onChange={(e) => setDocDescription(e.target.value)}
                placeholder="Brief summary for vector context..."
                className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          </div>

          {/* AI Autofill Toggle & Additional Custom Tags */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autofillTags}
                  onChange={(e) => setAutofillTags(e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500/30"
                />
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    Auto-generate Metadata & Tags with AI
                  </span>
                  <p className="text-[11px] text-slate-400">
                    If checked, document tags are automatically extracted using AI summary analysis.
                  </p>
                </div>
              </label>
            </div>

            {!autofillTags && (
              <div className="pt-2 border-t border-white/5 animate-in fade-in">
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-300 mb-1.5">
                  User Custom Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  placeholder="e.g. Policy2026, WFH, Mandatory, Confidential"
                  className="w-full px-4 py-2 bg-white/5 border border-indigo-500/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Custom tags entered here will be appended to the document metadata alongside AI summary tags.
                </p>
              </div>
            )}
          </div>


          {/* Drag & Drop Dropzone Bento style */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-indigo-500/60 bg-indigo-500/10'
                : 'border-white/10 hover:border-indigo-500/40 bg-black/40 hover:bg-black/60'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".pdf,.docx,.txt,.md,.csv,.mp3,.wav,.m4a,.flac,.ogg,.aac"
              className="hidden"
            />

            <svg className="w-10 h-10 text-slate-600 mb-3 mx-auto group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>

            {selectedFile ? (
              <div className="space-y-2">
                <p className="text-sm font-bold text-white font-mono">{selectedFile.name}</p>
                <p className="text-xs text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB | {selectedFile.type || 'Document'}
                </p>
                <p className="text-[11px] text-indigo-400 font-mono">Click to change file</p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-300">
                  Drag and drop to ingest or <span className="text-indigo-400 hover:underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Supports Document and Audio formats. Max 25MB for Audio. Documents will be chunked and indexed into ChromaDB.
                </p>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-wider pt-2">Hybrid Mode Active</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Embedding & Indexing Chunk Tokens...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Ingesting Document...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Trigger {ingestionMode.toUpperCase()} Ingestion API
                </>
              )}
            </button>
          </div>
        </form>

        {/* Success Confirmation Banner */}
        {lastUploadedDoc && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-emerald-300">
                Document Ingested: {lastUploadedDoc.fileName}
              </p>
              <p className="text-slate-300 font-mono">
                Created {lastUploadedDoc.chunksCount} chunks tagged for '{lastUploadedDoc.department}' using endpoint '{lastUploadedDoc.mode === 'hybrid' ? '/upload/hybrid' : '/upload/vector'}'. Vector ID: {lastUploadedDoc.vectorId}.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Indexed Documents Table */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit text-lg font-bold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-purple-400" />
            Active Vector Store Collections ({docList.length} files)
          </h3>
          <span className="text-xs font-mono text-slate-400">ChromaDB Persistent Index</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Document Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Ingestion API</th>
                <th className="py-3 px-4">Chunks</th>
                <th className="py-3 px-4">Uploaded By</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {docList.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 text-white font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="truncate max-w-xs">{doc.fileName}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{doc.department}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.mode === 'hybrid'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      }`}
                    >
                      {doc.mode.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{doc.chunksCount} chunks</td>
                  <td className="py-3 px-4 text-slate-400">{doc.uploadedBy}</td>
                  <td className="py-3 px-4 text-slate-500">{doc.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
