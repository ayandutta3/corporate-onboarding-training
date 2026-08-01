import React from 'react';
import { X, ExternalLink, Download } from 'lucide-react';
import { AuthUser } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  filename: string;
  backendUrl: string;
  user: AuthUser;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  documentId,
  filename,
  backendUrl,
  user
}) => {
  if (!isOpen) return null;

  const previewUrl = `${backendUrl}/documents/${documentId}/preview?token=${user.token}`;
  const downloadUrl = `${backendUrl}/documents/${documentId}/download?token=${user.token}`;
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  const renderContent = () => {
    if (['pdf', 'txt', 'csv'].includes(ext)) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-[70vh] bg-white rounded-xl"
          title="Document Preview"
        />
      );
    } else if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac'].includes(ext)) {
      return (
        <div className="w-full h-64 flex flex-col items-center justify-center bg-black/40 rounded-xl space-y-6">
          <audio controls className="w-full max-w-md">
            <source src={previewUrl} />
            Your browser does not support the audio element.
          </audio>
        </div>
      );
    } else if (['mp4', 'webm', 'avi'].includes(ext)) {
      return (
        <video controls className="w-full max-h-[70vh] bg-black rounded-xl">
          <source src={previewUrl} />
          Your browser does not support the video element.
        </video>
      );
    } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
      return (
        <div className="flex justify-center items-center h-[70vh] bg-black/20 rounded-xl">
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
      );
    } else {
      return (
        <div className="w-full h-[50vh] flex flex-col items-center justify-center bg-black/40 rounded-xl text-center space-y-4 p-8">
          <ExternalLink className="w-12 h-12 text-slate-500" />
          <div>
            <h3 className="text-white font-bold text-lg mb-2">No In-App Preview Available</h3>
            <p className="text-slate-400 text-sm">
              The file format <strong>.{ext}</strong> (e.g. DOCX, PPTX) cannot be previewed natively in the browser.
            </p>
          </div>
          <a
            href={downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-xl hover:bg-indigo-500/30 transition-colors font-bold text-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download to View
          </a>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-6xl bg-[#0e1117] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white font-mono truncate max-w-xl">
              {filename}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg transition-colors border border-white/10"
              title="Download"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors border border-rose-500/20"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Viewer Content */}
        <div className="p-4 bg-black/20 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
