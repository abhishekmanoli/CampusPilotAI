import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  Quote, 
  AlertCircle,
  CheckCircle2,
  Bookmark,
  RefreshCw,
  Flame
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import { AskQuestionResponse, SourceEvidence } from '../types';

interface AssistantPanelProps {
  onSelectEvidence?: (evidence: SourceEvidence[], title: string) => void;
  isOllamaConnected?: boolean;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ 
  onSelectEvidence,
  isOllamaConnected = true
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskQuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedPrompts = [
    "What deadlines are approaching?",
    "Which events overlap?",
    "Build my study plan.",
    "Show the source for this deadline."
  ];

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    setLoading(true);
    setError(null);

    try {
      const res = await api.askQuestion(q);
      setResult(res);
      setQuestion('');
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(err.message || 'Failed to commune with the Campus Oracle.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner with Spectral Orb Avatar */}
      <div className="gothic-card p-6 relative overflow-hidden">
        {/* Ambient atmospheric aura */}
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-[#7C3AED]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* Spectral Orb Avatar */}
            <div className="oracle-orb shrink-0 flex items-center justify-center">
              <span className="text-[#FFB347] font-creepster text-sm select-none">✦</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display text-lg font-extrabold text-[#F4F0FA] tracking-wide">
                  THE CAMPUS ORACLE
                </h3>
                <span className="rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 px-2 py-0.5 text-[10px] font-mono text-[#A78BFA]">
                  Local Gemma 4
                </span>
              </div>
              <p className="text-xs font-sans text-[#9693A7] mt-0.5">
                Powered by local Gemma 4 MoE. Answers grounded exclusively in your uploaded source evidence.
              </p>
            </div>
          </div>

          {/* Connection status tag */}
          <div className="flex items-center space-x-2 rounded-xl bg-[#09090D] border border-white/10 px-3 py-1.5 shrink-0 self-start sm:self-center">
            <span className="relative flex h-2 w-2">
              {isOllamaConnected && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6EE7B7] opacity-75" />
              )}
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isOllamaConnected ? 'bg-[#6EE7B7]' : 'bg-[#F87171]'
                }`}
              />
            </span>
            <span className="font-mono text-[11px] text-[#F4F0FA]">
              {isOllamaConnected ? 'Oracle Online' : 'Oracle Offline'}
            </span>
          </div>
        </div>

        {/* Suggested Prompts Section */}
        <div className="mt-5 pt-4 border-t border-[#7C3AED]/15">
          <p className="text-[10px] font-display font-semibold text-[#9693A7] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
            <Flame className="h-3 w-3 text-[#FF7518]" />
            <span>Suggested Invocations:</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((promptText, i) => (
              <button
                key={i}
                onClick={() => handleAsk(promptText)}
                disabled={loading}
                className="rounded-xl border border-[#7C3AED]/25 bg-[#09090D]/70 px-3 py-1.5 text-xs font-display text-[#F4F0FA] hover:border-[#FF7518]/60 hover:bg-[#1A1A28] hover:text-[#FFB347] transition-all text-left active:scale-95 disabled:opacity-50"
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Field with Send Button */}
      <div className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()}
          placeholder="Consult the Oracle about dates, lab policies, prerequisites, or deadlines..."
          className="w-full rounded-2xl border border-[#7C3AED]/30 bg-[#12121A]/90 py-4 pl-5 pr-14 text-sm font-sans text-[#F4F0FA] placeholder-[#9693A7]/60 shadow-inner focus:border-[#FF7518] focus:outline-none focus:ring-1 focus:ring-[#FF7518]"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#FF7518] to-[#EA580C] text-white shadow-md shadow-[#FF7518]/30 hover:brightness-110 active:scale-95 disabled:opacity-40 transition"
          title="Send query to Gemma 4"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="gothic-card-crimson rounded-xl p-4 text-xs text-[#F87171] flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Answer Output View */}
      {result && (
        <div className="gothic-card p-6 space-y-5 shadow-2xl">
          {/* Main Answer Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#7C3AED]/20">
            <span className="flex items-center space-x-2 text-xs font-display font-bold text-[#A78BFA] uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-[#FF7518]" />
              <span>Grounded Oracle Guidance</span>
            </span>
            <span className="rounded-lg bg-[#09090D] border border-white/5 px-2.5 py-1 text-[10px] font-mono text-[#9693A7]">
              Engine: {result.model_used}
            </span>
          </div>

          {/* Answer Body */}
          <p className="text-sm font-sans text-[#F4F0FA] leading-relaxed whitespace-pre-line">
            {result.answer}
          </p>

          {/* Tri-Fold Clarity Distinction */}
          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            {/* 1. Confirmed Facts (Spectral Green) */}
            <div className="rounded-xl bg-[#101D1A]/80 border border-[#6EE7B7]/25 p-3.5">
              <div className="flex items-center space-x-1.5 text-xs font-display font-bold text-[#6EE7B7] mb-2">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Confirmed Facts</span>
              </div>
              {result.confirmed_facts.length === 0 ? (
                <p className="text-[11px] font-sans text-[#9693A7]">None explicitly recorded.</p>
              ) : (
                <ul className="space-y-1.5 text-[11px] font-sans text-[#F4F0FA]/90">
                  {result.confirmed_facts.map((fact, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#6EE7B7] font-bold">•</span>
                      <span>{fact}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 2. Inferred Suggestions (Electric Violet) */}
            <div className="rounded-xl bg-[#161226]/80 border border-[#7C3AED]/35 p-3.5">
              <div className="flex items-center space-x-1.5 text-xs font-display font-bold text-[#A78BFA] mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Inferred Suggestions</span>
              </div>
              {result.inferred_suggestions.length === 0 ? (
                <p className="text-[11px] font-sans text-[#9693A7]">No suggestions inferred.</p>
              ) : (
                <ul className="space-y-1.5 text-[11px] font-sans text-[#F4F0FA]/90">
                  {result.inferred_suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#A78BFA] font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 3. Unresolved Ambiguities (Ember Gold) */}
            <div className="rounded-xl bg-[#1F1912]/80 border border-[#FFB347]/30 p-3.5">
              <div className="flex items-center space-x-1.5 text-xs font-display font-bold text-[#FFB347] mb-2">
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Unresolved Ambiguities</span>
              </div>
              {result.unresolved_ambiguities.length === 0 ? (
                <p className="text-[11px] font-sans text-[#9693A7]">None flagged.</p>
              ) : (
                <ul className="space-y-1.5 text-[11px] font-sans text-[#F4F0FA]/90">
                  {result.unresolved_ambiguities.map((amb, idx) => (
                    <li key={idx} className="flex items-start space-x-1.5">
                      <span className="text-[#FFB347] font-bold">•</span>
                      <span>{amb}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Source Evidence Citations */}
          {result.evidence.length > 0 && (
            <div className="pt-4 border-t border-[#7C3AED]/20">
              <p className="text-xs font-display font-bold text-[#9693A7] uppercase tracking-wider mb-2.5 flex items-center space-x-1.5">
                <Bookmark className="h-3.5 w-3.5 text-[#A78BFA]" />
                <span>Supporting Source References ({result.evidence.length}):</span>
              </p>
              <div className="space-y-2">
                {result.evidence.map((ev, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectEvidence?.([ev], ev.document_name)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-[#7C3AED]/20 bg-[#09090D]/80 p-3.5 gap-2 hover:border-[#A78BFA]/50 cursor-pointer transition"
                  >
                    <div className="flex items-start space-x-2.5">
                      <Quote className="h-3.5 w-3.5 text-[#FF7518] shrink-0 mt-0.5" />
                      <p className="text-xs font-mono text-[#F4F0FA] italic">
                        "{ev.text_snippet}"
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <span className="text-[11px] font-sans text-[#9693A7]">{ev.document_name}</span>
                      <span className="rounded-md bg-[#1A1A28] border border-white/5 px-2 py-0.5 text-[10px] font-mono text-[#6EE7B7] font-bold">
                        Page {ev.page_number}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
