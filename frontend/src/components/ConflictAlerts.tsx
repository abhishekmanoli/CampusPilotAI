import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  ShieldAlert,
  ArrowRight,
  Flame,
  FileText,
  Sparkles
} from 'lucide-react';
import { ConflictAlert, SourceEvidence } from '../types';

interface ConflictAlertsProps {
  conflicts: ConflictAlert[];
  onSelectEvidence?: (evidence: SourceEvidence[], title: string) => void;
}

export const ConflictAlerts: React.FC<ConflictAlertsProps> = ({
  conflicts,
  onSelectEvidence,
}) => {
  if (conflicts.length === 0) {
    return (
      <div className="gothic-card p-8 text-center border-[#6EE7B7]/25">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#6EE7B7]/15 text-[#6EE7B7] border border-[#6EE7B7]/30 mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-display font-bold text-[#F4F0FA]">
          No Schedule Collisions Detected
        </h3>
        <p className="text-xs font-sans text-[#9693A7] mt-1 max-w-md mx-auto">
          All your uploaded commitments have disjoint time windows and manageable deadlines.
        </p>
      </div>
    );
  }

  const critical = conflicts.filter((c) => c.severity === 'critical');
  const warnings = conflicts.filter((c) => c.severity === 'warning');

  return (
    <div className="space-y-4">
      {/* Top Banner Alert if Critical */}
      {critical.length > 0 && (
        <div className="rounded-xl border border-[#F87171]/40 bg-[#1F1218]/90 p-4 shadow-lg shadow-[#F87171]/10">
          <div className="flex items-start space-x-3.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/30">
              <ShieldAlert className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-display font-bold text-[#F87171]">
                Action Required: {critical.length} Critical Collision{critical.length > 1 ? 's' : ''} Identified
              </h4>
              <p className="text-xs font-sans text-[#F4F0FA]/80 mt-0.5 leading-relaxed">
                Deterministic mathematical checks found overlapping hours or deadline clashes between mandatory academic commitments and extracurricular activities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conflict Cards Grid */}
      <div className="grid gap-3.5">
        {conflicts.map((conflict) => {
          const isCritical = conflict.severity === 'critical';
          const isWarning = conflict.severity === 'warning';

          return (
            <div
              key={conflict.id}
              className={`rounded-xl border p-4 transition-all ${
                isCritical
                  ? 'gothic-card-crimson'
                  : isWarning
                  ? 'gothic-card-ember'
                  : 'gothic-card'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-3.5 min-w-0">
                  {/* Icon badge */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                      isCritical
                        ? 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/35'
                        : isWarning
                        ? 'bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/35'
                        : 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/35'
                    }`}
                  >
                    {isCritical ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : isWarning ? (
                      <Clock className="h-4 w-4" />
                    ) : (
                      <HelpCircle className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {/* Severity pill */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider ${
                          isCritical
                            ? 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/40'
                            : isWarning
                            ? 'bg-[#FFB347]/20 text-[#FFB347] border border-[#FFB347]/40'
                            : 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/40'
                        }`}
                      >
                        {conflict.severity}
                      </span>

                      {/* Conflict Type */}
                      <span className="text-[11px] font-mono text-[#9693A7]">
                        {conflict.conflict_type.replace('_', ' ')}
                      </span>

                      {/* Deterministic tag */}
                      {conflict.is_deterministic && (
                        <span className="rounded bg-[#7C3AED]/15 border border-[#7C3AED]/30 px-1.5 py-0.5 text-[10px] font-mono text-[#A78BFA]">
                          Deterministic Collision Check
                        </span>
                      )}
                    </div>

                    {/* Conflict Title */}
                    <h4 className="text-sm font-display font-bold text-[#F4F0FA]">
                      {conflict.title}
                    </h4>

                    {/* Conflict Description */}
                    <p className="text-xs font-sans text-[#F4F0FA]/85 mt-1 leading-relaxed">
                      {conflict.description}
                    </p>

                    {/* Conflicting Events Involved */}
                    {conflict.event_titles && conflict.event_titles.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-display font-semibold uppercase text-[#9693A7]">
                          Colliding Events:
                        </span>
                        {conflict.event_titles.map((title, idx) => (
                          <span
                            key={idx}
                            className="rounded-lg bg-[#14141F] border border-white/10 px-2 py-0.5 text-[11px] font-sans text-[#F4F0FA]"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Time Window if available */}
                    {conflict.time_window && (
                      <div className="mt-2 flex items-center space-x-1.5 text-xs text-[#9693A7]">
                        <Clock className="h-3.5 w-3.5 text-[#FF7518]" />
                        <span className="font-mono text-[#FFB347]">{conflict.time_window}</span>
                      </div>
                    )}

                    {/* Actionable Resolution Suggestion */}
                    <div className="mt-3 rounded-xl bg-[#09090D]/90 border border-[#7C3AED]/25 p-3 shadow-inner">
                      <div className="flex items-center space-x-1.5 text-xs font-display font-bold text-[#6EE7B7] mb-1">
                        <ArrowRight className="h-3.5 w-3.5" />
                        <span>Recommended Resolution:</span>
                      </div>
                      <p className="text-xs font-sans text-[#F4F0FA]/90 leading-relaxed">
                        {conflict.suggested_resolution}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
