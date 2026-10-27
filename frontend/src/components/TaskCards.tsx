import React, { useState } from 'react';
import { Clock, Calendar, Check, Sliders, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { ActionPlanItem } from '../types';
import { CutePumpkinIcon } from './CuteHalloweenIllustrations';

interface TaskCardsProps {
  planItems: ActionPlanItem[];
  feasibilityScore: number;
  totalHours: number;
  onOpenPlanSettings: () => void;
  generatorType?: string;
  completedTaskIds?: Record<string, boolean>;
  onToggleComplete?: (id: string) => void;
  isLoading?: boolean;
}

export const TaskCards: React.FC<TaskCardsProps> = ({
  planItems,
  feasibilityScore,
  totalHours,
  onOpenPlanSettings,
  generatorType,
  completedTaskIds: externalCompletedTaskIds,
  onToggleComplete: externalToggleComplete,
  isLoading = false,
}) => {
  // Local fallback task completion persistence if not controlled externally
  const [internalCompletedTaskIds, setInternalCompletedTaskIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('campuspilot_completed_tasks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const completedMap = externalCompletedTaskIds ?? internalCompletedTaskIds;

  const toggleComplete = (id: string) => {
    if (externalToggleComplete) {
      externalToggleComplete(id);
    } else {
      setInternalCompletedTaskIds((prev) => {
        const next = { ...prev, [id]: !prev[id] };
        try {
          localStorage.setItem('campuspilot_completed_tasks', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="friendly-card p-10 text-center bg-white border border-[#F0EAF3] space-y-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#FF8A3D] border-t-transparent mx-auto" />
        <h4 className="font-heading font-bold text-base text-[#282433]">
          Synthesizing Your Study Schedule...
        </h4>
        <p className="text-xs font-sans text-[#777382]">
          Analyzing course deadlines, available hours, and priorities.
        </p>
      </div>
    );
  }

  if (planItems.length === 0) {
    return (
      <div className="friendly-card p-10 text-center bg-white border border-[#F0EAF3]">
        <CutePumpkinIcon size={36} className="mx-auto mb-2 opacity-70" />
        <h3 className="font-heading font-bold text-lg text-[#282433]">
          No Study Plan Generated Yet
        </h3>
        <p className="text-xs font-sans text-[#777382] mt-1 max-w-sm mx-auto">
          CampusPilot synthesizes your priorities, available hours, and extracted deadlines into a simple day-by-day plan.
        </p>
        <button
          onClick={onOpenPlanSettings}
          className="mt-4 btn-friendly-pumpkin text-xs"
        >
          Create Study Plan
        </button>
      </div>
    );
  }

  const completedCount = Object.values(completedMap).filter(Boolean).length;

  const getPriorityStyle = (priority: string, isDone: boolean) => {
    if (isDone) {
      return 'bg-[#DDF7E8] text-[#227B49] border-[#BDEECF]';
    }
    switch (priority.toLowerCase()) {
      case 'urgent':
      case 'critical':
        return 'bg-[#FFF0E5] text-[#D94C4C] border-[#FFE2CD]';
      case 'high':
        return 'bg-[#FFF0E5] text-[#FF8A3D] border-[#FFE2CD]';
      default:
        return 'bg-[#EDE7FF] text-[#7C5CE7] border-[#DDD4F8]';
    }
  };

  return (
    <div className="space-y-5">
      {/* Plan Header Card */}
      <div className="friendly-card p-5 bg-white border border-[#F0EAF3] flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-heading font-bold text-base text-[#282433]">
              Your Weekly Study Plan
            </h4>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-heading font-bold ${
                generatorType === 'gemma4'
                  ? 'bg-[#EDE7FF] text-[#7C5CE7] border border-[#DDD4F8]'
                  : 'bg-[#DDF7E8] text-[#227B49] border border-[#BDEECF]'
              }`}
            >
              {generatorType === 'gemma4' ? 'Local Gemma 4 AI' : 'Algorithmic Smart Plan'}
            </span>
          </div>
          <p className="text-xs font-sans text-[#777382] mt-0.5">
            Allocated: <strong className="text-[#FF8A3D]">{totalHours} hrs</strong> • Finished:{' '}
            <strong className="text-[#227B49]">
              {completedCount} of {planItems.length} tasks
            </strong>
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <span className="text-[10px] font-heading font-semibold uppercase text-[#777382] block">
              Feasibility Score
            </span>
            <span
              className={`text-xl font-heading font-bold ${
                feasibilityScore >= 80
                  ? 'text-[#227B49]'
                  : feasibilityScore >= 60
                  ? 'text-[#FF8A3D]'
                  : 'text-[#D94C4C]'
              }`}
            >
              {feasibilityScore}%
            </span>
          </div>

          <button
            onClick={onOpenPlanSettings}
            className="btn-friendly-soft flex items-center space-x-1.5 text-xs py-2 px-3.5"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Adjust Hours</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {planItems.map((item) => {
          const isDone = Boolean(completedMap[item.id]);

          return (
            <div
              key={item.id}
              onClick={() => toggleComplete(item.id)}
              className={`friendly-card p-4 flex items-center justify-between gap-4 cursor-pointer transition select-none bg-white ${
                isDone
                  ? 'border-[#BDEECF] bg-[#F7FDF9]/80 opacity-75'
                  : 'hover:border-[#FF8A3D]'
              }`}
            >
              <div className="flex items-start space-x-3.5 min-w-0">
                {/* Completion Checkbox */}
                <div
                  className={`mt-0.5 h-6 w-6 rounded-xl flex items-center justify-center shrink-0 transition border ${
                    isDone
                      ? 'bg-[#227B49] text-white border-[#227B49]'
                      : 'border-[#F0EAF3] bg-[#FFF9F2] hover:border-[#FF8A3D]'
                  }`}
                >
                  {isDone && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`rounded-lg px-2 py-0.5 text-[10px] font-heading font-bold uppercase border ${getPriorityStyle(
                        item.priority,
                        isDone
                      )}`}
                    >
                      {item.priority}
                    </span>
                    <span className="text-[11px] font-mono text-[#777382]">
                      {item.day_of_week}
                      {item.time_slot ? ` • ${item.time_slot}` : ''}
                    </span>
                  </div>

                  <h5
                    className={`font-heading font-bold text-sm truncate ${
                      isDone ? 'line-through text-[#777382]' : 'text-[#282433]'
                    }`}
                  >
                    {item.task_title}
                  </h5>

                  <p className="text-xs font-sans text-[#777382] mt-0.5 line-clamp-1">
                    {item.reasoning}
                  </p>
                </div>
              </div>

              {/* Time allocation badge */}
              <div className="shrink-0 text-right">
                <span className="rounded-xl bg-[#FFF9F2] border border-[#F0EAF3] px-2.5 py-1 text-xs font-mono font-bold text-[#FF8A3D]">
                  {item.allocated_hours}h
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
