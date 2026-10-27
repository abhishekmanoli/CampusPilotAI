import React from 'react';
import { Clock, Calendar, Bookmark, ChevronRight, AlertCircle, FileText } from 'lucide-react';
import { ExtractedDeadline, SourceEvidence } from '../types';
import { CutePumpkinIcon } from './CuteHalloweenIllustrations';

interface StudentDeadlinesProps {
  deadlines: ExtractedDeadline[];
  onSelectEvidence: (evidence: SourceEvidence[], title: string) => void;
}

export const StudentDeadlines: React.FC<StudentDeadlinesProps> = ({
  deadlines,
  onSelectEvidence,
}) => {
  const getRelativeDateLabel = (dueDateStr: string): { label: string; colorClass: string } => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [year, month, day] = dueDateStr.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      dueDate.setHours(0, 0, 0, 0);

      const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return { label: 'Past Due', colorClass: 'bg-[#FFF0E5] text-[#D94C4C] border-[#FFE2CD]' };
      } else if (diffDays === 0) {
        return { label: 'Due Today', colorClass: 'bg-[#FFF0E5] text-[#FF8A3D] border-[#FFE2CD]' };
      } else if (diffDays === 1) {
        return { label: 'Due Tomorrow', colorClass: 'bg-[#FFF4C2] text-[#8C620D] border-[#FFE8A3]' };
      } else if (diffDays <= 7) {
        return { label: `Due in ${diffDays} days`, colorClass: 'bg-[#FFF4C2] text-[#8C620D] border-[#FFE8A3]' };
      } else {
        return { label: `Due in ${diffDays} days`, colorClass: 'bg-[#DDF7E8] text-[#227B49] border-[#BDEECF]' };
      }
    } catch {
      return { label: 'Upcoming', colorClass: 'bg-[#EDE7FF] text-[#7C5CE7] border-[#DDD4F8]' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading font-bold text-lg text-[#282433]">
            Things to Finish Soon ({deadlines.length})
          </h3>
          <p className="text-xs font-sans text-[#777382]">
            Approaching deadlines extracted from your course notices
          </p>
        </div>
      </div>

      {deadlines.length === 0 ? (
        <div className="friendly-card p-10 text-center bg-white border border-[#F0EAF3]">
          <CutePumpkinIcon size={36} className="mx-auto mb-2 opacity-70" />
          <h4 className="font-heading font-bold text-base text-[#282433]">
            No pending deadlines! 🎉
          </h4>
          <p className="text-xs font-sans text-[#777382] mt-1 max-w-sm mx-auto">
            All your coursework and registrations are clear, or click "Try Sample Campus Data" to explore sample deadlines.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlines.map((dl) => {
            const rel = getRelativeDateLabel(dl.due_date);

            return (
              <div
                key={dl.id}
                onClick={() => onSelectEvidence(dl.evidence, dl.title)}
                className="friendly-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-[#FF8A3D] transition bg-white"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-2xl bg-[#FFF0E5] text-[#FF8A3D] flex items-center justify-center shrink-0 border border-[#FFE2CD]">
                    <Clock className="h-5 w-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-heading font-bold uppercase ${rel.colorClass}`}>
                        {rel.label}
                      </span>
                      <span className="text-xs font-heading font-bold text-[#FF8A3D]">
                        {dl.importance.toUpperCase()} PRIORITY
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-base text-[#282433]">
                      {dl.title}
                    </h4>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#777382]">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3.5 w-3.5 text-[#FF8A3D]" />
                        <span className="font-sans font-medium text-[#282433]">
                          Due: {dl.due_date}
                        </span>
                      </div>

                      {dl.due_time && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3.5 w-3.5 text-[#7C5CE7]" />
                          <span className="font-sans font-medium text-[#282433]">
                            Time: {dl.due_time}
                          </span>
                        </div>
                      )}
                    </div>

                    {dl.required_actions && dl.required_actions.length > 0 && (
                      <div className="mt-2 text-xs font-sans text-[#777382]">
                        <span className="font-heading font-semibold text-[#282433]">Next step: </span>
                        {dl.required_actions.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-1 text-xs font-heading font-semibold text-[#7C5CE7] hover:text-[#FF8A3D] shrink-0 self-end sm:self-center">
                  <span>View Evidence ({dl.evidence.length})</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
