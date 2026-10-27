import React, { useState } from 'react';
import { Send, Bot, Sparkles, CheckCircle2, Bookmark, Quote, AlertCircle, HelpCircle } from 'lucide-react';
import { CuteGhostWithPumpkin, CutePumpkinIcon } from './CuteHalloweenIllustrations';
import { api, ApiError } from '../services/api';
import { AskQuestionResponse, SourceEvidence } from '../types';

interface StudentAiHelperProps {
  onSelectEvidence?: (evidence: SourceEvidence[], title: string) => void;
  isOllamaConnected?: boolean;
}

export const StudentAiHelper: React.FC<StudentAiHelperProps> = ({
  onSelectEvidence,
  isOllamaConnected = true,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskQuestionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const suggestedQuestions = [
    "What should I finish today?",
    "What events are coming up?",
    "Do I have any schedule clashes?",
    "Help me plan my study time.",
    "Where did this deadline come from?",
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
        setError(err.message || 'Sorry, your campus helper is having trouble connecting to local Gemma 4.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Friendly Header Card */}
      <div className="friendly-card p-6 bg-white border border-[#F0EAF3] relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-2 z-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-[#282433]">
              Ask your campus helper 👻
            </h3>
            <span className="rounded-full bg-[#DDF7E8] text-[#227B49] text-[10px] font-mono px-2 py-0.5 font-bold">
              Local Gemma 4
            </span>
          </div>
          <p className="font-sans text-sm text-[#777382]">
            Not sure what to do next? Just ask! Answers are backed by your uploaded documents.
          </p>

          {/* Suggested question chips */}
          <div className="pt-2">
            <span className="text-[11px] font-heading font-semibold text-[#777382] uppercase tracking-wider block mb-2">
              Try asking:
            </span>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(q)}
                  disabled={loading}
                  className="rounded-xl bg-[#FFF9F2] border border-[#FFE2CD] px-3 py-1.5 text-xs font-heading font-semibold text-[#FF8A3D] hover:bg-[#FFF0E5] transition text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mascot */}
        <div className="shrink-0 z-10">
          <CuteGhostWithPumpkin size={110} />
        </div>
      </div>

      {/* Input box */}
      <div className="relative">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAsk()}
          placeholder="Ask a question about your classes, quiz dates, or assignments..."
          className="w-full rounded-2xl border border-[#F0EAF3] bg-white py-3.5 pl-5 pr-14 text-sm font-sans text-[#282433] placeholder-[#777382]/50 shadow-sm focus:border-[#FF8A3D] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/20 transition"
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading || !question.trim()}
          className="absolute right-2.5 top-2.5 h-9 w-9 rounded-xl btn-friendly-pumpkin flex items-center justify-center p-0 disabled:opacity-40"
          title="Ask question"
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
        <div className="rounded-2xl bg-[#FFF0E5] border border-[#FFE2CD] p-4 text-xs font-sans text-[#D94C4C] flex items-start space-x-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Answer Card */}
      {result && (
        <div className="friendly-card p-6 bg-white border border-[#F0EAF3] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F0EAF3]">
            <div className="flex items-center space-x-2">
              <span className="text-lg">👻</span>
              <h4 className="font-heading font-bold text-base text-[#282433]">
                Helper's Answer
              </h4>
            </div>
            <span className="text-[10px] font-mono text-[#777382] bg-[#FFF9F2] px-2 py-0.5 rounded-lg border border-[#F0EAF3]">
              Gemma 4 • On-Device
            </span>
          </div>

          <p className="font-sans text-sm text-[#282433] leading-relaxed whitespace-pre-line">
            {result.answer}
          </p>

          {/* Tri-Fold Clarity Breakdown (Soft Minimalist Pills) */}
          <div className="grid sm:grid-cols-3 gap-3 pt-2">
            {/* Confirmed Facts */}
            <div className="rounded-xl bg-[#DDF7E8]/60 border border-[#BDEECF] p-3">
              <span className="text-xs font-heading font-bold text-[#227B49] block mb-1">
                ✓ Confirmed Facts
              </span>
              {result.confirmed_facts.length === 0 ? (
                <p className="text-[11px] font-sans text-[#777382]">None noted explicitly.</p>
              ) : (
                <ul className="text-[11px] font-sans text-[#282433] space-y-1">
                  {result.confirmed_facts.map((f, i) => (
                    <li key={i}>• {f}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Inferred Suggestions */}
            <div className="rounded-xl bg-[#EDE7FF]/60 border border-[#DDD4F8] p-3">
              <span className="text-xs font-heading font-bold text-[#7C5CE7] block mb-1">
                ✦ Helpful Suggestions
              </span>
              {result.inferred_suggestions.length === 0 ? (
                <p className="text-[11px] font-sans text-[#777382]">No extra suggestions.</p>
              ) : (
                <ul className="text-[11px] font-sans text-[#282433] space-y-1">
                  {result.inferred_suggestions.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Unresolved Ambiguities */}
            <div className="rounded-xl bg-[#FFF4C2]/60 border border-[#FFE8A3] p-3">
              <span className="text-xs font-heading font-bold text-[#8C620D] block mb-1">
                ? Things to Check
              </span>
              {result.unresolved_ambiguities.length === 0 ? (
                <p className="text-[11px] font-sans text-[#777382]">Nothing unclear!</p>
              ) : (
                <ul className="text-[11px] font-sans text-[#282433] space-y-1">
                  {result.unresolved_ambiguities.map((a, i) => (
                    <li key={i}>• {a}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Source Evidence Citations */}
          {result.evidence.length > 0 && (
            <div className="pt-4 border-t border-[#F0EAF3]">
              <span className="text-xs font-heading font-bold text-[#777382] uppercase tracking-wider block mb-2">
                Source Document References ({result.evidence.length}):
              </span>
              <div className="space-y-2">
                {result.evidence.map((ev, i) => (
                  <div
                    key={i}
                    onClick={() => onSelectEvidence?.([ev], ev.document_name)}
                    className="p-3 rounded-xl bg-[#FFF9F2] border border-[#F0EAF3] text-xs font-sans text-[#282433] hover:border-[#FF8A3D] cursor-pointer transition flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start space-x-2">
                      <Quote className="h-3.5 w-3.5 text-[#FF8A3D] shrink-0 mt-0.5" />
                      <span className="italic">"{ev.text_snippet}"</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#7C5CE7] shrink-0 bg-white px-2 py-0.5 rounded-lg border border-[#F0EAF3]">
                      Page {ev.page_number}
                    </span>
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
