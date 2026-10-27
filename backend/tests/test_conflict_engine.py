import pytest
from app.schemas import ExtractedEvent, ExtractedDeadline, RecordStatus, ConflictSeverity, ConflictType
from app.conflict_engine import ConflictEngine

def test_time_overlap_detected():
    # CS301 Lab: 14:00 - 17:00 on 2026-11-13
    ev1 = ExtractedEvent(
        id="ev_cs301",
        title="CS301 Lab Practical",
        date="2026-11-13",
        start_time="14:00",
        end_time="17:00",
        category="lab",
        status=RecordStatus.CONFIRMED
    )
    # Robotics Hackathon: 13:00 - 18:00 on 2026-11-13
    ev2 = ExtractedEvent(
        id="ev_hackathon",
        title="RoboPilot 2026 Hackathon",
        date="2026-11-13",
        start_time="13:00",
        end_time="18:00",
        category="hackathon",
        status=RecordStatus.CONFIRMED
    )

    conflicts = ConflictEngine.detect_time_overlaps([ev1, ev2])
    assert len(conflicts) == 1, "Should detect exactly one collision"
    assert conflicts[0].severity == ConflictSeverity.CRITICAL
    assert conflicts[0].conflict_type == ConflictType.TIME_OVERLAP
    assert "ev_cs301" in conflicts[0].event_ids
    assert "ev_hackathon" in conflicts[0].event_ids

def test_no_overlap_for_disjoint_times():
    ev1 = ExtractedEvent(
        id="ev_morning",
        title="Morning Lecture",
        date="2026-11-13",
        start_time="10:00",
        end_time="11:30",
        status=RecordStatus.CONFIRMED
    )
    ev2 = ExtractedEvent(
        id="ev_afternoon",
        title="Afternoon Lab",
        date="2026-11-13",
        start_time="14:00",
        end_time="17:00",
        status=RecordStatus.CONFIRMED
    )

    conflicts = ConflictEngine.detect_time_overlaps([ev1, ev2])
    assert len(conflicts) == 0, "Disjoint times must not collide"

def test_boundary_touching_intervals_no_conflict():
    """Events ending exactly when another begins (10:00-11:00 and 11:00-12:00) do NOT overlap."""
    ev1 = ExtractedEvent(
        id="ev_lecture",
        title="Mathematics Lecture",
        date="2026-11-10",
        start_time="10:00",
        end_time="11:00",
        status=RecordStatus.CONFIRMED
    )
    ev2 = ExtractedEvent(
        id="ev_lab",
        title="Physics Lab",
        date="2026-11-10",
        start_time="11:00",
        end_time="12:00",
        status=RecordStatus.CONFIRMED
    )

    conflicts = ConflictEngine.detect_time_overlaps([ev1, ev2])
    assert len(conflicts) == 0, "Boundary touching intervals [10:00, 11:00) and [11:00, 12:00) must not collide"

def test_duplicate_events_not_self_conflicting():
    """An event must never conflict with itself even if duplicated in input list."""
    ev1 = ExtractedEvent(
        id="ev_math",
        title="Mathematics Lecture",
        date="2026-11-10",
        start_time="10:00",
        end_time="11:00",
        location="Room A",
        status=RecordStatus.CONFIRMED
    )
    # Duplicate instance
    ev1_dup = ExtractedEvent(
        id="ev_math",
        title="Mathematics Lecture",
        date="2026-11-10",
        start_time="10:00",
        end_time="11:00",
        location="Room A",
        status=RecordStatus.CONFIRMED
    )

    conflicts = ConflictEngine.detect_time_overlaps([ev1, ev1_dup, ev1])
    assert len(conflicts) == 0, "Event must never conflict with itself"

def test_reversed_event_pairs_deduplication():
    """[ev_a, ev_b] and [ev_b, ev_a] yield exactly one deduplicated conflict alert."""
    ev_a = ExtractedEvent(
        id="ev_a",
        title="Coding Workshop",
        date="2026-11-10",
        start_time="10:00",
        end_time="11:30",
        status=RecordStatus.CONFIRMED
    )
    ev_b = ExtractedEvent(
        id="ev_b",
        title="Math Quiz",
        date="2026-11-10",
        start_time="11:00",
        end_time="12:00",
        status=RecordStatus.CONFIRMED
    )

    # Forward order
    conflicts_fwd = ConflictEngine.detect_time_overlaps([ev_a, ev_b])
    # Reverse order
    conflicts_rev = ConflictEngine.detect_time_overlaps([ev_b, ev_a])

    assert len(conflicts_fwd) == 1
    assert len(conflicts_rev) == 1
    assert conflicts_fwd[0].id == conflicts_rev[0].id
    assert set(conflicts_fwd[0].event_ids) == {"ev_a", "ev_b"}

