import logging
import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import settings
from app.schemas import (
    HealthResponse,
    DocumentRecord,
    ExtractionResult,
    ConflictAlert,
    PlanGenerationRequest,
    PlanGenerationResponse,
    AskQuestionRequest,
    AskQuestionResponse,
    ExtractedEvent,
    ExtractedDeadline,
)
from app.pdf_parser import DocumentParser, PDFParserError
from app.storage import data_store
from app.conflict_engine import ConflictEngine
from app.gemma_client import gemma_client, GemmaClientError
from app.planner import ActionPlanner
from app.qa_engine import QAEngine
from app.demo_loader import load_demo_documents

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("campuspilot")

app = FastAPI(
    title="CampusPilot AI API",
    description="Intelligent campus schedule coordination, conflict detection, and evidence-grounded planning powered by local Google Gemma 4 on Ollama.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for local dev / Vite frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import hashlib
import secrets
from fastapi import Header

class EndpointUpdateRequest(BaseModel):
    base_url: Optional[str] = None
    model: Optional[str] = None

class AnalyzeRequest(BaseModel):
    document_ids: Optional[List[str]] = None

class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: Optional[bool] = False

class StudentProfile(BaseModel):
    name: str = "Alex Morgan"
    email: str = "student@campuspilot.demo"
    college: str = "Example University"
    course: str = "Computer Science"
    year: str = "2nd Year"
    semester: str = "Semester 3"
    weekly_study_goal: float = 20.0
    avatar_initials: str = "AM"
    is_demo: bool = True

# Demo credentials validation with SHA-256 salted hashing
DEMO_EMAIL = "student@campuspilot.demo"
DEMO_PASS_SALT = "campuspilot_secure_salt_2026"
DEMO_PASSWORD_HASH = hashlib.sha256((DEMO_PASS_SALT + "CampusDemo2026!").encode("utf-8")).hexdigest()

active_sessions: dict = {}
current_student_profile = StudentProfile()

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    """Authenticate student with demo credentials or active student account."""
    clean_email = req.email.strip().lower()
    input_hash = hashlib.sha256((DEMO_PASS_SALT + req.password).encode("utf-8")).hexdigest()

    # Verify credentials
    if clean_email != DEMO_EMAIL or input_hash != DEMO_PASSWORD_HASH:
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials. Please use the demo account: student@campuspilot.demo with password CampusDemo2026!"
        )

    # Issue secure session token
    token = secrets.token_hex(24)
    active_sessions[token] = {
        "email": clean_email,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "remember_me": req.remember_me
    }

    return {
        "success": True,
        "token": token,
        "user": data_store.get_profile()
    }

