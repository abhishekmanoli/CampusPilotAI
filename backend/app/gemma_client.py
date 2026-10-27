import json
import logging
import re
import uuid
import httpx
from typing import Optional, List, Dict, Any, Tuple

from app.config import settings
from app.schemas import (
    ExtractionResult,
    ExtractedEvent,
    ExtractedDeadline,
    SourceEvidence,
    RecordStatus,
    ConflictAlert,
    ActionPlanItem,
    PlanGenerationResponse,
    AskQuestionResponse,
    DocumentRecord,
)

logger = logging.getLogger(__name__)

class GemmaClientError(Exception):
    """Custom exception for Gemma 4 / Ollama inference issues."""
    pass

class GemmaClient:
    """Client for Google Gemma 4 running locally via Ollama."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        self.model = model or settings.OLLAMA_MODEL

    def is_configured(self) -> bool:
        """Local Ollama is always considered configured as it requires no cloud API key."""
        return True

    async def check_reachability(self) -> Tuple[bool, Optional[str]]:
        """Verify if local Ollama server is running and the configured model is available."""
        tags_url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(tags_url)
                if res.status_code != 200:
                    return False, f"Ollama returned HTTP {res.status_code}: {res.text}"
                data = res.json()
                models = [m.get("name", "") for m in data.get("models", [])]
                # Match full name (e.g. gemma4:e4b) or base tag
                matched = any(self.model in m or m.startswith(self.model) for m in models)
                if not matched:
                    return False, f"Model '{self.model}' not found in Ollama. Available: {', '.join(models) or 'None'}"
                return True, None
        except httpx.ConnectError:
            return False, f"Cannot connect to Ollama at {self.base_url}. Ensure Ollama is running (`ollama serve`)."
        except Exception as e:
            return False, f"Error checking Ollama reachability: {str(e)}"

    async def generate_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        json_format: bool = False,
        temperature: float = 0.1
    ) -> str:
        """Call Ollama /api/chat endpoint."""
        chat_url = f"{self.base_url}/api/chat"

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        options = {
            "temperature": temperature,
            "num_predict": 350,
        }
        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": options
        }

        if json_format:
            payload["format"] = "json"

        # Timeout: allow up to 35s for local on-device inference before graceful fallback
        async with httpx.AsyncClient(timeout=35.0) as client:
            try:
                response = await client.post(chat_url, json=payload, headers={"Content-Type": "application/json"})
            except httpx.ConnectError:
                raise GemmaClientError(
                    f"Connection refused at {self.base_url}. Ensure Ollama is running (`ollama serve`)."
                )
            except httpx.TimeoutException:
                raise GemmaClientError(
                    f"Inference timed out after 35s on model '{self.model}'. Ollama may be under heavy load."
                )
            except httpx.RequestError as exc:
                raise GemmaClientError(f"Network error contacting Ollama at {chat_url}: {exc}")

            if response.status_code != 200:
                raise GemmaClientError(
                    f"Ollama returned HTTP {response.status_code}: {response.text}"
                )

            data = response.json()
            message = data.get("message", {})
            content = message.get("content", "")

            if not content:
                # If thinking model placed reasoning or JSON in thinking
                content = message.get("thinking", "")

            if not content:
                raise GemmaClientError(f"Empty content returned by Ollama model '{self.model}': {data}")

            return content.strip()

    def _extract_json_snippet(self, text: str) -> str:
        """Strip markdown fences and extract raw JSON."""
        text = text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        first_curly = text.find("{")
        last_curly = text.rfind("}")
        if first_curly != -1 and last_curly != -1 and last_curly > first_curly:
            return text[first_curly:last_curly+1]
        first_sq = text.find("[")
        last_sq = text.rfind("]")
        if first_sq != -1 and last_sq != -1 and last_sq > first_sq:
            return text[first_sq:last_sq+1]
        return text

    async def test_connection(self) -> Dict[str, Any]:
        """Verify the local Ollama Gemma 4 endpoint with a live round-trip test."""
        reachable, err = await self.check_reachability()
        if not reachable:
            return {
                "success": False,
                "error": err,
                "model": self.model,
                "base_url": self.base_url
            }

        test_prompt = "Respond with exactly the single word: OK"
        try:
            output = await self.generate_text(prompt=test_prompt, temperature=0.0)
            return {
                "success": True,
                "model": self.model,
                "base_url": self.base_url,
                "response": output.strip()
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "model": self.model,
                "base_url": self.base_url
            }

    async def extract_structured_data(self, filename: str, pages: List[Dict[str, Any]]) -> ExtractionResult:
        """
        Use local Gemma 4 to extract events, dates, deadlines, locations, eligibility,
        required actions, and uncertainties from document pages with source citations.
        """
        formatted_pages = []
        for p in pages:
            page_num = p.get("page_number", 1)
            content = p.get("text", "")
            formatted_pages.append(f"--- [Document: {filename} | Page {page_num}] ---\n{content}")
        full_text = "\n\n".join(formatted_pages)

        system_instruction = (
            "You are CampusPilot AI, an expert academic document parsing intelligence powered by Google Gemma 4. "
            "Your job is to extract events, deadlines, dates, times, locations, eligibility rules, required actions, "
            "and uncertainties from college documents with 100% fidelity to the text. "
            "STRICT RULES:\n"
            "1. NEVER invent or hallucinate any dates, locations, requirements, or deadlines.\n"
            "2. For every extracted item, provide the EXACT source evidence (document_name, page_number, exact text_snippet).\n"
            "3. If a date or time is missing, vague, or tentative, mark status='unresolved' and record the uncertainty.\n"
            "4. Return ONLY valid JSON matching the requested schema."
        )

        prompt = f"""Extract all events, academic deadlines, exams, club activities, and requirements from the following document text.

