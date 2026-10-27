import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles,
  HelpCircle,
  ChevronRight,
  AlertTriangle,
  Filter
} from 'lucide-react';
import { ExtractedEvent, ExtractedDeadline, SourceEvidence, RecordStatus } from '../types';

interface TimelineProps {
  events: ExtractedEvent[];
  deadlines: ExtractedDeadline[];
  conflictingEventIds: string[];
  onSelectEvidence: (evidence: SourceEvidence[], title: string) => void;
  filterMode?: 'all' | 'deadlines' | 'events';
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  deadlines,
  conflictingEventIds,
  onSelectEvidence,
  filterMode = 'all',
}) => {
  const [internalFilter, setInternalFilter] = useState<'all' | 'deadlines' | 'events'>(filterMode);

  // Combine events and deadlines into a single timeline sorted by date
  type TimelineItem = {
    id: string;
    title: string;
    date: string;
    time?: string | null;
    endTime?: string | null;
    location?: string | null;
    type: 'event' | 'deadline';
    category: string;
    status: RecordStatus;
    importance?: string;
    evidence: SourceEvidence[];
    eligibility?: string[];
    required_actions?: string[];
    uncertainties?: string[];
    isConflicting: boolean;
  };

  const items: TimelineItem[] = [];

  if (internalFilter === 'all' || internalFilter === 'events') {
    events.forEach((ev) => {
      items.push({
        id: ev.id,
        title: ev.title,
        date: ev.date || '9999-12-31',
        time: ev.start_time,
        endTime: ev.end_time,
        location: ev.location,
        type: 'event',
        category: ev.category,
        status: ev.status,
        evidence: ev.evidence,
        eligibility: ev.eligibility,
        required_actions: ev.required_actions,
        uncertainties: ev.uncertainties,
        isConflicting: conflictingEventIds.includes(ev.id),
      });
    });
  }

  if (internalFilter === 'all' || internalFilter === 'deadlines') {
    deadlines.forEach((dl) => {
      items.push({
        id: dl.id,
        title: dl.title,
        date: dl.due_date,
        time: dl.due_time,
        endTime: null,
        location: null,
        type: 'deadline',
        category: dl.importance || 'deadline',
        importance: dl.importance,
        status: dl.status,
        evidence: dl.evidence,
        eligibility: dl.eligibility,
        required_actions: dl.required_actions,
        uncertainties: dl.uncertainties,
        isConflicting: conflictingEventIds.includes(dl.id),
      });
    });
  }

  items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    const timeA = a.time || '00:00';
    const timeB = b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#7C3AED]/15 pb-3">
        <div className="flex items-center space-x-2">
          <Filter className="h-3.5 w-3.5 text-[#9693A7]" />
          <span className="text-xs font-display text-[#9693A7]">Filter View:</span>
          <div className="flex items-center space-x-1.5 bg-[#14141F] p-1 rounded-lg border border-[#7C3AED]/20">
            <button
              onClick={() => setInternalFilter('all')}
              className={`px-2.5 py-1 text-xs font-display font-medium rounded-md transition-all ${
                internalFilter === 'all'
                  ? 'bg-[#7C3AED]/30 text-[#F4F0FA] shadow-sm'
                  : 'text-[#9693A7] hover:text-[#F4F0FA]'
              }`}
            >
              All ({events.length + deadlines.length})
            </button>
            <button
              onClick={() => setInternalFilter('deadlines')}
              className={`px-2.5 py-1 text-xs font-display font-medium rounded-md transition-all ${
                internalFilter === 'deadlines'
                  ? 'bg-[#FF7518]/25 text-[#FFB347] shadow-sm'
                  : 'text-[#9693A7] hover:text-[#FFB347]'
              }`}
            >
              Deadlines ({deadlines.length})
            </button>
            <button
              onClick={() => setInternalFilter('events')}
              className={`px-2.5 py-1 text-xs font-display font-medium rounded-md transition-all ${
                internalFilter === 'events'
                  ? 'bg-[#7C3AED]/30 text-[#A78BFA] shadow-sm'
                  : 'text-[#9693A7] hover:text-[#A78BFA]'
              }`}
            >
              Events ({events.length})
            </button>
          </div>
        </div>

        <span className="text-[11px] font-mono text-[#9693A7] hidden sm:inline">
          Chronological Order
        </span>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="gothic-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/30 mb-3">
            <Calendar className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-display font-bold text-[#F4F0FA]">
            No Campus Commitments Found
          </h3>
          <p className="text-xs font-sans text-[#9693A7] mt-1 max-w-sm mx-auto">
            Upload course schedules or click "Load Demo Data" to populate your chronological timeline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const isConfirmed = item.status === 'confirmed';
            const isUnresolved = item.status === 'unresolved';
            const isDeadline = item.type === 'deadline';

            // Distinctive Halloween border & background styling
            let cardClasses = 'gothic-card p-4 transition-all cursor-pointer group ';
            if (item.isConflicting) {
              cardClasses += 'gothic-card-crimson border-[#F87171]/40 hover:border-[#F87171]';
            } else if (isDeadline) {
              cardClasses += 'hover:border-[#FF7518]/50 hover:shadow-[#FF7518]/10';
            } else {
              cardClasses += 'hover:border-[#A78BFA]/50 hover:shadow-[#7C3AED]/15';
            }

            return (
              <div
                key={item.id}
                onClick={() => onSelectEvidence(item.evidence, item.title)}
                className={cardClasses}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3.5 min-w-0">
                    {/* Badge Icon */}
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-mono font-bold transition-transform group-hover:scale-105 ${
                        item.isConflicting
                          ? 'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/40'
                          : isDeadline
                          ? 'bg-[#FF7518]/20 text-[#FFB347] border border-[#FF7518]/35'
                          : 'bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/35'
                      }`}
                    >
                      {item.isConflicting ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : isDeadline ? (
                        <Clock className="h-4 w-4" />
                      ) : (
                        <Calendar className="h-4 w-4" />
                      )}
                    </div>

                    {/* Main Details */}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {/* Type pill */}
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider ${
                            isDeadline
                              ? 'bg-[#FF7518]/15 text-[#FFB347] border border-[#FF7518]/30'
                              : 'bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/30'
                          }`}
                        >
                          {isDeadline ? 'DEADLINE' : 'EVENT'}
                        </span>

                        {/* Category */}
                        <span className="rounded bg-[#1A1A28] border border-white/5 px-2 py-0.5 text-[10px] font-display text-[#9693A7] uppercase tracking-wider">
                          {item.category}
                        </span>

                        {/* Status (Tri-Fold Clarity) */}
                        <span
                          className={`inline-flex items-center space-x-1 rounded px-2 py-0.5 text-[10px] font-sans font-medium ${
                            isConfirmed
                              ? 'bg-[#6EE7B7]/10 text-[#6EE7B7] border border-[#6EE7B7]/25'
                              : isUnresolved
                              ? 'bg-[#FFB347]/10 text-[#FFB347] border border-[#FFB347]/25'
                              : 'bg-[#7C3AED]/15 text-[#A78BFA] border border-[#7C3AED]/25'
                          }`}
                        >
                          {isConfirmed ? (
                            <ShieldCheck className="h-3 w-3" />
                          ) : isUnresolved ? (
                            <HelpCircle className="h-3 w-3" />
                          ) : (
                            <Sparkles className="h-3 w-3" />
                          )}
                          <span className="capitalize">{item.status}</span>
                        </span>

                        {/* Collision Badge */}
                        {item.isConflicting && (
                          <span className="rounded bg-[#F87171]/20 px-2 py-0.5 text-[10px] font-display font-bold text-[#F87171] border border-[#F87171]/40 animate-pulse">
                            Schedule Collision
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-sm font-display font-bold text-[#F4F0FA] group-hover:text-[#FFB347] transition-colors leading-snug">
                        {item.title}
                      </h4>

                      {/* Time and Location Info */}
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#9693A7]">
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#A78BFA]" />
                          <span className="font-mono text-[11px] text-[#F4F0FA]">
                            {item.date !== '9999-12-31' ? item.date : 'Date TBA'}
                          </span>
                        </div>

                        {item.time && (
                          <div className="flex items-center space-x-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#FF7518]" />
                            <span className="font-mono text-[11px] text-[#F4F0FA]">
                              {item.time} {item.endTime ? `— ${item.endTime}` : ''}
                            </span>
                          </div>
                        )}

                        {item.location && (
                          <div className="flex items-center space-x-1.5">
                            <MapPin className="h-3.5 w-3.5 text-[#6EE7B7]" />
                            <span className="font-sans text-[11px] text-[#9693A7]">{item.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Required Actions / Eligibility preview if present */}
                      {item.required_actions && item.required_actions.length > 0 && (
                        <div className="mt-2 text-[11px] font-sans text-[#9693A7]/90 flex items-center space-x-1.5">
                          <span className="text-[#FFB347] font-semibold">Action:</span>
                          <span className="truncate">{item.required_actions.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Evidence Reference Button */}
                  <div className="shrink-0 text-right flex flex-col items-end justify-center">
                    <span className="text-[11px] font-display font-medium text-[#A78BFA] group-hover:text-[#FFB347] flex items-center space-x-1 transition-colors">
                      <span>Evidence ({item.evidence.length})</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    {item.evidence[0] && (
                      <span className="text-[10px] font-mono text-[#9693A7]/70 truncate max-w-[130px] mt-1 block">
                        p.{item.evidence[0].page_number} {item.evidence[0].document_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
