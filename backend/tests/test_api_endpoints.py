import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.storage import data_store

client = TestClient(app)

def setup_function():
    data_store.clear()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "ollama_model" in data
    assert "gemma" in data["ollama_model"].lower()
    assert "ollama_base_url" in data
    assert "ollama_reachable" in data

def test_demo_load_and_conflicts():
    # 1. Load demo data
    load_resp = client.post("/api/demo/load")
    assert load_resp.status_code == 200
    load_data = load_resp.json()
    assert load_data["documents_loaded"] == 3
    assert load_data["conflicts_detected"] == 1

    # 2. Check documents list
    docs_resp = client.get("/api/documents")
    assert docs_resp.status_code == 200
    docs = docs_resp.json()
    assert len(docs) == 3
    assert all(d["is_demo"] is True for d in docs)

    # 3. Check conflicts endpoint
    conflicts_resp = client.get("/api/conflicts")
    assert conflicts_resp.status_code == 200
    conflicts = conflicts_resp.json()
    assert len(conflicts) == 1
    
    # Must identify the direct 30-minute collision on 2026-11-10 between Coding Workshop and Math Quiz
    c = conflicts[0]
    assert c["conflict_type"] == "time_overlap"
    assert "Coding Club Workshop" in c["title"]
    assert "Mathematics Quiz" in c["title"]
    assert "30-Min Overlap" in c["title"] or "30 minutes" in c["description"]

def test_clear_demo_data_preserves_user_uploads():
    """Verify that clearing demo data removes only demo fixtures and never deletes user-uploaded documents."""
    # 1. Upload a simulated user document
    fake_pdf_content = b"COURSE SYLLABUS\nCS101 Intro to Programming\nLecture: Monday 11:00-12:00"
    files = [
        ("files", ("User_Custom_Syllabus.txt", io.BytesIO(fake_pdf_content), "text/plain"))
    ]
    upload_resp = client.post("/api/documents/upload", files=files)
    assert upload_resp.status_code == 200
    uploaded_docs = upload_resp.json()
    assert len(uploaded_docs) == 1
    assert uploaded_docs[0]["filename"] == "User_Custom_Syllabus.txt"
    assert uploaded_docs[0]["is_demo"] is False

    # 2. Load demo data
    load_resp = client.post("/api/demo/load")
    assert load_resp.status_code == 200
    docs_resp = client.get("/api/documents")
    assert len(docs_resp.json()) == 4  # 1 user + 3 demo

    # 3. Clear demo data
    reset_resp = client.post("/api/demo/reset")
    assert reset_resp.status_code == 200
    assert reset_resp.json()["removed_count"] == 3

    # 4. Verify user upload is strictly preserved
    remaining_resp = client.get("/api/documents")
    remaining_docs = remaining_resp.json()
    assert len(remaining_docs) == 1
    assert remaining_docs[0]["filename"] == "User_Custom_Syllabus.txt"
    assert remaining_docs[0]["is_demo"] is False

def test_plan_generation():
    client.post("/api/demo/load")
    plan_payload = {
        "daily_budget_hours": {
            "Monday": 4.0,
            "Tuesday": 4.0,
            "Wednesday": 4.0,
            "Thursday": 4.0,
            "Friday": 4.0,
            "Saturday": 6.0,
            "Sunday": 6.0
        },
        "priorities": ["Academics & Mandatory Exams", "Coursework Projects & Deliverables"],
        "student_notes": "Focus on Database Systems assignment."
    }
    response = client.post("/api/plan", json=plan_payload)
    assert response.status_code == 200
    data = response.json()
    assert "weekly_schedule" in data
    assert len(data["weekly_schedule"]) > 0
    assert "feasibility_score" in data
    assert data["feasibility_score"] > 0
    assert "generator_type" in data
    assert data["generator_type"] in ("gemma4", "algorithmic")

def test_ask_grounded_question():
    client.post("/api/demo/load")
    qa_payload = {
        "question": "When is the Coding Club Workshop and what is the Mathematics Quiz clash?"
    }
    response = client.post("/api/ask", json=qa_payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert len(data["evidence"]) > 0
    assert any("Coding" in ev["text_snippet"] or "Quiz" in ev["text_snippet"] or "Workshop" in ev["text_snippet"] for ev in data["evidence"])
