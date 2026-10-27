import React from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { ExtractedEvent, ConflictAlert, SourceEvidence } from '../types';
import { CutePumpkinIcon } from './CuteHalloweenIllustrations';

interface StudentScheduleAndClashesProps {
  events: ExtractedEvent[];
  conflicts: ConflictAlert[];
  onSelectEvidence: (evidence: SourceEvidence[], title: string) => void;
  onOpenUpload: () => void;
}

export const StudentScheduleAndClashes: React.FC<StudentScheduleAndClashesProps> = ({
  events,
  conflicts,
  onSelectEvidence,
  onOpenUpload,
}) => {
  return (
    <div className="space-y-6">
      {/* Schedule Clash Warning Alert (Friendly plain language) */}
      {(() => {
        const timeCollisions = conflicts.filter((c) => c.conflict_type === 'time_overlap');
        if (timeCollisions.length === 0) return null;

        return (
          <div className="rounded-2xl border border-[#FFE2CD] bg-[#FFF9F2] p-5 sm:p-6 shadow-sm">
            <div className="flex items-start space-x-3.5">
              <div className="h-10 w-10 rounded-2xl bg-[#FFF0E5] text-[#D94C4C] flex items-center justify-center shrink-0 border border-[#FFE2CD]">
                <AlertTriangle className="h-5 w-5" />
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-heading font-bold text-base text-[#D94C4C]">
                    Oops! Two things are happening at the same time.
                  </span>
                  <span className="rounded-full bg-[#FFF0E5] px-2.5 py-0.5 text-[10px] font-heading font-bold text-[#FF8A3D]">
                    {timeCollisions.length === 1 ? '1 Collision Detected' : `${timeCollisions.length} Collisions Detected`}
                  </span>
                </div>

                {timeCollisions.map((c) => (
                  <div key={c.id} className="space-y-1.5 pt-1">
                    <p className="text-sm font-sans text-[#282433] leading-relaxed">
                      {c.description}
                    </p>
                    {c.suggested_resolution && (
                      <div className="rounded-xl bg-white border border-[#F0EAF3] p-3 text-xs font-sans text-[#777382]">
                        <strong className="text-[#FF8A3D] font-heading block mb-0.5">
                          Suggested next step:
                        </strong>
                        {c.suggested_resolution}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Events List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-heading font-bold text-lg text-[#282433]">
            Upcoming Classes & Events ({events.length})
          </h3>
          <span className="text-xs font-sans text-[#777382]">Sorted by date</span>
        </div>

        {events.length === 0 ? (
          <div className="friendly-card p-10 text-center bg-white">
            <CutePumpkinIcon size={36} className="mx-auto mb-2 opacity-70" />
            <h4 className="font-heading font-bold text-base text-[#282433]">
              No upcoming events yet
            </h4>
            <p className="text-xs font-sans text-[#777382] mt-1 max-w-sm mx-auto">
              Add your timetable or click "Try Sample Campus Data" in the top bar to populate your schedule.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((ev) => {
              const isClashing = conflicts.some((c) => c.event_ids.includes(ev.id));

              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvidence(ev.evidence, ev.title)}
                  className={`friendly-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[#FF8A3D] transition ${
                    isClashing ? 'border-[#FFE2CD] bg-[#FFFDFB]' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3.5 min-w-0">
                    <div
                      className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 text-sm font-heading font-bold ${
                        isClashing
                          ? 'bg-[#FFF0E5] text-[#D94C4C] border border-[#FFE2CD]'
                          : 'bg-[#EDE7FF] text-[#7C5CE7] border border-[#DDD4F8]'
                      }`}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="rounded-lg bg-[#FFF9F2] border border-[#F0EAF3] px-2 py-0.5 text-[10px] font-heading font-semibold text-[#777382] uppercase">
                          {ev.category}
                        </span>

                        {isClashing && (
                          <span className="rounded-lg bg-[#FFF0E5] border border-[#FFE2CD] px-2 py-0.5 text-[10px] font-heading font-bold text-[#D94C4C]">
                            Clash Detected
                          </span>
                        )}
                      </div>

                      <h4 className="font-heading font-bold text-base text-[#282433]">
                        {ev.title}
                      </h4>

                      <p className="text-xs font-sans text-[#777382] mt-0.5 leading-relaxed">
                        {ev.description || 'Class or campus commitment'}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#777382]">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-[#FF8A3D]" />
                          <span className="font-sans font-medium text-[#282433]">{ev.date}</span>
                        </div>

                        {ev.start_time && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3.5 w-3.5 text-[#7C5CE7]" />
                            <span className="font-sans font-medium text-[#282433]">
                              {ev.start_time} {ev.end_time ? `– ${ev.end_time}` : ''}
                            </span>
                          </div>
                        )}

                        {ev.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3.5 w-3.5 text-[#38A169]" />
                            <span className="font-sans">{ev.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-xs font-heading font-semibold text-[#7C5CE7] hover:text-[#FF8A3D] shrink-0 self-end sm:self-center">
                    <span>View Evidence ({ev.evidence.length})</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