@app.get("/api/auth/me")
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Return the authenticated student profile."""
    # If no token provided or demo token
    token = authorization.replace("Bearer ", "").strip() if authorization else None
    if token and token not in active_sessions and token != "demo-token-alex":
        raise HTTPException(status_code=401, detail="Session expired or invalid token.")

    return {
        "authenticated": True,
        "user": data_store.get_profile()
    }

@app.post("/api/auth/logout")
async def logout(authorization: Optional[str] = Header(None)):
    """Revoke session token on logout."""
    if authorization:
        token = authorization.replace("Bearer ", "").strip()
        active_sessions.pop(token, None)
    return {"message": "Logged out successfully."}

@app.get("/api/profile")
async def get_profile():
    """Retrieve editable student profile from persistent store."""
    return data_store.get_profile()

@app.put("/api/profile")
async def update_profile(profile: StudentProfile):
    """Update and save student profile information persistently."""
    return data_store.update_profile(profile.model_dump())

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """System health check and Ollama Gemma 4 reachability status."""
    docs = data_store.get_documents()
    events = data_store.get_all_events()
    deadlines = data_store.get_all_deadlines()
    conflicts = ConflictEngine.run_all_checks(events, deadlines)

    reachable, err = await gemma_client.check_reachability()

    return HealthResponse(
        status="healthy" if reachable else "degraded",
        version="1.0.0",
        ollama_model=settings.OLLAMA_MODEL,
        ollama_base_url=settings.OLLAMA_BASE_URL,
        ollama_reachable=reachable,
        ollama_status_message=err,
        documents_count=len(docs),
        events_count=len(events) + len(deadlines),
        conflicts_count=len(conflicts)
    )

@app.get("/api/settings/test-ollama")
async def test_ollama_connection():
    """Verify live connectivity and inference with local Ollama Gemma 4."""
    return await gemma_client.test_connection()

@app.post("/api/settings/endpoint")
async def update_ollama_endpoint(req: EndpointUpdateRequest):
    """Runtime configuration for local Ollama base URL and model."""
    if req.base_url:
        clean_url = req.base_url.strip().rstrip("/")
        settings.OLLAMA_BASE_URL = clean_url
        gemma_client.base_url = clean_url
    if req.model:
        clean_model = req.model.strip()
        settings.OLLAMA_MODEL = clean_model
        gemma_client.model = clean_model

    test_result = await gemma_client.test_connection()
    return {
        "success": test_result.get("success", False),
        "base_url": settings.OLLAMA_BASE_URL,
        "model": settings.OLLAMA_MODEL,
        "details": test_result
    }

@app.post("/api/documents/upload", response_model=List[DocumentRecord])
async def upload_documents(files: List[UploadFile] = File(...)):
    """Upload multiple PDF or TXT documents and extract text with page boundaries."""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    saved_records: List[DocumentRecord] = []

    for file in files:
        filename = file.filename or "uploaded_document.pdf"
        file_bytes = await file.read()

        try:
            pages = DocumentParser.parse_document(file_bytes, filename)
        except PDFParserError as e:
            logger.error(f"Error parsing {filename}: {e}")
            raise HTTPException(status_code=400, detail=str(e))

        doc_id = f"doc_{uuid.uuid4().hex[:8]}"
        doc_record = DocumentRecord(
            id=doc_id,
            filename=filename,
            file_type=file.content_type or "application/octet-stream",
            page_count=len(pages),
            uploaded_at=datetime.utcnow().isoformat() + "Z",
            pages=pages,
            is_demo=False,
            extracted_events=[],
            extracted_deadlines=[]
        )

        data_store.add_document(doc_record)
        saved_records.append(doc_record)

    return saved_records

@app.get("/api/documents", response_model=List[DocumentRecord])
async def list_documents():
    """List all stored documents."""
    return data_store.get_documents()

@app.delete("/api/documents/{doc_id}")
async def delete_document(doc_id: str):
    """Delete a document by ID."""
    success = data_store.delete_document(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Document not found.")
    return {"message": "Document deleted successfully."}

@app.post("/api/analyze")
async def analyze_documents(req: Optional[AnalyzeRequest] = None):
    """
    Execute local Google Gemma 4 semantic extraction on documents to produce structured
    events, deadlines, eligibility criteria, and source evidence.
    """
    all_docs = data_store.get_documents()
    target_docs = all_docs
    if req and req.document_ids:
        target_docs = [d for d in all_docs if d.id in req.document_ids]

    if not target_docs:
        raise HTTPException(
            status_code=400,
            detail="No documents available to analyze. Please upload documents or load sample data."
        )

    reachable, err = await gemma_client.check_reachability()
    if not reachable:
        raise HTTPException(
            status_code=503,
            detail=f"Local Ollama Gemma 4 service is unavailable: {err}"
        )

    results: List[ExtractionResult] = []

    for doc in target_docs:
        pages_payload = [{"page_number": p.page_number, "text": p.text} for p in doc.pages]
        try:
            extraction = await gemma_client.extract_structured_data(doc.filename, pages_payload)
            data_store.update_document_extractions(doc.id, extraction.events, extraction.deadlines)
            results.append(extraction)
        except GemmaClientError as e:
            logger.error(f"Gemma 4 extraction error for {doc.filename}: {e}")
            raise HTTPException(status_code=502, detail=f"Gemma 4 inference failed: {str(e)}")

    events = data_store.get_all_events()
    deadlines = data_store.get_all_deadlines()
    conflicts = ConflictEngine.run_all_checks(events, deadlines)

    return {
        "success": True,
        "processed_documents": len(results),
        "total_events": len(events),
        "total_deadlines": len(deadlines),
        "conflicts_detected": len(conflicts),
        "results": results
    }

@app.get("/api/events")
async def get_all_records():
    """Get all extracted events and deadlines."""
    return {
        "events": data_store.get_all_events(),
        "deadlines": data_store.get_all_deadlines()
    }

@app.get("/api/conflicts", response_model=List[ConflictAlert])
async def get_conflicts():
    """Detect and return all deterministic schedule conflicts and uncertainties."""
    events = data_store.get_all_events()
    deadlines = data_store.get_all_deadlines()
    return ConflictEngine.run_all_checks(events, deadlines)

@app.post("/api/plan", response_model=PlanGenerationResponse)
async def generate_action_plan(req: PlanGenerationRequest):
    """
    Generate a personalized, feasibility-checked weekly action plan
    synthesizing student available hours, course priorities, and deadlines.
    """
    events = data_store.get_all_events()
    deadlines = data_store.get_all_deadlines()
    return await ActionPlanner.create_plan(events, deadlines, req)

@app.post("/api/ask", response_model=AskQuestionResponse)
async def ask_question(req: AskQuestionRequest):
    """Answer questions grounded in uploaded documents with precise source citations."""
    docs = data_store.get_documents()
    return await QAEngine.ask(req, docs)

@app.post("/api/demo/load")
async def load_demo_data():
    """1-Click loading of the 3 realistic campus demo documents with verified conflicts."""
    loaded = load_demo_documents()
    events = data_store.get_all_events()
    deadlines = data_store.get_all_deadlines()
    conflicts = ConflictEngine.run_all_checks(events, deadlines)

    return {
        "message": "Demo data loaded successfully.",
        "documents_loaded": len(loaded),
        "total_events": len(events),
        "total_deadlines": len(deadlines),
        "conflicts_detected": len(conflicts)
    }

@app.post("/api/demo/reset")
async def reset_demo_data():
    """Clear only demo documents and their extractions, preserving user uploads."""
    removed = data_store.clear_demo_documents()
    return {
        "message": f"Cleared {removed} demo documents successfully.",
        "removed_count": removed
    }

@app.post("/api/reset")
async def reset_all_data():
    """Clear all documents and extractions."""
    data_store.clear()
    return {"message": "All data cleared successfully."}
