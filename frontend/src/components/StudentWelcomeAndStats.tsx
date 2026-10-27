import React from 'react';
import { CheckSquare, Calendar, AlertTriangle, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { CuteGhostWithPumpkin, CutePumpkinIcon } from './CuteHalloweenIllustrations';
import { StudentNavTab } from './Sidebar';

interface StudentWelcomeAndStatsProps {
  studentName?: string;
  tasksCount: number;
  eventsCount: number;
  conflictsCount: number;
  completedHours?: number;
  allocatedHours: number;
  studyGoalHours: number;
  onCardClick: (tab: StudentNavTab) => void;
}

export const StudentWelcomeAndStats: React.FC<StudentWelcomeAndStatsProps> = ({
  studentName = 'Alex',
  tasksCount,
  eventsCount,
  conflictsCount,
  completedHours,
  allocatedHours,
  studyGoalHours = 20,
  onCardClick,
}) => {
  return (
    <div className="space-y-6 select-none">
      {/* A. Welcome Banner */}
      <div className="friendly-card p-6 sm:p-7 bg-white relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#F0EAF3]">
        <div className="space-y-2 z-10 text-center sm:text-left">
          <div className="inline-flex items-center space-x-1.5 rounded-full bg-[#FFF0E5] px-3 py-1 text-xs font-heading font-semibold text-[#FF8A3D]">
            <span>🎃 Halloween Campus Edition</span>
          </div>

          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#282433]">
            Hi, {studentName}! 👋
          </h1>
          <p className="font-sans text-sm text-[#777382] max-w-lg leading-relaxed">
            Ready to make today a great day?{' '}
            <strong className="text-[#282433]">
              {tasksCount > 0
                ? `You have ${tasksCount} thing${tasksCount === 1 ? '' : 's'} to do today.`
                : 'Your schedule is all clear for today!'}
            </strong>
          </p>
        </div>

        {/* Mascot Illustration */}
        <div className="shrink-0 z-10 flex items-center justify-center">
          <CuteGhostWithPumpkin size={110} />
        </div>
      </div>

      {/* B. Four Simple Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Things to do */}
        <div
          onClick={() => onCardClick('planner')}
          className="friendly-card p-5 cursor-pointer bg-white hover:border-[#FF8A3D] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-[#777382] uppercase tracking-wide">
              Things to do
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#FFF0E5] text-[#FF8A3D] flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-bold text-3xl text-[#282433]">
              {tasksCount}
            </span>
            <span className="text-xs font-sans text-[#777382] ml-1.5">tasks</span>
          </div>
          <p className="mt-1 text-xs font-sans text-[#777382]">
            Ready for your study session
          </p>
        </div>

        {/* 2. Coming up */}
        <div
          onClick={() => onCardClick('schedule')}
          className="friendly-card p-5 cursor-pointer bg-white hover:border-[#7C5CE7] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-[#777382] uppercase tracking-wide">
              Coming up
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#EDE7FF] text-[#7C5CE7] flex items-center justify-center">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-bold text-3xl text-[#282433]">
              {eventsCount}
            </span>
            <span className="text-xs font-sans text-[#777382] ml-1.5">events</span>
          </div>
          <p className="mt-1 text-xs font-sans text-[#777382]">
            Classes, labs, and workshops
          </p>
        </div>

        {/* 3. Needs attention */}
        <div
          onClick={() => onCardClick('schedule')}
          className={`friendly-card p-5 cursor-pointer bg-white transition group ${
            conflictsCount > 0
              ? 'border-[#FFE2CD] bg-[#FFF9F2] hover:border-[#FF8A3D]'
              : 'hover:border-[#F0EAF3]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-[#777382] uppercase tracking-wide">
              Needs attention
            </span>
            <div
              className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                conflictsCount > 0
                  ? 'bg-[#FFF0E5] text-[#D94C4C]'
                  : 'bg-[#DDF7E8] text-[#227B49]'
              }`}
            >
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`font-heading font-bold text-3xl ${
                conflictsCount > 0 ? 'text-[#D94C4C]' : 'text-[#282433]'
              }`}
            >
              {conflictsCount}
            </span>
            <span className="text-xs font-sans text-[#777382] ml-1.5">
              {conflictsCount === 1 ? 'schedule clash' : 'schedule clashes'}
            </span>
          </div>
          <p className="mt-1 text-xs font-sans text-[#777382]">
            {conflictsCount > 0 ? 'Click to resolve clash' : 'No clashes detected'}
          </p>
        </div>

        {/* 4. Study progress */}
        <div
          onClick={() => onCardClick('planner')}
          className="friendly-card p-5 cursor-pointer bg-white hover:border-[#48BB78] transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-heading font-semibold text-[#777382] uppercase tracking-wide">
              Study progress
            </span>
            <div className="h-8 w-8 rounded-xl bg-[#DDF7E8] text-[#227B49] flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="font-heading font-bold text-3xl text-[#282433]">
              {completedHours !== undefined ? completedHours : 0}
            </span>
            <span className="text-xs font-sans text-[#777382] ml-1.5">
              of {studyGoalHours} hrs done
            </span>
          </div>
          <div className="mt-2 w-full bg-[#F0EAF3] h-2 rounded-full overflow-hidden">
            <div
              className="bg-[#38A169] h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.round(((completedHours !== undefined ? completedHours : 0) / (studyGoalHours || 1)) * 100))}%`,
              }}
            />
          </div>
          <p className="mt-1 text-[11px] font-sans text-[#777382]">
            {allocatedHours > 0 ? `${allocatedHours} hrs planned for the week` : 'No study hours allocated'}
          </p>
        </div>
      </div>
    </div>
  );
};
