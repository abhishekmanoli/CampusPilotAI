import React from 'react';
import { X, FileText, Quote, ShieldCheck, Bookmark } from 'lucide-react';
import { SourceEvidence } from '../types';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  evidence: SourceEvidence[];
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  title,
  evidence,
}) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-[#282433]/30 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white border-l border-[#F0EAF3] p-6 sm:p-8 flex flex-col justify-between shadow-2xl h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#F0EAF3]">
            <div className="pr-4">
              <div className="flex items-center space-x-1.5 text-xs font-heading font-bold text-[#FF8A3D] uppercase tracking-wider mb-1">
                <Bookmark className="h-3.5 w-3.5" />
                <span>Verified Document Evidence</span>
              </div>
              <h3 className="text-base font-heading font-bold text-[#282433] leading-snug">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-[#777382] hover:bg-[#FFF9F2] hover:text-[#282433] transition"
              title="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Evidence List */}
          <div className="mt-6 space-y-4">
            {evidence.length === 0 ? (
              <div className="friendly-card p-6 text-center bg-[#FFF9F2]">
                <p className="text-xs font-sans text-[#777382]">
                  No direct quotation recorded for this item.
                </p>
              </div>
            ) : (
              evidence.map((ev, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-[#F0EAF3] bg-[#FFF9F2] p-4 space-y-3"
                >
                  {/* Document & Page Citation Badge */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-[#282433] font-medium truncate">
                      <FileText className="h-4 w-4 text-[#7C5CE7] shrink-0" />
                      <span className="truncate font-sans font-semibold" title={ev.document_name}>
                        {ev.document_name}
                      </span>
                    </div>
                    <span className="rounded-lg bg-white border border-[#F0EAF3] px-2.5 py-0.5 text-[10px] font-mono text-[#FF8A3D] shrink-0 font-bold">
                      Page {ev.page_number}
                    </span>
                  </div>

                  {/* Quoted Text Snippet */}
                  <div className="relative rounded-xl bg-white p-3.5 border border-[#F0EAF3] shadow-sm">
                    <Quote className="h-4 w-4 text-[#FF8A3D] mb-1.5 opacity-80" />
                    <p className="text-xs font-mono text-[#282433] leading-relaxed italic">
                      "{ev.text_snippet}"
                    </p>
                  </div>

                  {/* Grounding Verification Checkmark */}
                  <div className="flex items-center space-x-1.5 text-[11px] text-[#227B49] font-sans">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="font-semibold">PyMuPDF Extract • Verified from source document</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-[#F0EAF3] text-[11px] font-sans text-[#777382] flex items-center justify-between">
          <span>CampusPilot AI preserves verbatim citations</span>
          <span className="font-mono text-[#7C5CE7]">Gemma 4 MoE</span>
        </div>
      </div>
    </div>
  );
};
