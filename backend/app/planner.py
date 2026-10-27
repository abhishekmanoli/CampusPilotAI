import json
import logging
import uuid
from typing import List, Dict, Any, Optional

from app.schemas import (
    ExtractedEvent,
    ExtractedDeadline,
    ConflictAlert,
    PlanGenerationRequest,
    PlanGenerationResponse,
    ActionPlanItem,
    RecordStatus,
    ConflictSeverity,
)
from app.conflict_engine import ConflictEngine
from app.gemma_client import gemma_client

logger = logging.getLogger(__name__)

class ActionPlanner:
    """Generates personalized, feasibility-checked weekly action plans."""

    @classmethod
    async def create_plan(
        cls,
        events: List[ExtractedEvent],
        deadlines: List[ExtractedDeadline],
        request: PlanGenerationRequest
    ) -> PlanGenerationResponse:
        # Run deterministic conflict engine first
        conflicts = ConflictEngine.run_all_checks(events, deadlines)
        critical_conflicts = [c for c in conflicts if c.severity == ConflictSeverity.CRITICAL]

        total_weekly_budget = sum(request.daily_budget_hours.values())

        # If Gemma 4 is configured, use Gemma 4 for intelligent schedule synthesis
        if gemma_client.is_configured():
            try:
                return await cls._synthesize_with_gemma(events, deadlines, conflicts, request, total_weekly_budget)
            except Exception as e:
                logger.warning(f"Gemma 4 planning synthesis failed, falling back to deterministic planner: {e}")

        # Deterministic fallback planner if Gemma API is not yet configured
        return cls._deterministic_plan(events, deadlines, conflicts, request, total_weekly_budget)

    @classmethod
    async def _synthesize_with_gemma(
        cls,
        events: List[ExtractedEvent],
        deadlines: List[ExtractedDeadline],
        conflicts: List[ConflictAlert],
        request: PlanGenerationRequest,
        total_weekly_budget: float
    ) -> PlanGenerationResponse:
        events_summary = [
            f"- {e.title} ({e.category}): Date {e.date or 'TBA'} {e.start_time or ''}-{e.end_time or ''} at {e.location or 'TBA'}"
            for e in events
        ]
        deadlines_summary = [
            f"- {d.title}: Due {d.due_date} (Importance: {d.importance})"
            for d in deadlines
        ]
        conflicts_summary = [
            f"- [{c.severity}] {c.title}: {c.description}"
            for c in conflicts
        ]

        system_instruction = (
            "You are CampusPilot AI's Weekly Schedule & Action Plan Architect powered by Google Gemma 4. "
            "Your job is to generate a personalized, feasible weekly plan that respects student time constraints. "
            "CRITICAL RULES:\n"
            "1. Allocate tasks across days (Monday to Sunday) within the daily hours budget.\n"
            "2. Prioritize high-importance deadlines and upcoming exams.\n"
            "3. Clearly distinguish confirmed facts, inferred suggestions, and unresolved ambiguities.\n"
            "4. Return strict JSON."
        )

        prompt = f"""Synthesize a personalized action plan for a student with the following profile:

Daily Available Study Hours:
{json.dumps(request.daily_budget_hours, indent=2)}

Student Priorities:
{", ".join(request.priorities)}

Student Notes:
{request.student_notes or "None provided"}

Extracted Campus Events:
{chr(10).join(events_summary) if events_summary else "No upcoming events"}

Extracted Deadlines:
{chr(10).join(deadlines_summary) if deadlines_summary else "No upcoming deadlines"}

Active Conflicts Identified:
{chr(10).join(conflicts_summary) if conflicts_summary else "No active conflicts"}

Return JSON strictly in this structure:
{{
  "summary": "Concise summary of the week's study plan and balance strategy",
  "weekly_schedule": [
    {{
      "day_of_week": "Monday",
      "date": "YYYY-MM-DD or null",
      "time_slot": "09:00 - 11:00 or null",
      "task_title": "string",
      "allocated_hours": 2.0,
      "priority": "urgent | high | medium | low",
      "category": "exam_prep | submission | review | attendance",
      "reasoning": "string explaining why this is scheduled here",
      "status_type": "confirmed | inferred | unresolved",
      "source_ref": "Document name or event name"
    }}
  ],
  "confirmed_facts": ["List of confirmed milestone facts"],
  "inferred_suggestions": ["List of inferred prep tips"],
  "unresolved_ambiguities": ["List of flags needing verification"]
}}
"""

        raw_output = await gemma_client.generate_text(prompt, system_instruction=system_instruction, temperature=0.2)
        cleaned = gemma_client._extract_json_snippet(raw_output)
        parsed = json.loads(cleaned)

        weekly_items: List[ActionPlanItem] = []
        total_allocated = 0.0

        for item in parsed.get("weekly_schedule", []):
            hours = float(item.get("allocated_hours", 1.5))
            total_allocated += hours
            status_val = item.get("status_type", "inferred").lower()
            if status_val not in ("confirmed", "inferred", "unresolved"):
                status_val = "inferred"

            weekly_items.append(
                ActionPlanItem(
                    id=f"plan_{uuid.uuid4().hex[:8]}",
                    day_of_week=item.get("day_of_week", "Monday"),
                    date=item.get("date"),
                    time_slot=item.get("time_slot"),
                    task_title=item.get("task_title", "Review Materials"),
                    allocated_hours=hours,
                    priority=item.get("priority", "medium"),
                    category=item.get("category", "study"),
                    reasoning=item.get("reasoning", "Paced schedule allocation"),
                    status_type=RecordStatus(status_val),
                    source_ref=item.get("source_ref")
                )
            )

        critical_count = sum(1 for c in conflicts if c.severity == ConflictSeverity.CRITICAL)
        feasibility = ConflictEngine.calculate_schedule_feasibility(
            total_required_hours=total_allocated,
            weekly_budget_hours=total_weekly_budget,
            critical_conflicts_count=critical_count
        )

        return PlanGenerationResponse(
            total_allocated_hours=round(total_allocated, 1),
            feasibility_score=feasibility,
            weekly_schedule=weekly_items,
            conflicts_detected=conflicts,
            confirmed_facts=parsed.get("confirmed_facts", []),
            inferred_suggestions=parsed.get("inferred_suggestions", []),
            unresolved_ambiguities=parsed.get("unresolved_ambiguities", []),
            summary=parsed.get("summary", "Personalized weekly schedule synthesized."),
            generator_type="gemma4"
        )

    @classmethod
    def _deterministic_plan(
        cls,
        events: List[ExtractedEvent],
        deadlines: List[ExtractedDeadline],
        conflicts: List[ConflictAlert],
        request: PlanGenerationRequest,
        total_weekly_budget: float
    ) -> PlanGenerationResponse:
        """Deterministic plan builder when offline or fallback is needed."""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        weekly_items: List[ActionPlanItem] = []
        total_allocated = 0.0

        # Create tasks from deadlines first (highest priority)
        day_idx = 0
        for dl in deadlines:
            day = days[day_idx % len(days)]
            hours = min(3.0, request.daily_budget_hours.get(day, 4.0) / 2)
            total_allocated += hours
            weekly_items.append(
                ActionPlanItem(
                    id=f"plan_{uuid.uuid4().hex[:8]}",
                    day_of_week=day,
                    date=dl.due_date,
                    time_slot="10:00 - 12:30",
                    task_title=f"Prepare: {dl.title}",
                    allocated_hours=hours,
                    priority=dl.importance or "high",
                    category="submission",
                    reasoning=f"Required ahead of due date {dl.due_date}",
                    status_type=dl.status,
                    source_ref=dl.title
                )
            )
            day_idx += 1

        # Create tasks for events (exams, hackathon)
        for ev in events:
            day = days[day_idx % len(days)]
            hours = 2.0
            total_allocated += hours
            weekly_items.append(
                ActionPlanItem(
                    id=f"plan_{uuid.uuid4().hex[:8]}",
                    day_of_week=day,
                    date=ev.date,
                    time_slot=f"{ev.start_time or '14:00'} - {ev.end_time or '16:00'}",
                    task_title=f"Attend/Prep: {ev.title}",
                    allocated_hours=hours,
                    priority="urgent" if ev.category in ("exam", "lab") else "medium",
                    category="exam_prep" if ev.category in ("exam", "lab") else "attendance",
                    reasoning=f"Scheduled for event on {ev.date or 'TBA'}",
                    status_type=ev.status,
                    source_ref=ev.title
                )
            )
            day_idx += 1

        confirmed_facts = [
            f"Confirmed event '{e.title}' on {e.date} ({e.start_time or 'TBA'})"
            for e in events if e.status == RecordStatus.CONFIRMED and e.date
        ]
        inferred = [
            f"Recommended {item.allocated_hours}h prep block for {item.task_title} on {item.day_of_week}"
            for item in weekly_items[:3]
        ]
        ambiguities = [
            f"Unresolved event details: {e.title}"
            for e in events if e.status == RecordStatus.UNRESOLVED or e.uncertainties
        ]

        critical_count = sum(1 for c in conflicts if c.severity == ConflictSeverity.CRITICAL)
        feasibility = ConflictEngine.calculate_schedule_feasibility(
            total_required_hours=total_allocated,
            weekly_budget_hours=total_weekly_budget,
            critical_conflicts_count=critical_count
        )

        return PlanGenerationResponse(
            total_allocated_hours=round(total_allocated, 1),
            feasibility_score=feasibility,
            weekly_schedule=weekly_items,
            conflicts_detected=conflicts,
            confirmed_facts=confirmed_facts,
            inferred_suggestions=inferred,
            unresolved_ambiguities=ambiguities,
            summary="Deterministic schedule created allocating priority study blocks within your weekly time budget.",
            generator_type="algorithmic"
        )
