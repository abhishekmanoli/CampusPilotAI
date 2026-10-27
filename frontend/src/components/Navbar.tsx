import React, { useMemo } from 'react';
import { RotateCcw, Play, Search, User, Sparkles, CheckCircle2 } from 'lucide-react';
import { CutePumpkinIcon } from './CuteHalloweenIllustrations';
import { HealthResponse } from '../types';

interface NavbarProps {
  health: HealthResponse | null;
  currentSectionTitle: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenOllamaModal: () => void;
  onOpenProfileModal: () => void;
  onLoadDemoData: () => Promise<void>;
  onResetData: () => Promise<void>;
  isDemoLoading: boolean;
  studentName?: string;
  isDemoActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  currentSectionTitle,
  searchQuery,
  onSearchChange,
  onOpenOllamaModal,
  onOpenProfileModal,
  onLoadDemoData,
  onResetData,
  isDemoLoading,
  studentName = 'Alex',
  isDemoActive = false,
}) => {
  const isReachable = health?.ollama_reachable ?? false;
  const modelName = health?.ollama_model || 'gemma4:e4b';

  const dateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#F0EAF3] bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-6 gap-4">
        {/* Left: Section Title or Greeting */}
        <div className="flex items-center space-x-3 shrink-0">
          <div>
            <h2 className="text-base font-heading font-bold text-[#282433] leading-none">
              {currentSectionTitle}
            </h2>
            <span className="text-[11px] font-sans text-[#777382] mt-0.5 block">
              {dateFormatted}
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777382]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search your classes, assignments, or events..."
              className="w-full rounded-2xl border border-[#F0EAF3] bg-[#FFF9F2] py-2 pl-10 pr-4 text-xs font-sans text-[#282433] placeholder-[#777382]/60 focus:border-[#FF8A3D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#777382] hover:text-[#282433]"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Demo Button, Ollama Status, and Profile Avatar */}
        <div className="flex items-center space-x-3 shrink-0">
          {/* Demo Data Indicator */}
          {isDemoActive && (
            <span className="hidden sm:inline-flex items-center space-x-1 rounded-full bg-[#FFF0E5] border border-[#FFE2CD] px-2.5 py-1 text-[11px] font-heading font-bold text-[#FF8A3D]">
              <span>🎃 DEMO DATA</span>
            </span>
          )}

          {/* 1-Click Load Demo Data Button */}
          <button
            onClick={onLoadDemoData}
            disabled={isDemoLoading}
            className="btn-friendly-pumpkin flex items-center space-x-1.5 text-xs py-2 px-3.5"
            title="Load 3 sample campus documents with an intentional 30-minute conflict"
          >
            {isDemoLoading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span className="hidden sm:inline">Try Sample Campus Data</span>
            <span className="sm:hidden">Sample Data</span>
          </button>

          {/* Ollama Status Pill */}
          <button
            onClick={onOpenOllamaModal}
            className={`flex items-center space-x-2 rounded-xl border px-3 py-1.5 text-xs font-heading font-semibold transition ${
              isReachable
                ? 'border-[#BDEECF] bg-[#DDF7E8] text-[#227B49]'
                : 'border-[#F8D7DA] bg-[#FFF0E5] text-[#D94C4C]'
            }`}
            title="Inspect local Ollama Gemma 4 status"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isReachable ? 'bg-[#28A745] animate-pulse' : 'bg-[#D94C4C]'
              }`}
            />
            <span className="hidden lg:inline">AI Helper:</span>
            <span className="font-mono text-[10px]">{isReachable ? modelName : 'Offline'}</span>
          </button>

          {/* Reset / Clear Data */}
          <button
            onClick={onResetData}
            className="p-2 rounded-xl border border-[#F0EAF3] bg-white text-[#777382] hover:text-[#D94C4C] hover:bg-[#FFF0E5] transition"
            title="Clear demo data"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          {/* Profile Avatar Button */}
          <button
            onClick={onOpenProfileModal}
            className="h-9 w-9 rounded-xl bg-[#EDE7FF] border border-[#DDD4F8] flex items-center justify-center font-heading font-bold text-xs text-[#7C5CE7] hover:scale-105 transition"
            title="View Student Profile"
          >
            {studentName ? studentName.slice(0, 2).toUpperCase() : 'AM'}
          </button>
        </div>
      </div>
    </header>
  );
};
