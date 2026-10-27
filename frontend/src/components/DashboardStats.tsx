import React from 'react';
import { Clock, Calendar, AlertTriangle, CheckSquare, TrendingUp, Sparkles } from 'lucide-react';
import { PlanGenerationResponse } from '../types';

interface DashboardStatsProps {
  totalDeadlines: number;
  totalEvents: number;
  conflictsCount: number;
  criticalConflictsCount: number;
  plan: PlanGenerationResponse | null;
  onStatClick?: (target: 'deadlines' | 'timeline' | 'conflicts' | 'plan') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalDeadlines,
  totalEvents,
  conflictsCount,
  criticalConflictsCount,
  plan,
  onStatClick,
}) => {
  const plannedItemsCount = plan?.weekly_schedule?.length || 0;
  const feasibilityScore = plan?.feasibility_score ?? null;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {/* 1. Total Deadlines */}
      <div
        onClick={() => onStatClick?.('deadlines')}
        className="gothic-card p-4 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-display font-semibold tracking-wider text-[#9693A7] uppercase">
            Total Deadlines
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FF7518]/15 text-[#FF7518] border border-[#FF7518]/25 group-hover:scale-110 transition-transform">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="font-display text-2xl lg:text-3xl font-extrabold text-[#F4F0FA]">
            {totalDeadlines}
          </span>
          <span className="text-[10px] font-mono text-[#FFB347]">
            {totalDeadlines > 0 ? 'Extracted' : 'None'}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#9693A7]">
          <span>Gemma 4 parsed</span>
          <span className="text-[#FF7518] group-hover:underline">View details →</span>
        </div>
      </div>

      {/* 2. Upcoming Events */}
      <div
        onClick={() => onStatClick?.('timeline')}
        className="gothic-card p-4 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-display font-semibold tracking-wider text-[#9693A7] uppercase">
            Upcoming Events
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#7C3AED]/20 text-[#A78BFA] border border-[#7C3AED]/30 group-hover:scale-110 transition-transform">
            <Calendar className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="font-display text-2xl lg:text-3xl font-extrabold text-[#F4F0FA]">
            {totalEvents}
          </span>
          <span className="text-[10px] font-mono text-[#A78BFA]">Active</span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#9693A7]">
          <span>Lectures & Labs</span>
          <span className="text-[#A78BFA] group-hover:underline">Timeline →</span>
        </div>
      </div>

      {/* 3. Schedule Conflicts */}
      <div
        onClick={() => onStatClick?.('conflicts')}
        className={`gothic-card p-4 cursor-pointer group ${
          criticalConflictsCount > 0
            ? 'gothic-card-crimson border-[#F87171]/40'
            : conflictsCount > 0
            ? 'gothic-card-ember border-[#FFB347]/35'
            : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-display font-semibold tracking-wider text-[#9693A7] uppercase">
            Schedule Conflicts
          </span>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg border group-hover:scale-110 transition-transform ${
              criticalConflictsCount > 0
                ? 'bg-[#F87171]/20 text-[#F87171] border-[#F87171]/40 animate-pulse'
                : 'bg-[#FFB347]/20 text-[#FFB347] border-[#FFB347]/40'
            }`}
          >
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span
            className={`font-display text-2xl lg:text-3xl font-extrabold ${
              criticalConflictsCount > 0 ? 'text-[#F87171]' : 'text-[#F4F0FA]'
            }`}
          >
            {conflictsCount}
          </span>
          <span
            className={`text-[10px] font-mono ${
              criticalConflictsCount > 0 ? 'text-[#F87171]' : 'text-[#6EE7B7]'
            }`}
          >
            {criticalConflictsCount > 0 ? `${criticalConflictsCount} Critical` : '0 Critical'}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#9693A7]">
          <span>Exact interval checks</span>
          <span className="text-[#F87171] group-hover:underline">Resolve →</span>
        </div>
      </div>

      {/* 4. Planned Action Items */}
      <div
        onClick={() => onStatClick?.('plan')}
        className="gothic-card p-4 cursor-pointer group"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-display font-semibold tracking-wider text-[#9693A7] uppercase">
            Planned Action Items
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6EE7B7]/15 text-[#6EE7B7] border border-[#6EE7B7]/25 group-hover:scale-110 transition-transform">
            <CheckSquare className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline space-x-2">
          <span className="font-display text-2xl lg:text-3xl font-extrabold text-[#F4F0FA]">
            {plannedItemsCount}
          </span>
          {feasibilityScore !== null && (
            <span className="text-[10px] font-mono text-[#6EE7B7]">
              {feasibilityScore}% Feasible
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#9693A7]">
          <span>
            {plan ? `${plan.total_allocated_hours}h scheduled` : 'Synthesizing'}
          </span>
          <span className="text-[#6EE7B7] group-hover:underline">Action Plan →</span>
        </div>
      </div>
    </div>
  );
};
