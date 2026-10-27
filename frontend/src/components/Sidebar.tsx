import React from 'react';
import { 
  Home, 
  Calendar, 
  Clock, 
  BookOpen, 
  FolderArchive, 
  Bot, 
  User, 
  Settings, 
  LogOut,
  AlertTriangle,
  Upload,
  CheckCircle2
} from 'lucide-react';
import { CutePumpkinIcon, CuteGhostWithPumpkin } from './CuteHalloweenIllustrations';
import { DocumentRecord } from '../types';

export type StudentNavTab = 'home' | 'schedule' | 'deadlines' | 'planner' | 'documents' | 'assistant';

interface SidebarProps {
  activeTab: StudentNavTab;
  setActiveTab: (tab: StudentNavTab) => void;
  documents: DocumentRecord[];
  onOpenUploadModal: () => void;
  onOpenProfileModal: () => void;
  onOpenSettingsModal: () => void;
  onLogout: () => void;
  conflictsCount: number;
  deadlinesCount: number;
  studentName?: string;
  studentCourse?: string;
  isOllamaConnected: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documents,
  onOpenUploadModal,
  onOpenProfileModal,
  onOpenSettingsModal,
  onLogout,
  conflictsCount,
  deadlinesCount,
  studentName = 'Alex Morgan',
  studentCourse = 'Computer Science • 2nd Year',
  isOllamaConnected,
}) => {
  const navItems = [
    { 
      id: 'home' as StudentNavTab, 
      label: 'Home', 
      icon: Home, 
      badge: null 
    },
    { 
      id: 'schedule' as StudentNavTab, 
      label: 'My Schedule', 
      icon: Calendar, 
      badge: conflictsCount > 0 ? `${conflictsCount} Clash` : null,
      badgeColor: 'bg-[#FFF0E5] text-[#FF8A3D]'
    },
    { 
      id: 'deadlines' as StudentNavTab, 
      label: 'Deadlines', 
      icon: Clock, 
      badge: deadlinesCount > 0 ? deadlinesCount : null,
      badgeColor: 'bg-[#FFF4C2] text-[#B7791F]'
    },
    { 
      id: 'planner' as StudentNavTab, 
      label: 'Study Planner', 
      icon: BookOpen, 
      badge: null 
    },
    { 
      id: 'documents' as StudentNavTab, 
      label: 'My Documents', 
      icon: FolderArchive, 
      badge: documents.length > 0 ? documents.length : null,
      badgeColor: 'bg-[#EDE7FF] text-[#7C5CE7]'
    },
    { 
      id: 'assistant' as StudentNavTab, 
      label: 'Ask AI Helper', 
      icon: Bot, 
      badge: '👻',
      badgeColor: 'bg-[#DDF7E8] text-[#227B49]'
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#F0EAF3] flex flex-col justify-between shrink-0 h-full select-none shadow-sm">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Brand Header */}
        <div className="p-5 pb-4 border-b border-[#F0EAF3] flex items-center space-x-2.5">
          <div className="h-10 w-10 rounded-2xl bg-[#FFF0E5] flex items-center justify-center border border-[#FFE2CD] shadow-sm">
            <CutePumpkinIcon size={24} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 leading-none">
              <span className="font-heading font-bold text-lg text-[#282433]">
                Campus<span className="text-[#FF8A3D]">Pilot</span>
              </span>
              <span className="text-xs">🎃</span>
            </div>
            <span className="text-[10px] font-sans font-medium text-[#777382] mt-0.5 block">
              Student Companion
            </span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-heading font-semibold tracking-wider text-[#777382] uppercase mb-1.5">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-heading font-semibold transition-all ${
                    isActive
                      ? 'bg-[#FFF0E5] text-[#FF8A3D] shadow-sm'
                      : 'text-[#777382] hover:bg-[#FFF9F2] hover:text-[#282433]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-[#FF8A3D]' : 'text-[#777382] group-hover:text-[#282433]'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-heading font-bold ${
                        item.badgeColor || 'bg-[#F0EAF3] text-[#777382]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick upload button */}
          <div className="pt-1">
            <button
              onClick={onOpenUploadModal}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#FFF9F2] border border-dashed border-[#FFE2CD] py-2.5 px-3 text-xs font-heading font-semibold text-[#FF8A3D] hover:bg-[#FFF0E5] transition"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Add Documents</span>
            </button>
          </div>

          {/* Settings & Profile Links */}
          <div className="space-y-1 pt-2 border-t border-[#F0EAF3]">
            <p className="px-3 text-[10px] font-heading font-semibold tracking-wider text-[#777382] uppercase mb-1">
              Account
            </p>
            <button
              onClick={onOpenProfileModal}
              className="w-full flex items-center space-x-3 rounded-xl px-3 py-2 text-xs font-heading font-semibold text-[#777382] hover:bg-[#FFF9F2] hover:text-[#282433] transition"
            >
              <User className="h-4 w-4" />
              <span>My Profile</span>
            </button>
            <button
              onClick={onOpenSettingsModal}
              className="w-full flex items-center space-x-3 rounded-xl px-3 py-2 text-xs font-heading font-semibold text-[#777382] hover:bg-[#FFF9F2] hover:text-[#282433] transition"
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </button>
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 rounded-xl px-3 py-2 text-xs font-heading font-semibold text-[#D94C4C] hover:bg-[#FFF0E5] transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Profile card */}
      <div className="p-3 border-t border-[#F0EAF3] bg-[#FFF9F2]">
        <div
          onClick={onOpenProfileModal}
          className="rounded-2xl bg-white border border-[#F0EAF3] p-3 flex items-center space-x-3 cursor-pointer hover:border-[#FF8A3D]/40 transition shadow-sm"
        >
          <div className="h-9 w-9 rounded-xl bg-[#EDE7FF] border border-[#DDD4F8] flex items-center justify-center font-heading font-bold text-xs text-[#7C5CE7] shrink-0">
            AM
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-heading font-bold text-[#282433] truncate">
              {studentName}
            </h4>
            <p className="text-[10px] font-sans text-[#777382] truncate">
              {studentCourse}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
