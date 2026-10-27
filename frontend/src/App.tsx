import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, StudentNavTab } from './components/Sidebar';
import { LoginPage } from './components/LoginPage';
import { StudentWelcomeAndStats } from './components/StudentWelcomeAndStats';
import { StudentScheduleAndClashes } from './components/StudentScheduleAndClashes';
import { StudentDeadlines } from './components/StudentDeadlines';
import { TaskCards } from './components/TaskCards';
import { StudentAiHelper } from './components/StudentAiHelper';
import { StudentProfileModal, StudentProfileData } from './components/StudentProfileModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { PlanSettingsModal } from './components/PlanSettingsModal';
import { OllamaModal } from './components/OllamaModal';
import { EvidenceDrawer } from './components/EvidenceDrawer';
import { api } from './services/api';
import { 
  DocumentRecord, 
  ConflictAlert, 
  ExtractedEvent, 
  ExtractedDeadline, 
  PlanGenerationResponse, 
  PlanGenerationRequest, 
  SourceEvidence, 
  HealthResponse 
} from './types';
import { 
  Sparkles, 
  ShieldAlert, 
  FolderArchive, 
  UploadCloud, 
  FileCheck2, 
  Trash2,
  X
} from 'lucide-react';
import { CuteGhostWithPumpkin, CutePumpkinIcon } from './components/CuteHalloweenIllustrations';

