import React, { useState } from 'react';
import { X, User, GraduationCap, BookOpen, Clock, Calendar, Check, Sparkles } from 'lucide-react';
import { CuteGhostWithPumpkin, CutePumpkinIcon } from './CuteHalloweenIllustrations';
import { api } from '../services/api';

export interface StudentProfileData {
  name: string;
  email: string;
  college: string;
  course: string;
  year: string;
  semester: string;
  weekly_study_goal: number;
  avatar_initials: string;
  is_demo: boolean;
}

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfileData;
  onProfileUpdated: (updated: StudentProfileData) => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdated,
}) => {
  const [formData, setFormData] = useState<StudentProfileData>(profile);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setFormData(profile);
      setSavedSuccess(false);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, profile, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(formData);
      onProfileUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      // Local fallback
      onProfileUpdated(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#282433]/30 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white border border-[#F0EAF3] p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#F0EAF3]">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 rounded-2xl bg-[#FFF0E5] flex items-center justify-center border border-[#FFE2CD] text-[#FF8A3D] font-heading font-bold text-lg">
              {formData.avatar_initials || 'AM'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-heading font-bold text-xl text-[#282433]">Student Profile</h3>
                <span className="rounded-full bg-[#FFF0E5] px-2 py-0.5 text-[10px] font-heading font-semibold text-[#FF8A3D]">
                  Demo Student
                </span>
              </div>
              <p className="text-xs font-sans text-[#777382]">
                Your personalized campus preferences and weekly goals
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1">
                Student Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-[#F0EAF3] bg-white p-2.5 text-sm font-sans text-[#282433] focus:border-[#FF8A3D] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full rounded-xl border border-[#F0EAF3] bg-[#FFF9F2] p-2.5 text-sm font-sans text-[#777382] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1">
                College / University
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full rounded-xl border border-[#F0EAF3] bg-white p-2.5 text-sm font-sans text-[#282433] focus:border-[#FF8A3D] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/20"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1">
                Course / Branch
              </label>
              <input
                type="text"
                value={formData.course}
                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                className="w-full rounded-xl border border-[#F0EAF3] bg-white p-2.5 text-sm font-sans text-[#282433] focus:border-[#FF8A3D] focus:outline-none focus:ring-2 focus:ring-[#FF8A3D]/20"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1">
                Year of Study
              </label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full rounded-xl border border-[#F0EAF3] bg-white p-2 text-sm font-sans text-[#282433] focus:border-[#FF8A3D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1">
                Semester
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="w-full rounded-xl border border-[#F0EAF3] bg-white p-2 text-sm font-sans text-[#282433] focus:border-[#FF8A3D] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-heading font-semibold text-[#282433] mb-1">
                Weekly Study Goal (hrs)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.weekly_study_goal}
                onChange={(e) =>
                  setFormData({ ...formData, weekly_study_goal: parseFloat(e.target.value) || 0 })
                }
                className="w-full rounded-xl border border-[#F0EAF3] bg-white p-2 text-sm font-sans text-[#282433] focus:border-[#FF8A3D] focus:outline-none"
              />
            </div>
          </div>

          {/* Success Banner */}
          {savedSuccess && (
            <div className="rounded-xl bg-[#DDF7E8] border border-[#BDEECF] p-3 text-xs text-[#227B49] flex items-center space-x-2 font-heading font-medium">
              <Check className="h-4 w-4" />
              <span>Profile saved successfully!</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#F0EAF3] flex items-center justify-between">
            <span className="text-[11px] font-sans text-[#777382]">
              Sample student data for hackathon evaluation
            </span>
            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-heading font-medium text-[#777382] hover:text-[#282433]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn-friendly-pumpkin text-xs px-5 py-2"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
