import pytest
from pydantic import ValidationError
from app.schemas import ExtractedEvent, RecordStatus, SourceEvidence

def test_valid_event_schema():
    ev = ExtractedEvent(
        id="evt_123",
        title="Operating Systems Midterm",
        date="2026-11-02",
        start_time="10:00",
        end_time="11:30",
        category="exam",
        status=RecordStatus.CONFIRMED,
        evidence=[
            SourceEvidence(
                document_name="syllabus.pdf",
                page_number=1,
                text_snippet="Midterm exam on Nov 2"
            )
        ]
    )
    assert ev.id == "evt_123"
    assert ev.status == RecordStatus.CONFIRMED
    assert len(ev.evidence) == 1
    assert ev.evidence[0].page_number == 1

def test_invalid_status_enum():
    with pytest.raises(ValidationError):
        ExtractedEvent(
            id="evt_bad",
            title="Bad Event",
            status="invalid_status_string" # type: ignore
        )