def test_exact_overlap_duration_calculation():
    """Verify calculation of exact 30-minute collision."""
    ev_a = ExtractedEvent(
        id="ev_workshop",
        title="Coding Club Workshop",
        date="2026-11-10",
        start_time="10:00",
        end_time="11:30",
        status=RecordStatus.CONFIRMED
    )
    ev_b = ExtractedEvent(
        id="ev_quiz",
        title="Mathematics Quiz",
        date="2026-11-10",
        start_time="11:00",
        end_time="12:00",
        status=RecordStatus.CONFIRMED
    )

    conflicts = ConflictEngine.detect_time_overlaps([ev_a, ev_b])
    assert len(conflicts) == 1
    c = conflicts[0]
    assert "30-Min Overlap" in c.title or "30 minutes" in c.description
    assert "11:00 - 11:30" in c.description or "11:00 - 11:30" in (c.time_window or "")

def test_multiple_independent_conflicts():
    """Verify detection of multiple independent collisions across different dates and times."""
    # Tuesday conflict: 10:00-11:30 vs 11:00-12:00
    ev1 = ExtractedEvent(id="tue_1", title="Workshop", date="2026-11-10", start_time="10:00", end_time="11:30", status=RecordStatus.CONFIRMED)
    ev2 = ExtractedEvent(id="tue_2", title="Quiz", date="2026-11-10", start_time="11:00", end_time="12:00", status=RecordStatus.CONFIRMED)

    # Wednesday conflict: 14:00-16:00 vs 15:00-17:00
    ev3 = ExtractedEvent(id="wed_1", title="Networks Lab", date="2026-11-11", start_time="14:00", end_time="16:00", status=RecordStatus.CONFIRMED)
    ev4 = ExtractedEvent(id="wed_2", title="Guest Lecture", date="2026-11-11", start_time="15:00", end_time="17:00", status=RecordStatus.CONFIRMED)

    # Unrelated event without conflict on Thursday
    ev5 = ExtractedEvent(id="thu_1", title="Solo Study", date="2026-11-12", start_time="09:00", end_time="11:00", status=RecordStatus.CONFIRMED)

    conflicts = ConflictEngine.detect_time_overlaps([ev1, ev2, ev3, ev4, ev5])
    assert len(conflicts) == 2, "Must detect exactly 2 independent collisions"
    titles = [c.title for c in conflicts]
    assert any("Workshop" in t and "Quiz" in t for t in titles)
    assert any("Networks Lab" in t and "Guest Lecture" in t for t in titles)

def test_tight_deadline_crunch():
    dl1 = ExtractedDeadline(
        id="dl_scholarship",
        title="Merit Scholarship Application",
        due_date="2026-11-14",
        due_time="17:00",
        importance="high"
    )
    dl2 = ExtractedDeadline(
        id="dl_project",
        title="CS301 Final Project Deliverable",
        due_date="2026-11-14",
        due_time="23:59",
        importance="high"
    )

    tight = ConflictEngine.detect_tight_deadlines([dl1, dl2])
    assert len(tight) >= 1
    assert tight[0].conflict_type == ConflictType.TIGHT_DEADLINE
    assert tight[0].severity == ConflictSeverity.WARNING

def test_feasibility_score_calculation():
    # 20 hours required, 20 hours budget, 0 critical conflicts -> 100
    score = ConflictEngine.calculate_schedule_feasibility(
        total_required_hours=20.0,
        weekly_budget_hours=20.0,
        critical_conflicts_count=0
    )
    assert score == 100.0

    # 1 critical conflict -> 75
    score_with_conflict = ConflictEngine.calculate_schedule_feasibility(
        total_required_hours=20.0,
        weekly_budget_hours=20.0,
        critical_conflicts_count=1
    )
    assert score_with_conflict == 75.0
