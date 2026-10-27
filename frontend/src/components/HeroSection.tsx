import React from 'react';
import { Sparkles, Bot, UploadCloud, ShieldAlert, ArrowRight, Compass, Moon } from 'lucide-react';

interface HeroSectionProps {
  onAnalyzeClick: () => void;
  onAskClick: () => void;
  documentsCount: number;
  conflictsCount: number;
  isAnalyzing: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyzeClick,
  onAskClick,
  documentsCount,
  conflictsCount,
  isAnalyzing,
}) => {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#7C3AED]/25 bg-gradient-to-b from-[#141422]/90 to-[#0F0F18]/90 p-6 md:p-8 shadow-2xl shadow-[#7C3AED]/5 hero-glow">
      {/* Decorative Moon & Spectral Orb in Background */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gradient-to-br from-[#7C3AED]/15 via-[#FF7518]/10 to-transparent blur-2xl pointer-events-none" />
      
      {/* Subtle CSS Floating Particles */}
      <div className="spectral-particle top-6 left-12 w-2 h-2 bg-[#A78BFA] blur-[1px]" />
      <div className="spectral-particle top-20 right-28 w-2.5 h-2.5 bg-[#FF7518] blur-[1px]" style={{ animationDelay: '3s' }} />
      <div className="spectral-particle bottom-8 left-1/3 w-1.5 h-1.5 bg-[#6EE7B7] blur-[1px]" style={{ animationDelay: '6s' }} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          {/* Eyebrow */}
          <div className="inline-flex items-center space-x-2 rounded-full border border-[#7C3AED]/35 bg-[#7C3AED]/15 px-3 py-1 text-[11px] font-display font-semibold text-[#A78BFA] shadow-sm select-none">
            <span className="text-[#FF7518]">✦</span>
            <span className="tracking-wider uppercase">CAMPUS INTELLIGENCE SYSTEM</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#F4F0FA] leading-tight">
            Your campus. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7518] via-[#FFB347] to-[#A78BFA]">Under control.</span>
          </h1>

          {/* Supporting text */}
          <p className="font-sans text-xs sm:text-sm text-[#9693A7] leading-relaxed max-w-xl">
            Uncover deadlines, detect schedule collisions, and turn scattered campus information into your next move—powered by local on-device Gemma 4.
          </p>

          {/* Call to Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onAnalyzeClick}
              disabled={isAnalyzing}
              className="btn-pumpkin-glow flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-display font-bold text-white transition active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Synthesizing Campus Data...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="h-4 w-4" />
                  <span>Analyze Campus Data</span>
                </>
              )}
            </button>

            <button
              onClick={onAskClick}
              className="btn-haunted-outline flex items-center space-x-2 rounded-xl px-4 py-2.5 text-xs font-display font-semibold text-[#F4F0FA] transition active:scale-95"
            >
              <Bot className="h-4 w-4 text-[#A78BFA]" />
              <span>Ask the Oracle</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#9693A7]" />
            </button>
          </div>
        </div>

        {/* Supernatural AI Core Badge / Quick Highlights */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-3">
          <div className="rounded-xl border border-[#7C3AED]/20 bg-[#161624]/90 p-3.5 flex items-center space-x-3.5 shadow-lg min-w-[210px]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C3AED]/30 to-[#FF7518]/20 border border-[#7C3AED]/40 text-[#A78BFA]">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-[#9693A7] block">
                Verification Engine
              </span>
              <span className="text-xs font-display font-bold text-[#F4F0FA]">
                100% Verbatim Grounded
              </span>
            </div>
          </div>

          {conflictsCount > 0 ? (
            <div className="rounded-xl border border-[#F87171]/35 bg-[#1F1218]/90 p-3.5 flex items-center space-x-3.5 shadow-lg min-w-[210px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F87171]/20 border border-[#F87171]/40 text-[#F87171]">
                <ShieldAlert className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-[#F87171]/90 block">
                  Active Collisions
                </span>
                <span className="text-xs font-display font-bold text-white">
                  {conflictsCount} Schedule Overlap{conflictsCount === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-[#6EE7B7]/25 bg-[#101D1A]/90 p-3.5 flex items-center space-x-3.5 shadow-lg min-w-[210px]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6EE7B7]/20 border border-[#6EE7B7]/40 text-[#6EE7B7]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-display font-semibold uppercase tracking-wider text-[#6EE7B7]/90 block">
                  Schedule Harmony
                </span>
                <span className="text-xs font-display font-bold text-white">
                  No Overlaps Detected
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