Document Name: {filename}

Document Content:
{full_text}

Output JSON format strictly conforming to:
{{
  "document_name": "{filename}",
  "events": [
    {{
      "title": "string",
      "description": "string",
      "date": "YYYY-MM-DD or null",
      "start_time": "HH:MM in 24hr or null",
      "end_time": "HH:MM in 24hr or null",
      "location": "string or null",
      "category": "exam | lab | hackathon | club | scholarship | lecture | workshop | other",
      "eligibility": ["string"],
      "required_actions": ["string"],
      "uncertainties": ["string"],
      "status": "confirmed | inferred | unresolved",
      "evidence": [
        {{
          "document_name": "{filename}",
          "page_number": 1,
          "text_snippet": "exact quote from the document text"
        }}
      ]
    }}
  ],
  "deadlines": [
    {{
      "title": "string",
      "due_date": "YYYY-MM-DD",
      "due_time": "HH:MM or null",
      "importance": "high | medium | low",
      "required_actions": ["string"],
      "eligibility": ["string"],
      "uncertainties": ["string"],
      "status": "confirmed | inferred | unresolved",
      "evidence": [
        {{
          "document_name": "{filename}",
          "page_number": 1,
          "text_snippet": "exact quote from the text"
        }}
      ]
    }}
  ],
  "general_notes": ["string"],
  "uncertainties": ["string"]
}}
"""

        raw_text = await self.generate_text(
            prompt=prompt,
            system_instruction=system_instruction,
            json_format=True,
            temperature=0.1
        )
        cleaned_json = self._extract_json_snippet(raw_text)

        try:
            parsed = json.loads(cleaned_json)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from Gemma 4: {e}. Raw response: {raw_text}")
            raise GemmaClientError(f"Model output did not contain valid JSON: {str(e)}")

        # Build models and ensure unique IDs
        events = []
        for item in parsed.get("events", []):
            ev_id = f"evt_{uuid.uuid4().hex[:8]}"
            status_val = str(item.get("status", "confirmed")).lower()
            if status_val not in ("confirmed", "inferred", "unresolved"):
                status_val = "confirmed"
            
            evidence_list = []
            for ev in item.get("evidence", []):
                evidence_list.append(
                    SourceEvidence(
                        document_name=ev.get("document_name", filename),
                        page_number=int(ev.get("page_number", 1)),
                        text_snippet=str(ev.get("text_snippet", ""))
                    )
                )

            events.append(
                ExtractedEvent(
                    id=ev_id,
                    title=str(item.get("title", "Untitled Event")),
                    description=item.get("description"),
                    date=item.get("date"),
                    start_time=item.get("start_time"),
                    end_time=item.get("end_time"),
                    location=item.get("location"),
                    category=str(item.get("category", "general")),
                    eligibility=[str(x) for x in item.get("eligibility", [])],
                    required_actions=[str(x) for x in item.get("required_actions", [])],
                    uncertainties=[str(x) for x in item.get("uncertainties", [])],
                    status=RecordStatus(status_val),
                    evidence=evidence_list
                )
            )

        deadlines = []
        for dl in parsed.get("deadlines", []):
            dl_id = f"dl_{uuid.uuid4().hex[:8]}"
            status_val = str(dl.get("status", "confirmed")).lower()
            if status_val not in ("confirmed", "inferred", "unresolved"):
                status_val = "confirmed"

            evidence_list = []
            for ev in dl.get("evidence", []):
                evidence_list.append(
                    SourceEvidence(
                        document_name=ev.get("document_name", filename),
                        page_number=int(ev.get("page_number", 1)),
                        text_snippet=str(ev.get("text_snippet", ""))
                    )
                )

            deadlines.append(
                ExtractedDeadline(
                    id=dl_id,
                    title=str(dl.get("title", "Untitled Deadline")),
                    due_date=str(dl.get("due_date", "2026-11-01")),
                    due_time=dl.get("due_time"),
                    importance=str(dl.get("importance", "medium")),
                    required_actions=[str(x) for x in dl.get("required_actions", [])],
                    eligibility=[str(x) for x in dl.get("eligibility", [])],
                    uncertainties=[str(x) for x in dl.get("uncertainties", [])],
                    status=RecordStatus(status_val),
                    evidence=evidence_list
                )
            )

        return ExtractionResult(
            document_name=filename,
            events=events,
            deadlines=deadlines,
            general_notes=[str(x) for x in parsed.get("general_notes", [])],
            uncertainties=[str(x) for x in parsed.get("uncertainties", [])]
        )

    async def answer_grounded_question(self, question: str, documents: List[DocumentRecord]) -> AskQuestionResponse:
        """
        Answer a user question grounded strictly in uploaded documents,
        providing source references and distinguishing confirmed facts,
        inferred suggestions, and unresolved ambiguities.
        """
        # Select top relevant document snippets instead of dumping entire documents verbatim (keeps CPU inference fast)
        words = [w.lower() for w in re.findall(r"\w+", question) if len(w) >= 3]
        doc_snippets = []
        for doc in documents:
            for p in doc.pages:
                lines = [l.strip() for l in p.text.splitlines() if len(l.strip()) > 10]
                scored = []
                for line in lines:
                    match_count = sum(1 for w in words if w in line.lower())
                    scored.append((match_count, line))
                scored.sort(key=lambda x: x[0], reverse=True)
                chosen_lines = [s[1] for s in scored[:4]] if lines else []
                if chosen_lines:
                    doc_snippets.append(f"[[Document: {doc.filename} | Page: {p.page_number}]]\n" + "\n".join(chosen_lines))
        
        context_str = "\n\n".join(doc_snippets) if doc_snippets else "\n\n".join(
            [f"[[Document: {d.filename} | Page: 1]]\n{d.pages[0].text[:400] if d.pages else ''}" for d in documents[:3]]
        )

        system_instruction = (
            "You are CampusPilot AI's grounded question answering engine powered by Google Gemma 4. "
            "You answer student questions strictly based on the provided document excerpts. "
            "RULES:\n"
            "1. ONLY answer with information present in the source excerpts.\n"
            "2. If an answer cannot be determined from the excerpts, explicitly state that the documents do not specify it.\n"
            "3. Clearly separate Confirmed Facts, Inferred Suggestions, and Unresolved Ambiguities.\n"
            "4. Return strict JSON. Do NOT include thinking tags or conversational prose."
        )

        prompt = f"""Answer the student's question using ONLY the provided document excerpts.

