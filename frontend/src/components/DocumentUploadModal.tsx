import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles, FolderArchive, Play } from 'lucide-react';
import { api } from '../services/api';
import { DocumentRecord } from '../types';
import { CutePumpkinIcon } from './CuteHalloweenIllustrations';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (docs: DocumentRecord[]) => void;
  onAnalyzeTriggered: () => Promise<void>;
  onLoadDemoData?: () => Promise<void>;
  isGemmaConfigured: boolean;
  isDemoLoading?: boolean;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onUploaded,
  onAnalyzeTriggered,
  onLoadDemoData,
  isGemmaConfigured,
  isDemoLoading = false,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [statusStep, setStatusStep] = useState<string | null>(null);
  const [autoAnalyze, setAutoAnalyze] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.name.endsWith('.pdf') || f.name.endsWith('.txt')
      );
      if (droppedFiles.length > 0) {
        setFiles((prev) => [...prev, ...droppedFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    setStatusStep('Uploading your file...');

    try {
      setTimeout(() => setStatusStep('Reading your document...'), 400);
      const uploadedDocs = await api.uploadDocuments(files);
      onUploaded(uploadedDocs);

      if (autoAnalyze && isGemmaConfigured) {
        setStatusStep('Finding important dates with Gemma 4...');
        await onAnalyzeTriggered();
      }

      setStatusStep('Your document is ready!');
      setTimeout(() => {
        setFiles([]);
        setStatusStep(null);
        onClose();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
      setStatusStep(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#282433]/30 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-[#F0EAF3] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F0EAF3]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-[#FFF0E5] text-[#FF8A3D] flex items-center justify-center border border-[#FFE2CD]">
              <CutePumpkinIcon size={22} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#282433]">
                Add your campus documents
              </h3>
              <p className="text-xs font-sans text-[#777382]">
                Upload a timetable, notice, or assignment PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#777382] hover:bg-[#FFF9F2] hover:text-[#282433] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="mt-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            multiple
            accept=".pdf,.txt"
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition ${
              isDragActive
                ? 'border-[#FF8A3D] bg-[#FFF0E5]'
                : 'border-[#FFE2CD] bg-[#FFF9F2] hover:border-[#FF8A3D]'
            }`}
          >
            <div className="h-12 w-12 rounded-2xl bg-white text-[#FF8A3D] flex items-center justify-center shadow-sm mb-3 border border-[#FFE2CD]">
              <Upload className="h-6 w-6" />
            </div>
            <p className="font-heading font-bold text-base text-[#282433]">
              Drop your files here
            </p>
            <p className="text-xs font-sans text-[#777382] mt-1">
              or click to browse from your computer
            </p>
            <span className="mt-3 inline-block rounded-full bg-white border border-[#F0EAF3] px-3 py-1 text-[11px] font-sans text-[#777382]">
              Supports PDF and TXT files up to 25 MB
            </span>
          </div>
        </div>

        {/* Staged Files Preview */}
        {files.length > 0 && (
          <div className="mt-4 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <span className="text-[10px] font-heading font-semibold text-[#777382] uppercase tracking-wider block">
              Ready to upload ({files.length}):
            </span>
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl bg-[#FFF9F2] border border-[#F0EAF3] px-3.5 py-2 text-xs font-sans text-[#282433]"
              >
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="h-4 w-4 text-[#7C5CE7] shrink-0" />
                  <span className="truncate font-medium">{file.name}</span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#777382]">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-[#777382] hover:text-[#D94C4C] p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Auto Analyze Checkbox */}
        <div className="mt-4 flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoAnalyze"
            checked={autoAnalyze}
            onChange={(e) => setAutoAnalyze(e.target.checked)}
            className="rounded border-[#F0EAF3] text-[#FF8A3D] focus:ring-[#FF8A3D]"
          />
          <label htmlFor="autoAnalyze" className="text-xs font-sans text-[#282433] cursor-pointer flex items-center space-x-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#FF8A3D]" />
            <span>Automatically find dates and deadlines with local Gemma 4</span>
          </label>
        </div>

        {/* Status indicator during upload */}
        {statusStep && (
          <div className="mt-3 rounded-xl bg-[#FFF0E5] border border-[#FFE2CD] p-3 text-xs font-heading font-semibold text-[#FF8A3D] flex items-center space-x-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#FF8A3D] border-t-transparent" />
            <span>{statusStep}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-3 rounded-xl bg-[#FFF0E5] border border-[#FFE2CD] p-3 text-xs font-sans text-[#D94C4C] flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-[#F0EAF3] flex items-center justify-between">
          {onLoadDemoData && (
            <button
              type="button"
              onClick={onLoadDemoData}
              disabled={isDemoLoading}
              className="text-xs font-heading font-semibold text-[#FF8A3D] hover:underline flex items-center space-x-1"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Load 3 sample documents</span>
            </button>
          )}

          <div className="flex items-center space-x-2.5 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-heading font-medium text-[#777382] hover:text-[#282433]"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
              className="btn-friendly-pumpkin text-xs px-5 py-2 disabled:opacity-50"
            >
              {uploading ? 'Processing...' : 'Upload Files'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
