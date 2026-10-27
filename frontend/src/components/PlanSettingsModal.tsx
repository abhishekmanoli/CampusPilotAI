import React, { useState } from 'react';
import { X, Sliders, Check } from 'lucide-react';
import { PlanGenerationRequest } from '../types';
import { CutePumpkinIcon } from './CuteHalloweenIllustrations';

interface PlanSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (request: PlanGenerationRequest) => Promise<void>;
  isGenerating: boolean;
}

export const PlanSettingsModal: React.FC<PlanSettingsModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  isGenerating,
}) => {
  const [budget, setBudget] = useState<Record<string, number>>({
    Monday: 4.0,
    Tuesday: 4.0,
    Wednesday: 4.0,
    Thursday: 4.0,
    Friday: 4.0,
    Saturday: 6.0,
    Sunday: 6.0,
  });

  const availablePriorities = [
    "Academics & Mandatory Exams",
    "Coursework Projects & Deliverables",
    "Hackathons & Competitions",
    "Scholarships & Grants",
    "Club Activities & Networking",
  ];

  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([
    "Academics & Mandatory Exams",
    "Coursework Projects & Deliverables",
    "Hackathons & Competitions",
  ]);

  const [notes, setNotes] = useState(
    "Focus on Database Systems assignment preparation and resolving the Tuesday clash."
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleHourChange = (day: string, value: number) => {
    setBudget((prev) => ({
      ...prev,
      [day]: Math.max(0, Math.min(16, value)),
    }));
  };

  const togglePriority = (p: string) => {
    setSelectedPriorities((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const totalWeeklyHours = Object.values(budget).reduce((a, b) => a + b, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate({
      daily_budget_hours: budget,
      priorities: selectedPriorities,
      student_notes: notes,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#282433]/30 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl bg-white border border-[#F0EAF3] p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#F0EAF3]">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-[#FFF0E5] text-[#FF8A3D] flex items-center justify-center border border-[#FFE2CD]">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#282433]">
                Adjust Study Hours & Priorities
              </h3>
              <p className="text-xs font-sans text-[#777382]">
                Personalize your study schedule for local Gemma 4 planning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#777382] hover:bg-[#FFF9F2] hover:text-[#282433] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Daily Study Budget */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-heading font-semibold text-[#282433]">
                Daily Study Hours:
              </label>
              <span className="text-xs font-heading font-bold text-[#FF8A3D]">
                Weekly Total: {totalWeeklyHours} hrs
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(budget).map(([day, hrs]) => (
                <div key={day} className="rounded-2xl border border-[#F0EAF3] bg-[#FFF9F2] p-2.5 text-center">
                  <span className="text-[11px] font-heading font-semibold text-[#777382] block mb-1">
                    {day.slice(0, 3)}
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="16"
                    value={hrs}
                    onChange={(e) => handleHourChange(day, parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl bg-white border border-[#F0EAF3] py-1 text-center font-heading font-bold text-sm text-[#282433] focus:border-[#FF8A3D] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Priority Toggles */}
          <div>
            <label className="text-xs font-heading font-semibold text-[#282433] block mb-2">
              Ranked Focus Priorities:
            </label>
            <div className="space-y-1.5">
              {availablePriorities.map((priority) => {
                const isSelected = selectedPriorities.includes(priority);
                return (
                  <button
                    type="button"
                    key={priority}
                    onClick={() => togglePriority(priority)}
                    className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-heading font-semibold transition text-left ${
                      isSelected
                        ? 'border-[#FFE2CD] bg-[#FFF0E5] text-[#FF8A3D]'
                        : 'border-[#F0EAF3] bg-white text-[#777382] hover:bg-[#FFF9F2]'
                    }`}
                  >
                    <span>{priority}</span>
                    {isSelected && <Check className="h-4 w-4 text-[#FF8A3D]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-heading font-semibold text-[#282433] block mb-1.5">
              Personal Study Notes / Preferences:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Need Wednesday afternoon free, focus on assignment submission..."
              className="w-full rounded-xl border border-[#F0EAF3] bg-white p-3 text-xs font-sans text-[#282433] placeholder-[#777382]/50 focus:border-[#FF8A3D] focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#F0EAF3] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-heading font-medium text-[#777382] hover:text-[#282433]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="btn-friendly-pumpkin text-xs px-5 py-2 disabled:opacity-50"
            >
              {isGenerating ? 'Synthesizing...' : 'Save & Build Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
