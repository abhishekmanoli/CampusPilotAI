export type RecordStatus = 'confirmed' | 'inferred' | 'unresolved';

export interface SourceEvidence {
  document_name: string;
  page_number: number;
  text_snippet: string;
}

export interface ExtractedEvent {
  id: string;
  title: string;
  description?: string | null;
  date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  category: string;
  eligibility: string[];
  required_actions: string[];
  uncertainties: string[];
  status: RecordStatus;
  evidence: SourceEvidence[];
}

export interface ExtractedDeadline {
  id: string;
  title: string;
  due_date: string;
  due_time?: string | null;
  importance: string;
  required_actions: string[];
  eligibility: string[];
  uncertainties: string[];
  status: RecordStatus;
  evidence: SourceEvidence[];
}

export type ConflictSeverity = 'critical' | 'warning' | 'info';
export type ConflictType = 'time_overlap' | 'tight_deadline' | 'eligibility_warning' | 'ambiguity_flag';

export interface ConflictAlert {
  id: string;
  conflict_type: ConflictType;
  severity: ConflictSeverity;
  title: string;
  description: string;
  event_ids: string[];
  event_titles: string[];
  time_window?: string | null;
  suggested_resolution: string;
  is_deterministic: boolean;
}

export interface DocumentPage {
  page_number: number;
  text: string;
  char_count: number;
}

export interface DocumentRecord {
  id: string;
  filename: string;
  file_type: string;
  page_count: number;
  uploaded_at: string;
  pages: DocumentPage[];
  is_demo: boolean;
  extracted_events: ExtractedEvent[];
  extracted_deadlines: ExtractedDeadline[];
}

export interface ActionPlanItem {
  id: string;
  day_of_week: string;
  date?: string | null;
  time_slot?: string | null;
  task_title: string;
  allocated_hours: number;
  priority: string;
  category: string;
  reasoning: string;
  status_type: RecordStatus;
  source_ref?: string | null;
}

export interface PlanGenerationRequest {
  daily_budget_hours: Record<string, number>;
  priorities: string[];
  student_notes?: string | null;
}

export interface PlanGenerationResponse {
  total_allocated_hours: number;
  feasibility_score: number;
  weekly_schedule: ActionPlanItem[];
  conflicts_detected: ConflictAlert[];
  confirmed_facts: string[];
  inferred_suggestions: string[];
  unresolved_ambiguities: string[];
  summary: string;
  generator_type?: string;
}

export interface AskQuestionResponse {
  answer: string;
  evidence: SourceEvidence[];
  confirmed_facts: string[];
  inferred_suggestions: string[];
  unresolved_ambiguities: string[];
  model_used: string;
}

export interface HealthResponse {
  status: string;
  version: string;
  ollama_model: string;
  ollama_base_url: string;
  ollama_reachable: boolean;
  ollama_status_message?: string | null;
  documents_count: number;
  events_count: number;
  conflicts_count: number;
}