export const App: React.FC = () => {
  // Authentication state
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('campuspilot_token');
  });

  const [studentProfile, setStudentProfile] = useState<StudentProfileData>(() => {
    try {
      const stored = localStorage.getItem('campuspilot_user');
      return stored ? JSON.parse(stored) : {
        name: 'Alex Morgan',
        email: 'student@campuspilot.demo',
        college: 'Example University',
        course: 'Computer Science',
        year: '2nd Year',
        semester: 'Semester 3',
        weekly_study_goal: 20,
        avatar_initials: 'AM',
        is_demo: true,
      };
    } catch {
      return {
        name: 'Alex Morgan',
        email: 'student@campuspilot.demo',
        college: 'Example University',
        course: 'Computer Science',
        year: '2nd Year',
        semester: 'Semester 3',
        weekly_study_goal: 20,
        avatar_initials: 'AM',
        is_demo: true,
      };
    }
  });

  // Navigation & Search
  const [activeTab, setActiveTab] = useState<StudentNavTab>('home');
  const [searchQuery, setSearchQuery] = useState('');

  // Server & Data State
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [events, setEvents] = useState<ExtractedEvent[]>([]);
  const [deadlines, setDeadlines] = useState<ExtractedDeadline[]>([]);
  const [conflicts, setConflicts] = useState<ConflictAlert[]>([]);
  const [plan, setPlan] = useState<PlanGenerationResponse | null>(null);

  // Persisted task completions
  const [completedTaskIds, setCompletedTaskIds] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('campuspilot_completed_tasks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleToggleTask = (id: string) => {
    setCompletedTaskIds((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('campuspilot_completed_tasks', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isOllamaModalOpen, setIsOllamaModalOpen] = useState(false);
  const [isPlanSettingsOpen, setIsPlanSettingsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [evidenceDrawer, setEvidenceDrawer] = useState<{
    isOpen: boolean;
    title: string;
    items: SourceEvidence[];
  }>({
    isOpen: false,
    title: '',
    items: [],
  });

  // Action states
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Refresh data from backend
  const refreshData = async () => {
    try {
      const [h, docs, evs, confs] = await Promise.all([
        api.getHealth(),
        api.getDocuments(),
        api.getEvents(),
        api.getConflicts(),
      ]);
      setHealth(h);
      setDocuments(docs);
      setEvents(evs.events || []);
      setDeadlines(evs.deadlines || []);
      setConflicts(confs || []);

      // If commitments exist and no plan yet, auto-generate default plan
      if ((evs.events?.length || evs.deadlines?.length) && !plan) {
        try {
          const initialPlan = await api.generatePlan({
            daily_budget_hours: {
              Monday: 4.0,
              Tuesday: 4.0,
              Wednesday: 4.0,
              Thursday: 4.0,
              Friday: 4.0,
              Saturday: 6.0,
              Sunday: 6.0,
            },
            priorities: ["Academics & Mandatory Exams", "Coursework Projects & Deliverables"],
          });
          setPlan(initialPlan);
        } catch {
          // Silent fallback
        }
      }
    } catch (err: any) {
      console.error('Error refreshing data:', err);
    }
  };

  useEffect(() => {
    if (authToken) {
      refreshData();
      // Also fetch latest profile
      api.getProfile().then((p) => {
        if (p && p.name) {
          setStudentProfile(p);
          localStorage.setItem('campuspilot_user', JSON.stringify(p));
        }
      }).catch(() => {});
    }
  }, [authToken]);

  // Auth Handlers
  const handleLoginSuccess = (user: any, token: string) => {
    setAuthToken(token);
    setStudentProfile(user);
    refreshData();
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {}
    localStorage.removeItem('campuspilot_token');
    localStorage.removeItem('campuspilot_user');
    setAuthToken(null);
  };

  // Demo & Reset Handlers
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    setGlobalError(null);
    try {
      await api.loadDemoData();
      await refreshData();
      setActiveTab('home');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to load demo data.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleClearDemoData = async () => {
    if (!window.confirm('Clear sample campus demo documents? Any files you personally uploaded will be kept safe.')) return;
    try {
      await api.clearDemoData();
      await refreshData();
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to clear demo data.');
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await api.deleteDocument(id);
      await refreshData();
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to delete document.');
    }
  };

  const handleRunAnalyze = async () => {
    setIsAnalyzing(true);
    setGlobalError(null);
    try {
      await api.analyzeDocuments();
      await refreshData();
    } catch (err: any) {
      setGlobalError(err.message || 'Local Gemma 4 analysis encountered an issue.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePlan = async (request: PlanGenerationRequest) => {
    setIsGeneratingPlan(true);
    setGlobalError(null);
    try {
      const generated = await api.generatePlan(request);
      setPlan(generated);
      setIsPlanSettingsOpen(false);
      setActiveTab('planner');
    } catch (err: any) {
      setGlobalError(err.message || 'Failed to synthesize study plan.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const openEvidence = (evidence: SourceEvidence[], title: string) => {
    setEvidenceDrawer({
      isOpen: true,
      title,
      items: evidence,
    });
  };

  // Dedicated schedule collisions count (time overlap conflicts)
  const timeCollisions = useMemo(() => {
    return conflicts.filter((c) => c.conflict_type === 'time_overlap');
  }, [conflicts]);

  // Derived completed hours from completed tasks
  const completedHours = useMemo(() => {
    if (!plan?.weekly_schedule) return 0;
    const total = plan.weekly_schedule
      .filter((item) => completedTaskIds[item.id])
      .reduce((sum, item) => sum + (item.allocated_hours || 0), 0);
    return Math.round(total * 10) / 10;
  }, [plan, completedTaskIds]);

  // Search filtering
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    const q = searchQuery.toLowerCase();
    return events.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q)) ||
        e.category.toLowerCase().includes(q) ||
        (e.location && e.location.toLowerCase().includes(q))
    );
  }, [events, searchQuery]);

  const filteredDeadlines = useMemo(() => {
    if (!searchQuery.trim()) return deadlines;
    const q = searchQuery.toLowerCase();
    return deadlines.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.importance.toLowerCase().includes(q) ||
        (d.due_date && d.due_date.toLowerCase().includes(q))
    );
  }, [deadlines, searchQuery]);

  const filteredConflicts = useMemo(() => {
    if (!searchQuery.trim()) return conflicts;
    const q = searchQuery.toLowerCase();
    return conflicts.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.suggested_resolution.toLowerCase().includes(q) ||
        c.event_titles.some((t) => t.toLowerCase().includes(q))
    );
  }, [conflicts, searchQuery]);

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'home':
        return 'Student Dashboard';
      case 'schedule':
        return 'My Schedule & Classes';
      case 'deadlines':
        return 'Deadlines & Tasks';
      case 'planner':
        return "Today's Study Plan";
      case 'documents':
        return 'Document Vault';
      case 'assistant':
        return 'Campus AI Helper';
      default:
        return 'Student Dashboard';
    }
  };

  // If not authenticated, show Halloween Login Page
  if (!authToken) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen flex-col bg-[#FFF9F2] text-[#282433] overflow-hidden">
      {/* Top Friendly White Navigation Header */}
      <Navbar
        health={health}
        currentSectionTitle={getSectionTitle()}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenOllamaModal={() => setIsOllamaModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onLoadDemoData={handleLoadDemo}
        onResetData={handleClearDemoData}
        isDemoLoading={isDemoLoading}
        studentName={studentProfile.name.split(' ')[0]}
        isDemoActive={documents.some((d) => d.is_demo)}
      />

      {/* Global Error Banner */}
      {globalError && (
        <div className="bg-[#FFF0E5] border-b border-[#FFE2CD] px-6 py-2.5 flex items-center justify-between text-xs text-[#D94C4C] z-30">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="h-4 w-4 shrink-0 text-[#D94C4C]" />
            <span className="font-sans font-medium">{globalError}</span>
          </div>
          <button
            onClick={() => setGlobalError(null)}
            className="font-bold hover:text-[#282433] p-1"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          documents={documents}
          onOpenUploadModal={() => setIsUploadOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenSettingsModal={() => setIsOllamaModalOpen(true)}
          onLogout={handleLogout}
          conflictsCount={timeCollisions.length}
          deadlinesCount={deadlines.length}
          studentName={studentProfile.name}
          studentCourse={`${studentProfile.course} • ${studentProfile.year}`}
          isOllamaConnected={Boolean(health?.ollama_reachable)}
        />

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8 bg-[#FFF9F2]">
          <div className="mx-auto max-w-5xl space-y-7">
            {/* Search Filter Active Notice */}
            {searchQuery && (
              <div className="rounded-2xl border border-[#FFE2CD] bg-[#FFF0E5] px-4 py-2 flex items-center justify-between text-xs text-[#FF8A3D]">
                <div className="flex items-center space-x-2">
                  <span>Filtered by: "<strong className="text-[#282433]">{searchQuery}</strong>"</span>
                  <span className="text-[#777382]">
                    ({filteredEvents.length} events, {filteredDeadlines.length} deadlines, {filteredConflicts.length} conflicts)
                  </span>
                </div>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-[#FF8A3D] hover:underline"
                >
                  Clear Filter
                </button>
              </div>
            )}

            {/* TAB 1: HOME (Dashboard Overview) */}
            {activeTab === 'home' && (
              <div className="space-y-7">
                {/* 1. Welcome Mascot Banner & 4 KPI Cards */}
                <StudentWelcomeAndStats
                  studentName={studentProfile.name.split(' ')[0]}
                  tasksCount={plan?.weekly_schedule?.length || 0}
                  eventsCount={events.length}
                  conflictsCount={timeCollisions.length}
                  completedHours={completedHours}
                  allocatedHours={plan?.total_allocated_hours || 0}
                  studyGoalHours={studentProfile.weekly_study_goal || 20}
                  onCardClick={(tab) => setActiveTab(tab)}
                />

                {/* 2. Schedule and Collision Alert */}
                <StudentScheduleAndClashes
                  events={filteredEvents}
                  conflicts={filteredConflicts}
                  onSelectEvidence={openEvidence}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />

                {/* 3. Today's Plan */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-[#282433]">
                        Today's Study Plan 📋
                      </h3>
                      <p className="text-xs font-sans text-[#777382]">
                        Generated from your course deadlines and weekly study budget
                      </p>
                    </div>
                  </div>
                  <TaskCards
                    planItems={plan?.weekly_schedule || []}
                    feasibilityScore={plan?.feasibility_score || 0}
                    totalHours={plan?.total_allocated_hours || 0}
                    onOpenPlanSettings={() => setIsPlanSettingsOpen(true)}
                    generatorType={plan?.generator_type}
                    completedTaskIds={completedTaskIds}
                    onToggleComplete={handleToggleTask}
                    isLoading={isGeneratingPlan}
                  />
                </div>

                {/* 4. Approaching Deadlines */}
                <StudentDeadlines
                  deadlines={filteredDeadlines}
                  onSelectEvidence={openEvidence}
                />

                {/* 5. Campus AI Assistant */}
                <StudentAiHelper
                  onSelectEvidence={openEvidence}
                  isOllamaConnected={Boolean(health?.ollama_reachable)}
                />
              </div>
            )}

            {/* TAB 2: MY SCHEDULE */}
            {activeTab === 'schedule' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#282433]">
                    My Schedule & Classes 📅
                  </h2>
                  <p className="text-xs font-sans text-[#777382] mt-0.5">
                    All upcoming lectures, exams, lab practicals, and campus events.
                  </p>
                </div>
                <StudentScheduleAndClashes
                  events={filteredEvents}
                  conflicts={filteredConflicts}
                  onSelectEvidence={openEvidence}
                  onOpenUpload={() => setIsUploadOpen(true)}
                />
              </div>
            )}

            {/* TAB 3: DEADLINES */}
            {activeTab === 'deadlines' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#282433]">
                    Assignments & Deadlines ⏰
                  </h2>
                  <p className="text-xs font-sans text-[#777382] mt-0.5">
                    Extracted deliverables, scholarship forms, and project submissions with source proof.
                  </p>
                </div>
                <StudentDeadlines
                  deadlines={filteredDeadlines}
                  onSelectEvidence={openEvidence}
                />
              </div>
            )}

            {/* TAB 4: TODAY'S PLAN */}
            {activeTab === 'planner' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#282433]">
                      Action & Study Planner 📝
                    </h2>
                    <p className="text-xs font-sans text-[#777382] mt-0.5">
                      Tailored weekly study distribution crafted to fit your available hours and deadlines.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPlanSettingsOpen(true)}
                    className="btn-friendly-pumpkin text-xs"
                  >
                    Adjust Budget & Priorities
                  </button>
                </div>
                <TaskCards
                  planItems={plan?.weekly_schedule || []}
                  feasibilityScore={plan?.feasibility_score || 0}
                  totalHours={plan?.total_allocated_hours || 0}
                  onOpenPlanSettings={() => setIsPlanSettingsOpen(true)}
                  generatorType={plan?.generator_type}
                  completedTaskIds={completedTaskIds}
                  onToggleComplete={handleToggleTask}
                  isLoading={isGeneratingPlan}
                />
              </div>
            )}

            {/* TAB 5: MY DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="font-heading font-bold text-2xl text-[#282433]">
                      My Campus Documents 📂
                    </h2>
                    <p className="text-xs font-sans text-[#777382] mt-0.5">
                      Uploaded syllabi, timetables, and notices parsed page-by-page.
                    </p>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={handleRunAnalyze}
                      disabled={isAnalyzing || documents.length === 0}
                      className="btn-friendly-pumpkin flex items-center space-x-2 text-xs disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{isAnalyzing ? 'Extracting with Gemma 4...' : 'Run Gemma 4 Extraction'}</span>
                    </button>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="btn-friendly-soft flex items-center space-x-1.5 text-xs"
                    >
                      <UploadCloud className="h-3.5 w-3.5" />
                      <span>Upload Files</span>
                    </button>
                  </div>
                </div>

                {documents.length === 0 ? (
                  <div className="friendly-card p-12 text-center bg-white">
                    <CutePumpkinIcon size={42} className="mx-auto mb-3 opacity-80" />
                    <h4 className="font-heading font-bold text-lg text-[#282433]">
                      No documents added yet
                    </h4>
                    <p className="text-xs font-sans text-[#777382] mt-1 max-w-sm mx-auto">
                      Add your course syllabi, timetable, or exam notifications, or click "Try Sample Campus Data".
                    </p>
                    <button
                      onClick={handleLoadDemo}
                      disabled={isDemoLoading}
                      className="mt-4 btn-friendly-pumpkin text-xs"
                    >
                      {isDemoLoading ? 'Loading Sample Data...' : 'Load Sample Documents'}
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3.5">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="friendly-card p-5 bg-white space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2.5">
                              <FileCheck2 className="h-4 w-4 text-[#227B49] shrink-0" />
                              <span className="font-heading font-bold text-[#282433] text-sm truncate">
                                {doc.filename}
                              </span>
                              {doc.is_demo ? (
                                <span className="rounded-full bg-[#FFF0E5] border border-[#FFE2CD] px-2.5 py-0.5 text-[10px] text-[#FF8A3D] font-heading font-bold">
                                  Demo Fixture (Pre-parsed)
                                </span>
                              ) : (
                                <span className="rounded-full bg-[#DDF7E8] border border-[#BDEECF] px-2.5 py-0.5 text-[10px] text-[#227B49] font-heading font-bold">
                                  Student Upload
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-sans text-[#777382] mt-1">
                              {doc.page_count} pages • Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                              {doc.is_demo && (
                                <span className="ml-2 italic text-[#FF8A3D]">
                                  (Click "Run Gemma 4 Extraction" to re-extract live on-device)
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="p-2 text-[#777382] hover:text-[#D94C4C] hover:bg-[#FFF0E5] rounded-xl transition"
                            title="Delete document"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Extracted items summary */}
                        <div className="flex flex-wrap gap-2 text-xs pt-3 border-t border-[#F0EAF3]">
                          <span className="rounded-lg bg-[#FFF9F2] border border-[#F0EAF3] px-2.5 py-1 text-[#282433] font-mono text-[11px]">
                            {doc.extracted_events.length} Events Extracted
                          </span>
                          <span className="rounded-lg bg-[#FFF0E5] border border-[#FFE2CD] px-2.5 py-1 text-[#FF8A3D] font-mono text-[11px] font-bold">
                            {doc.extracted_deadlines.length} Deadlines Extracted
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 6: AI HELPER */}
            {activeTab === 'assistant' && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading font-bold text-2xl text-[#282433]">
                    Campus AI Assistant 👻
                  </h2>
                  <p className="text-xs font-sans text-[#777382] mt-0.5">
                    Ask questions about your timetable, assignments, or conflicts grounded in your actual documents.
                  </p>
                </div>
                <StudentAiHelper
                  onSelectEvidence={openEvidence}
                  isOllamaConnected={Boolean(health?.ollama_reachable)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals & Drawers */}
      <EvidenceDrawer
        isOpen={evidenceDrawer.isOpen}
        onClose={() => setEvidenceDrawer((prev) => ({ ...prev, isOpen: false }))}
        title={evidenceDrawer.title}
        evidence={evidenceDrawer.items}
      />

      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={studentProfile}
        onProfileUpdated={(updated) => {
          setStudentProfile(updated);
          localStorage.setItem('campuspilot_user', JSON.stringify(updated));
        }}
      />

      <DocumentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={() => refreshData()}
        onAnalyzeTriggered={handleRunAnalyze}
        onLoadDemoData={handleLoadDemo}
        isGemmaConfigured={Boolean(health?.ollama_reachable)}
        isDemoLoading={isDemoLoading}
      />

      <PlanSettingsModal
        isOpen={isPlanSettingsOpen}
        onClose={() => setIsPlanSettingsOpen(false)}
        onGenerate={handleGeneratePlan}
        isGenerating={isGeneratingPlan}
      />

      <OllamaModal
        isOpen={isOllamaModalOpen}
        onClose={() => setIsOllamaModalOpen(false)}
        onEndpointSaved={refreshData}
        currentModel={health?.ollama_model || 'gemma4:e4b'}
        currentBaseUrl={health?.ollama_base_url || 'http://localhost:11434'}
        isReachable={Boolean(health?.ollama_reachable)}
        statusMessage={health?.ollama_status_message}
      />
    </div>
  );
};

export default App;
