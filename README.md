# CampusPilot AI — GDG Track 1: Best Use of Gemma 4

> **CampusPilot AI** converts scattered university documents (exam timetables, club notices, scholarship criteria, and syllabi) into a unified, evidence-backed action plan. Powered by **local Google Gemma 4 on Ollama (`gemma4:e4b`)** for privacy-first on-device semantic intelligence, coupled with **pure deterministic code** for mathematical scheduling and conflict verification.

[![GDG Track 1](https://img.shields.io/badge/GDG%20Track%201-Best%20Use%20of%20Gemma%204-0ea5e9?style=for-the-badge)](https://developers.google.com)
[![Model](https://img.shields.io/badge/Model-Google%20Gemma%204%20(gemma4%3Ae4b%20Local)-10b981?style=for-the-badge)](https://ollama.com)
[![Inference](https://img.shields.io/badge/Inference-Local%20Ollama%20(11434)-emerald?style=for-the-badge)](http://localhost:11434)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%2B%20PyMuPDF-0284c7?style=for-the-badge)](https://fastapi.tiangolo.com)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20Tailwind-38bdf8?style=for-the-badge)](https://react.dev)
[![Tests](https://img.shields.io/badge/Tests-13%20Passed%20(Pytest%20%2B%20Smoke)-emerald?style=for-the-badge)](https://pytest.org)

---

## 1. System Architecture

```
                    ┌────────────────────────────────────────────────────────┐
                    │     CampusPilot Desktop Dashboard (React + Tailwind)   │
                    └───────────────────────────┬────────────────────────────┘
                                                │ REST API (JSON / Multipart)
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                 FastAPI Backend Server                                   │
│                                                                                          │
│  ┌─────────────────────────┐   ┌───────────────────────────┐   ┌──────────────────────┐  │
│  │     PyMuPDF Parser      │   │   Local Ollama Gemma 4    │   │  Deterministic       │  │
│  │ (Page & Snippet Tracker)│   │  (/api/chat - gemma4:e4b) │   │  Conflict Engine     │  │
│  └────────────┬────────────┘   └─────────────┬─────────────┘   └───────────┬──────────┘  │
│               │                              │                             │             │
│               ▼                              ▼                             ▼             │
│  ┌─────────────────────────┐   ┌───────────────────────────┐   ┌──────────────────────┐  │
│  │ Verbatim Document Pages │──▶│ Strict Pydantic Validation│──▶│ Mathematical Overlap │  │
│  │   (PDF / TXT streams)   │   │  & JSON Repair Pipeline   │   │ $[s_A,e_A)\cap[s_B,e_B)│ │
│  └─────────────────────────┘   └─────────────┬─────────────┘   └───────────┬──────────┘  │
│                                              ▼                             │             │
│                                ┌───────────────────────────┐               │             │
│                                │   Synthesized Action Plan │◀──────────────┘             │
│                                │    & Grounded QA Engine   │                             │
│                                └─────────────┬─────────────┘                             │
│                                              ▼                                           │
│                                ┌───────────────────────────┐                             │
│                                │   Persistent JSON Store   │                             │
│                                └───────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Technical Innovations & AI Rules

### Local Gemma 4 on Ollama
- **Model**: `gemma4:e4b` running locally via Ollama at `http://localhost:11434`.
- **Zero Cloud Dependence**: No Gemini or cloud API key is required. All inference executes locally on-device for maximum student privacy.
- **Backend Isolation**: All model calls happen strictly on the FastAPI server via Ollama's `/api/chat` endpoint using JSON format mode.
- **Zero Hallucination Protocol**: Gemma 4 extracts structured records with exact verbatim source quotes, document names, and page numbers.
- **Graceful Error Recovery**: If Ollama is offline or uninstalled, the backend returns clear HTTP 503 error messages advising the user to run `ollama serve`.

### Tri-Fold Clarity Distinction
Every insight in CampusPilot AI is strictly classified into one of three visual channels:
1. **Confirmed Facts** (Emerald): Verbatim claims backed by direct document and page citations.
2. **Inferred Suggestions** (Electric Blue): Contextual study recommendations synthesized by Gemma 4.
3. **Unresolved Ambiguities** (Amber): Tentative items flagged directly from the text (e.g., "Room TBA", "Pending Dean approval").

### Mathematical Deterministic Conflict Engine
AI models are prone to hallucinating date arithmetic and schedule overlaps. CampusPilot AI uses **pure deterministic Python algorithms** to:
- Detect exact interval overlaps: $\max(\text{start}_A, \text{start}_B) < \min(\text{end}_A, \text{end}_B)$ on the same date.
- Flag deadline crunches: High-stakes deadlines due within 24 to 48 hours of each other.
- Compute schedule feasibility score ($0 - 100$) based on student weekly study budget vs. required prep hours.

---

## 3. Realistic Demo Documents & Constructed Conflict

CampusPilot AI includes three coherent, authentic sample documents with a deliberately engineered real-world dilemma:

1. **`Weekly_Class_Timetable.pdf`**:
   - **Database Systems**: Monday, November 9, 2026 (09:00 – 10:00 AM) at Lecture Hall 1.
   - **Mathematics Lecture**: Tuesday, November 10, 2026 (14:00 – 15:00) at Science Wing Room B.
   - **Computer Networks Lab**: Wednesday, November 11, 2026 (14:00 – 15:00) at Engineering Lab 4.
2. **`Coding_Club_Workshop_Notice.pdf`**:
   - **Coding Club Workshop**: Tuesday, November 10, 2026 (10:00 – 11:30 AM) at Computer Lab 2.
   - **Mathematics Quiz (Midterm Prep)**: Tuesday, November 10, 2026 (11:00 AM – 12:00 PM) at Room 204.
   - **Intentional 30-Minute Clash**: Between 11:00 AM and 11:30 AM, the hands-on coding workshop directly collides with the mandatory mathematics quiz!
   - **Workshop Registration Deadline**: Monday, November 9, 2026 at 18:00 (6:00 PM).
3. **`Assignment_Notice_Database_Systems.pdf`**:
   - **Database Systems Assignment 2**: Due Friday, November 13, 2026 at 17:00 (5:00 PM). Estimated prep time: 4 hours.

---

## 4. Student Authentication & Demo Credentials

CampusPilot AI features a dedicated, minimalist Halloween-themed login screen and persistent student profile:

- **Demo Student Email**: `student@campuspilot.demo`
- **Demo Password**: `CampusDemo2026!`
- *(Or click **"Try Demo Account (One-Click)"** on the sign-in screen)*

### Authentication Architecture & Limitations
- **Security**: Passwords validated server-side using SHA-256 with a unique server salt. Session tokens issued via secure pseudo-random hex generators (`secrets.token_hex`).
- **Persistence**: Student profile edits and task completion statuses persist both in browser `localStorage` and on disk via `backend/data/store.json`.
- **Limitation Notice**: Built for local single-student desktop companion operation. Multi-tenant multi-user PostgreSQL storage is out of scope for this offline hackathon build.

---

## 4. Setup & Running Instructions

### Prerequisites
- **Ollama** running locally on your Mac (`ollama serve`) with `gemma4:e4b` pulled (`ollama run gemma4:e4b`).
- **Python 3.9+**
- **Node.js 18+** and **npm**

### Step 1: Verify Local Ollama
```bash
# Check that Ollama is running and gemma4:e4b is available
curl http://localhost:11434/api/tags
```

### Step 2: Configure Backend
```bash
cd CampusPilot_ai

# Setup Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate  # On Windows: backend\venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt
```

Verify `backend/.env`:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b
```

### Step 3: Configure Frontend
```bash
cd frontend
npm install
npm run build   # Verifies TypeScript types & Vite bundling
cd ..
```

### Step 4: Launch the Application
Run in two terminal windows:

**Terminal 1 (FastAPI Backend):**
```bash
cd CampusPilot_ai
PYTHONPATH=backend backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 (React Frontend):**
```bash
cd CampusPilot_ai/frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 5. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, Ollama reachability, model (`gemma4:e4b`) status |
| `GET` | `/api/settings/test-ollama` | Run live test round-trip inference with local Ollama |
| `POST` | `/api/settings/endpoint` | Update Ollama base URL or model tag at runtime |
| `POST` | `/api/documents/upload` | Upload multiple PDF or TXT files with PyMuPDF page tracking |
| `GET` | `/api/documents` | List all uploaded documents with page metrics |
| `DELETE` | `/api/documents/{id}` | Delete a document |
| `POST` | `/api/analyze` | Trigger local Gemma 4 structured extraction via Ollama |
| `GET` | `/api/events` | Retrieve extracted events and deadlines |
| `GET` | `/api/conflicts` | Run deterministic conflict engine on active records |
| `POST` | `/api/plan` | Generate personalized action plan using student budget |
| `POST` | `/api/ask` | Evidence-grounded Q&A with document & page citations |
| `POST` | `/api/demo/load` | 1-Click loading of the 3 realistic campus demo documents |

---

## 6. Automated Testing

### Backend Unit & Integration Tests (All 13 Passed)
```bash
PYTHONPATH=backend backend/venv/bin/pytest backend/tests/ -v
```
All 13 tests pass, including live local plan synthesis and grounded Q&A with `gemma4:e4b`.

### Frontend Smoke Test
```bash
cd frontend
npm run test:smoke
```
Verifies bundle generation, asset integrity, and index.html mount structure.
