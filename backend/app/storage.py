import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from app.config import settings
from app.schemas import DocumentRecord, ExtractedEvent, ExtractedDeadline

logger = logging.getLogger(__name__)

DEFAULT_STUDENT_PROFILE = {
    "name": "Alex Morgan",
    "email": "student@campuspilot.demo",
    "college": "Example University",
    "course": "Computer Science",
    "year": "2nd Year",
    "semester": "Semester 3",
    "weekly_study_goal": 20.0,
    "avatar_initials": "AM",
    "is_demo": True
}

class DataStore:
    """Thread-safe persistent JSON document and record store."""

    def __init__(self, storage_path: Optional[Path] = None):
        self.storage_path = storage_path or (settings.DATA_DIR / "store.json")
        self.documents: Dict[str, DocumentRecord] = {}
        self.student_profile: Dict[str, Any] = dict(DEFAULT_STUDENT_PROFILE)
        self.completed_tasks: Dict[str, bool] = {}
        self._load()

    def _load(self):
        if not self.storage_path.exists():
            return
        try:
            with open(self.storage_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data.get("documents", []):
                    doc = DocumentRecord.model_validate(item)
                    self.documents[doc.id] = doc
                if "student_profile" in data and isinstance(data["student_profile"], dict):
                    self.student_profile.update(data["student_profile"])
                if "completed_tasks" in data and isinstance(data["completed_tasks"], dict):
                    self.completed_tasks.update(data["completed_tasks"])
        except Exception as e:
            logger.error(f"Failed to load data store from {self.storage_path}: {e}")

    def save(self):
        try:
            self.storage_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "documents": [doc.model_dump() for doc in self.documents.values()],
                        "student_profile": self.student_profile,
                        "completed_tasks": self.completed_tasks
                    },
                    f,
                    indent=2
                )
        except Exception as e:
            logger.error(f"Failed to save data store to {self.storage_path}: {e}")

    def add_document(self, doc: DocumentRecord):
        self.documents[doc.id] = doc
        self.save()

    def get_documents(self) -> List[DocumentRecord]:
        return list(self.documents.values())

    def get_document(self, doc_id: str) -> Optional[DocumentRecord]:
        return self.documents.get(doc_id)

    def delete_document(self, doc_id: str) -> bool:
        if doc_id in self.documents:
            del self.documents[doc_id]
            self.save()
            return True
        return False

    def clear_demo_documents(self) -> int:
        """Removes only documents flagged as is_demo=True, preserving user uploads."""
        demo_ids = [doc.id for doc in self.documents.values() if doc.is_demo]
        for did in demo_ids:
            del self.documents[did]
        if demo_ids:
            self.save()
        return len(demo_ids)

    def get_all_events(self) -> List[ExtractedEvent]:
        events = []
        for doc in self.documents.values():
            events.extend(doc.extracted_events)
        return events

    def get_all_deadlines(self) -> List[ExtractedDeadline]:
        deadlines = []
        for doc in self.documents.values():
            deadlines.extend(doc.extracted_deadlines)
        return deadlines

    def update_document_extractions(
        self, doc_id: str, events: List[ExtractedEvent], deadlines: List[ExtractedDeadline]
    ):
        if doc_id in self.documents:
            self.documents[doc_id].extracted_events = events
            self.documents[doc_id].extracted_deadlines = deadlines
            self.save()

    def get_profile(self) -> Dict[str, Any]:
        return dict(self.student_profile)

    def update_profile(self, profile: Dict[str, Any]) -> Dict[str, Any]:
        self.student_profile.update(profile)
        self.save()
        return dict(self.student_profile)

    def clear(self):
        self.documents.clear()
        self.completed_tasks.clear()
        self.save()

data_store = DataStore()
