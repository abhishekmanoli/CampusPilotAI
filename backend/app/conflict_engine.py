import hashlib
import uuid
from datetime import datetime, date, time
from typing import List, Dict, Tuple, Optional, Set
from app.schemas import (
    ExtractedEvent,
    ExtractedDeadline,
    ConflictAlert,
    ConflictSeverity,
    ConflictType,
    RecordStatus
)

class ConflictEngine:
    """
    Deterministic conflict detection and schedule feasibility engine.
    Uses pure algorithmic verification without hallucination.
    """

    @staticmethod
    def _parse_time(time_str: Optional[str]) -> Optional[time]:
        """Convert HH:MM string to time object."""
        if not time_str:
            return None
        clean_time = time_str.strip()
        for fmt in ("%H:%M", "%H:%M:%S", "%I:%M %p", "%I:%M%p"):
            try:
                return datetime.strptime(clean_time, fmt).time()
            except ValueError:
                continue
        return None

    @staticmethod
    def _time_to_minutes(t: time) -> int:
        return t.hour * 60 + t.minute

    @classmethod
    def detect_time_overlaps(cls, events: List[ExtractedEvent]) -> List[ConflictAlert]:
        """
        Check for deterministic time interval overlap:
        [start_A, end_A) intersects with [start_B, end_B) on the same date.
        
        Guarantees:
        - Self-conflicts are rejected (event cannot conflict with itself).
        - Duplicate event pairs and reversed pairs are deduplicated.
        - Boundary-touching intervals (e.g. 10:00-11:00 and 11:00-12:00) do NOT conflict.
        - Exact overlap duration in minutes is computed.
        """
        conflicts: List[ConflictAlert] = []
        seen_pairs: Set[Tuple[str, str]] = set()
        seen_content_keys: Set[Tuple[str, str, str]] = set()

        # Group events by valid date
        by_date: Dict[str, List[ExtractedEvent]] = {}
        for ev in events:
            if ev.date and ev.date.strip():
                by_date.setdefault(ev.date.strip(), []).append(ev)

        for d_str, day_events in by_date.items():
            if len(day_events) < 2:
                continue

            for i in range(len(day_events)):
                for j in range(i + 1, len(day_events)):
                    ev_a = day_events[i]
                    ev_b = day_events[j]

                    # 1. Do not flag an event as conflicting with itself
                    if ev_a.id == ev_b.id:
                        continue

                    # Content-level identity check to prevent duplicate identical records conflicting
                    title_a = ev_a.title.strip()
                    title_b = ev_b.title.strip()
                    if (
                        title_a.lower() == title_b.lower()
                        and ev_a.start_time == ev_b.start_time
                        and ev_a.end_time == ev_b.end_time
                        and ev_a.location == ev_b.location
                    ):
                        continue

                    # 2. Normalize pair key (independent of order ev_a vs ev_b)
                    pair_key = tuple(sorted([ev_a.id, ev_b.id]))
                    content_key = tuple(sorted([title_a.lower(), title_b.lower()])) + (d_str,)

                    if pair_key in seen_pairs or content_key in seen_content_keys:
                        continue

                    t_start_a = cls._parse_time(ev_a.start_time)
                    t_end_a = cls._parse_time(ev_a.end_time)
                    t_start_b = cls._parse_time(ev_b.start_time)
                    t_end_b = cls._parse_time(ev_b.end_time)

                    # 3. Both events have explicit start and end times
                    if t_start_a and t_end_a and t_start_b and t_end_b:
                        m_start_a = cls._time_to_minutes(t_start_a)
                        m_end_a = cls._time_to_minutes(t_end_a)
                        m_start_b = cls._time_to_minutes(t_start_b)
                        m_end_b = cls._time_to_minutes(t_end_b)

                        # Overlap of half-open intervals [sA, eA) and [sB, eB):
                        # max(start_a, start_b) < min(end_a, end_b)
                        overlap_start = max(m_start_a, m_start_b)
                        overlap_end = min(m_end_a, m_end_b)

                        # Boundary-touching check: overlap_start < overlap_end strictly required
                        if overlap_start < overlap_end:
                            overlap_minutes = overlap_end - overlap_start
                            overlap_start_str = f"{overlap_start // 60:02d}:{overlap_start % 60:02d}"
                            overlap_end_str = f"{overlap_end // 60:02d}:{overlap_end % 60:02d}"

                            stable_hash = hashlib.sha256(
                                f"{content_key[0]}_{content_key[1]}_{d_str}_{overlap_start}_{overlap_end}".encode()
                            ).hexdigest()[:12]

                            conflicts.append(
                                ConflictAlert(
                                    id=f"conf_overlap_{stable_hash}",
                                    conflict_type=ConflictType.TIME_OVERLAP,
                                    severity=ConflictSeverity.CRITICAL,
                                    title=f"Direct Schedule Collision: {title_a} & {title_b} ({overlap_minutes}-Min Overlap)",
                                    description=(
                                        f"'{title_a}' ({ev_a.start_time}-{ev_a.end_time}) and "
                                        f"'{title_b}' ({ev_b.start_time}-{ev_b.end_time}) are scheduled on "
                                        f"{d_str} with an overlap of {overlap_minutes} minutes "
                                        f"({overlap_start_str} - {overlap_end_str})."
                                    ),
                                    event_ids=[ev_a.id, ev_b.id],
                                    event_titles=[title_a, title_b],
                                    time_window=f"{d_str} ({overlap_start_str} - {overlap_end_str})",
                                    suggested_resolution=(
                                        f"Conflict detected between {ev_a.category} and {ev_b.category}. "
                                        f"Request early submission, makeup session, or reschedule one commitment."
                                    ),
                                    is_deterministic=True
                                )
                            )
                            seen_pairs.add(pair_key)
                            seen_content_keys.add(content_key)

                    # 4. If start times are identical and at least one is missing an end time
                    elif t_start_a and t_start_b and t_start_a == t_start_b and (t_end_a is None or t_end_b is None):
                        stable_hash = hashlib.sha256(
                            f"{content_key[0]}_{content_key[1]}_{d_str}_same_start".encode()
                        ).hexdigest()[:12]

                        conflicts.append(
                            ConflictAlert(
                                id=f"conf_same_time_{stable_hash}",
                                conflict_type=ConflictType.TIME_OVERLAP,
                                severity=ConflictSeverity.CRITICAL,
                                title=f"Concurrent Start Time: {title_a} & {title_b}",
                                description=f"Both events begin at {ev_a.start_time} on {d_str}.",
                                event_ids=[ev_a.id, ev_b.id],
                                event_titles=[title_a, title_b],
                                time_window=f"{d_str} @ {ev_a.start_time}",
                                suggested_resolution="Prioritize mandatory graded sessions or contact advisors.",
                                is_deterministic=True
                            )
                        )
                        seen_pairs.add(pair_key)
                        seen_content_keys.add(content_key)

        return conflicts

    @classmethod
    def detect_tight_deadlines(cls, deadlines: List[ExtractedDeadline]) -> List[ConflictAlert]:
        """
        Detect multiple high-priority deadlines occurring within 24 to 48 hours.
        Deduplicates deadline pairs.
        """
        conflicts: List[ConflictAlert] = []
        seen_dl_pairs: Set[Tuple[str, str]] = set()
        seen_content_pairs: Set[Tuple[str, str]] = set()
        parsed_deadlines: List[Tuple[date, ExtractedDeadline]] = []

        for dl in deadlines:
            if dl.due_date:
                try:
                    d = datetime.strptime(dl.due_date.strip(), "%Y-%m-%d").date()
                    parsed_deadlines.append((d, dl))
                except ValueError:
                    continue

        parsed_deadlines.sort(key=lambda x: x[0])

        for i in range(len(parsed_deadlines)):
            for j in range(i + 1, len(parsed_deadlines)):
                d_a, dl_a = parsed_deadlines[i]
                d_b, dl_b = parsed_deadlines[j]

                if dl_a.id == dl_b.id:
                    continue

                title_a = dl_a.title.strip()
                title_b = dl_b.title.strip()

                pair_key = tuple(sorted([dl_a.id, dl_b.id]))
                content_key = tuple(sorted([title_a.lower(), title_b.lower()]))

                if pair_key in seen_dl_pairs or content_key in seen_content_pairs:
                    continue

                diff_days = (d_b - d_a).days
                if diff_days <= 1:
                    stable_hash = hashlib.sha256(
                        f"{content_key[0]}_{content_key[1]}_{dl_a.due_date}_{dl_b.due_date}".encode()
                    ).hexdigest()[:12]

                    conflicts.append(
                        ConflictAlert(
                            id=f"conf_tight_{stable_hash}",
                            conflict_type=ConflictType.TIGHT_DEADLINE,
                            severity=ConflictSeverity.WARNING,
                            title=f"Tight Deadline Crunch: {title_a} & {title_b}",
                            description=(
                                f"'{title_a}' (Due {dl_a.due_date}) and '{title_b}' (Due {dl_b.due_date}) "
                                f"are due within {diff_days * 24} hours of each other."
                            ),
                            event_ids=[dl_a.id, dl_b.id],
                            event_titles=[title_a, title_b],
                            time_window=f"{dl_a.due_date} to {dl_b.due_date}",
                            suggested_resolution="Stagger preparation. Complete the earlier task at least 2 days in advance.",
                            is_deterministic=True
                        )
                    )
                    seen_dl_pairs.add(pair_key)
                    seen_content_pairs.add(content_key)

        return conflicts

    @classmethod
    def detect_ambiguities_and_uncertainties(
        cls, events: List[ExtractedEvent], deadlines: List[ExtractedDeadline]
    ) -> List[ConflictAlert]:
        """
        Flag unresolved or ambiguous information as INFO alerts.
        Deduplicates by item ID.
        """
        conflicts: List[ConflictAlert] = []
        seen_items: Set[str] = set()

        for ev in events:
            if ev.id in seen_items:
                continue
            if ev.status == RecordStatus.UNRESOLVED or ev.uncertainties:
                seen_items.add(ev.id)
                desc = "Event has unresolved details: " + "; ".join(ev.uncertainties or ["Date or location pending confirmation"])
                stable_hash = hashlib.sha256(f"ev_{ev.id}_{ev.title}".encode()).hexdigest()[:12]
                conflicts.append(
                    ConflictAlert(
                        id=f"conf_ambiguity_{stable_hash}",
                        conflict_type=ConflictType.AMBIGUITY_FLAG,
                        severity=ConflictSeverity.INFO,
                        title=f"Unresolved Information: {ev.title}",
                        description=desc,
                        event_ids=[ev.id],
                        event_titles=[ev.title],
                        time_window=ev.date or "TBA",
                        suggested_resolution="Confirm exact timing and venue with course instructors or announcement boards.",
                        is_deterministic=True
                    )
                )

        for dl in deadlines:
            if dl.id in seen_items:
                continue
            if dl.status == RecordStatus.UNRESOLVED or dl.uncertainties:
                seen_items.add(dl.id)
                desc = "Deadline has missing or tentative details: " + "; ".join(dl.uncertainties or ["Submission guidelines unconfirmed"])
                stable_hash = hashlib.sha256(f"dl_{dl.id}_{dl.title}".encode()).hexdigest()[:12]
                conflicts.append(
                    ConflictAlert(
                        id=f"conf_ambiguity_dl_{stable_hash}",
                        conflict_type=ConflictType.AMBIGUITY_FLAG,
                        severity=ConflictSeverity.INFO,
                        title=f"Unresolved Deadline: {dl.title}",
                        description=desc,
                        event_ids=[dl.id],
                        event_titles=[dl.title],
                        time_window=dl.due_date,
                        suggested_resolution="Verify the portal deadline with the teaching assistant or coordinator.",
                        is_deterministic=True
                    )
                )

        return conflicts

    @classmethod
    def run_all_checks(
        cls, events: List[ExtractedEvent], deadlines: List[ExtractedDeadline]
    ) -> List[ConflictAlert]:
        """Run all deterministic conflict detection algorithms."""
        alerts: List[ConflictAlert] = []
        alerts.extend(cls.detect_time_overlaps(events))
        alerts.extend(cls.detect_tight_deadlines(deadlines))
        alerts.extend(cls.detect_ambiguities_and_uncertainties(events, deadlines))
        return alerts

    @classmethod
    def calculate_schedule_feasibility(
        cls,
        total_required_hours: float,
        weekly_budget_hours: float,
        critical_conflicts_count: int
    ) -> float:
        """
        Deterministic feasibility score calculation (0 - 100).
        Deducts points for overtime hours and critical collisions.
        """
        if weekly_budget_hours <= 0:
            return 0.0

        base_ratio = min(1.0, weekly_budget_hours / max(total_required_hours, 1.0))
        score = base_ratio * 100.0

        # Deduct 25 points per critical conflict
        score -= (critical_conflicts_count * 25.0)

        # Deduct if required hours exceed budget
        if total_required_hours > weekly_budget_hours:
            overage_ratio = (total_required_hours - weekly_budget_hours) / weekly_budget_hours
            score -= (overage_ratio * 30.0)

        return max(0.0, min(100.0, round(score, 1)))
