from enum import Enum
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class RecordStatus(str, Enum):
    CONFIRMED = "confirmed"       # Explicitly stated fact with source evidence
    INFERRED = "inferred"         # Inferred/suggested by AI from context
    UNRESOLVED = "unresolved"     # Ambiguous, incomplete or missing crucial info

class SourceEvidence(BaseModel):
    document_name: str
    page_number: int
    text_snippet: str

class ExtractedEvent(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    date: Optional[str] = None           # YYYY-MM-DD
    start_time: Optional[str] = None     # HH:MM format (24h)
    end_time: Optional[str] = None       # HH:MM format (24h)
    location: Optional[str] = None
    category: str = "general"            # exam, lab, hackathon, club, scholarship, etc.
    eligibility: List[str] = Field(default_factory=list)
    required_actions: List[str] = Field(default_factory=list)
    uncertainties: List[str] = Field(default_factory=list)
    status: RecordStatus = RecordStatus.CONFIRMED
    evidence: List[SourceEvidence] = Field(default_factory=list)

class ExtractedDeadline(BaseModel):
    id: str
    title: str
    due_date: str                        # YYYY-MM-DD
    due_time: Optional[str] = None       # HH:MM
    importance: str = "medium"           # high, medium, low
    required_actions: List[str] = Field(default_factory=list)
    eligibility: List[str] = Field(default_factory=list)
    uncertainties: List[str] = Field(default_factory=list)
    status: RecordStatus = RecordStatus.CONFIRMED
    evidence: List[SourceEvidence] = Field(default_factory=list)

class ExtractionResult(BaseModel):
    document_name: str
    events: List[ExtractedEvent] = Field(default_factory=list)
    deadlines: List[ExtractedDeadline] = Field(default_factory=list)
    general_notes: List[str] = Field(default_factory=list)
    uncertainties: List[str] = Field(default_factory=list)

class ConflictSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class ConflictType(str, Enum):
    TIME_OVERLAP = "time_overlap"
    TIGHT_DEADLINE = "tight_deadline"
    ELIGIBILITY_WARNING = "eligibility_warning"
    AMBIGUITY_FLAG = "ambiguity_flag"

class ConflictAlert(BaseModel):
    id: str
    conflict_type: ConflictType
    severity: ConflictSeverity
    title: str
    description: str
    event_ids: List[str] = Field(default_factory=list)
    event_titles: List[str] = Field(default_factory=list)
    time_window: Optional[str] = None
    suggested_resolution: str
    is_deterministic: bool = True

class DocumentPage(BaseModel):
    page_number: int
    text: str
    char_count: int

class DocumentRecord(BaseModel):
    id: str
    filename: str
    file_type: str
    page_count: int
    uploaded_at: str
    pages: List[DocumentPage] = Field(default_factory=list)
    is_demo: bool = False
    extracted_events: List[ExtractedEvent] = Field(default_factory=list)
    extracted_deadlines: List[ExtractedDeadline] = Field(default_factory=list)

class ActionPlanItem(BaseModel):
    id: str
    day_of_week: str                     # e.g., Monday, Tuesday...
    date: Optional[str] = None           # YYYY-MM-DD
    time_slot: Optional[str] = None      # e.g. "09:00 - 11:00"
    task_title: str
    allocated_hours: float
    priority: str = "medium"             # urgent, high, medium, low
    category: str = "study"              # exam_prep, submission, attendance, review
    reasoning: str
    related_event_id: Optional[str] = None
    status_type: RecordStatus = RecordStatus.CONFIRMED
    source_ref: Optional[str] = None

class PlanGenerationRequest(BaseModel):
    daily_budget_hours: Dict[str, float] = Field(
        default_factory=lambda: {
            "Monday": 4.0,
            "Tuesday": 4.0,
            "Wednesday": 4.0,
            "Thursday": 4.0,
            "Friday": 4.0,
            "Saturday": 6.0,
            "Sunday": 6.0,
        }
    )
    priorities: List[str] = Field(
        default_factory=lambda: ["Academics & Exams", "Hackathons & Projects", "Scholarships"]
    )
    student_notes: Optional[str] = None

class PlanGenerationResponse(BaseModel):
    total_allocated_hours: float
    feasibility_score: float             # 0 - 100
    weekly_schedule: List[ActionPlanItem]
    conflicts_detected: List[ConflictAlert]
    confirmed_facts: List[str] = Field(default_factory=list)
    inferred_suggestions: List[str] = Field(default_factory=list)
    unresolved_ambiguities: List[str] = Field(default_factory=list)
    summary: str
    generator_type: str = "algorithmic"

class AskQuestionRequest(BaseModel):
    question: str
    document_ids: Optional[List[str]] = None
    force_fast: Optional[bool] = False

class AskQuestionResponse(BaseModel):
    answer: str
    evidence: List[SourceEvidence]
    confirmed_facts: List[str] = Field(default_factory=list)
    inferred_suggestions: List[str] = Field(default_factory=list)
    unresolved_ambiguities: List[str] = Field(default_factory=list)
    model_used: str

class HealthResponse(BaseModel):
    status: str
    version: str
    ollama_model: str
    ollama_base_url: str
    ollama_reachable: bool
    ollama_status_message: Optional[str] = None
    documents_count: int
    events_count: int
    conflicts_count: int