Question: {question}

Document Excerpts:
{context_str}

Return JSON strictly in this format:
{{
  "answer": "Detailed comprehensive answer citing documents and pages",
  "confirmed_facts": ["Fact 1 with page citation", "Fact 2"],
  "inferred_suggestions": ["Suggestion 1 based on timetable logic"],
  "unresolved_ambiguities": ["Missing information or conflict noted"],
  "evidence": [
    {{
      "document_name": "filename.pdf",
      "page_number": 1,
      "text_snippet": "Exact quote"
    }}
  ]
}}
"""

        raw_text = await self.generate_text(
            prompt=prompt,
            system_instruction=system_instruction,
            json_format=True,
            temperature=0.1
        )
        cleaned_json = self._extract_json_snippet(raw_text)

        try:
            parsed = json.loads(cleaned_json)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse QA response from Gemma 4: {e}")
            raise GemmaClientError(f"Gemma 4 QA response did not contain valid JSON: {str(e)}")

        evidence_items = [
            SourceEvidence(
                document_name=str(ev.get("document_name", "Unknown")),
                page_number=int(ev.get("page_number", 1)),
                text_snippet=str(ev.get("text_snippet", ""))
            )
            for ev in parsed.get("evidence", [])
        ]

        return AskQuestionResponse(
            answer=str(parsed.get("answer", "No answer could be deduced from the documents.")),
            evidence=evidence_items,
            confirmed_facts=[str(x) for x in parsed.get("confirmed_facts", [])],
            inferred_suggestions=[str(x) for x in parsed.get("inferred_suggestions", [])],
            unresolved_ambiguities=[str(x) for x in parsed.get("unresolved_ambiguities", [])],
            model_used=f"Ollama/{self.model}"
        )

gemma_client = GemmaClient()
