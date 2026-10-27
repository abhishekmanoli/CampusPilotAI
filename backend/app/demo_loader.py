from typing import List
from app.schemas import (
    DocumentRecord,
    DocumentPage,
    ExtractedEvent,
    ExtractedDeadline,
    SourceEvidence,
    RecordStatus
)
from app.storage import data_store

def load_demo_documents() -> List[DocumentRecord]:
    """
    Loads 3 clearly labeled student demo documents into data_store with:
    1. Weekly Class Timetable (Database Systems Mon 9-10, Mathematics Tue 14-15, Computer Networks Wed 14-15)
    2. Coding Club Workshop Notice (Tuesday Nov 10, 2026: Workshop 10:00-11:30 vs Quiz 11:00-12:00 -> exact 30-min overlap)
    3. Assignment Notice (Database Systems Assignment 2 due Friday Nov 13, 2026 at 17:00)

    Uses stable deterministic IDs so duplicate re-loads maintain consistency and persisted task IDs match.
    """
    # Clear existing demo documents to prevent duplication
    data_store.clear_demo_documents()

    loaded_records = []

    # 1. Weekly Class Timetable
    doc1_id = "doc_demo_timetable"
    doc1_text = (
        "WEEKLY CLASS TIMETABLE — FALL SEMESTER 2026\n"
        "Department of Computer Science & Engineering\n"
        "• Monday, 09:00 - 10:00 AM: Database Systems (Lecture Hall 1)\n"
        "• Tuesday, 14:00 - 15:00 (2:00 PM - 3:00 PM): Mathematics (Science Wing Room B)\n"
        "• Wednesday, 14:00 - 15:00 (2:00 PM - 3:00 PM): Computer Networks (Lab 4)\n"
    )
    pages1 = [DocumentPage(page_number=1, text=doc1_text, char_count=len(doc1_text))]

    doc1 = DocumentRecord(
        id=doc1_id,
        filename="Weekly_Class_Timetable.pdf",
        file_type="application/pdf",
        page_count=1,
        uploaded_at="2026-10-27T09:00:00Z",
        pages=pages1,
        is_demo=True,
        extracted_events=[
            ExtractedEvent(
                id="evt_db_lecture",
                title="Database Systems Lecture",
                description="Weekly core lecture on relational schema design and SQL queries.",
                date="2026-11-09",
                start_time="09:00",
                end_time="10:00",
                location="Lecture Hall 1",
                category="class",
                eligibility=["Computer Science 2nd Year"],
                required_actions=["Review lecture notes before class"],
                uncertainties=[],
                status=RecordStatus.CONFIRMED,
                evidence=[
                    SourceEvidence(
                        document_name="Weekly_Class_Timetable.pdf",
                        page_number=1,
                        text_snippet="Monday, 09:00 - 10:00 AM: Database Systems (Lecture Hall 1)"
                    )
                ]
            ),
            ExtractedEvent(
                id="evt_math_lecture",
                title="Mathematics Lecture",
                description="Weekly class on linear algebra and vector calculus.",
                date="2026-11-10",
                start_time="14:00",
                end_time="15:00",
                location="Science Wing Room B",
                category="class",
                eligibility=["All 2nd Year Students"],
                required_actions=["Bring calculus formula book"],
                uncertainties=[],
                status=RecordStatus.CONFIRMED,
                evidence=[
                    SourceEvidence(
                        document_name="Weekly_Class_Timetable.pdf",
                        page_number=1,
                        text_snippet="Tuesday, 14:00 - 15:00 (2:00 PM - 3:00 PM): Mathematics (Science Wing Room B)"
                    )
                ]
            ),
            ExtractedEvent(
                id="evt_net_lab",
                title="Computer Networks Lab",
                description="Hands-on network configuration and packet analysis.",
                date="2026-11-11",
                start_time="14:00",
                end_time="15:00",
                location="Engineering Lab 4",
                category="lab",
                eligibility=["CS Enrolled Students"],
                required_actions=["Complete Wireshark pre-lab exercise"],
                uncertainties=[],
                status=RecordStatus.CONFIRMED,
                evidence=[
                    SourceEvidence(
                        document_name="Weekly_Class_Timetable.pdf",
                        page_number=1,
                        text_snippet="Wednesday, 14:00 - 15:00 (2:00 PM - 3:00 PM): Computer Networks (Lab 4)"
                    )
                ]
            ),
        ],
        extracted_deadlines=[]
    )
    data_store.add_document(doc1)
    loaded_records.append(doc1)

    # 2. Coding Club Workshop Notice (with intentional 30-min Mathematics Quiz clash)
    doc2_id = "doc_demo_workshop"
    doc2_text = (
        "CAMPUS CODING CLUB — ANNUAL WORKSHOP NOTICE\n"
        "Event: Coding Club Workshop\n"
        "Date: Tuesday, November 10, 2026\n"
        "Time: 10:00 AM - 11:30 AM\n"
        "Location: Computer Lab 2\n"
        "Registration Deadline: Monday, November 9, 2026 at 6:00 PM (18:00)\n"
        "Description: Beginner-friendly programming workshop covering web APIs and Python automation.\n\n"
        "SPECIAL ANNOUNCEMENT:\n"
        "Event: Mathematics Quiz (Midterm Prep)\n"
        "Date: Tuesday, November 10, 2026\n"
        "Time: 11:00 AM - 12:00 PM\n"
        "Location: Room 204\n"
        "Note: 30-minute schedule overlap with the Coding Club Workshop between 11:00 AM and 11:30 AM."
    )
    pages2 = [DocumentPage(page_number=1, text=doc2_text, char_count=len(doc2_text))]

    doc2 = DocumentRecord(
        id=doc2_id,
        filename="Coding_Club_Workshop_Notice.pdf",
        file_type="application/pdf",
        page_count=1,
        uploaded_at="2026-10-27T09:05:00Z",
        pages=pages2,
        is_demo=True,
        extracted_events=[
            ExtractedEvent(
                id="evt_workshop",
                title="Coding Club Workshop",
                description="Beginner-friendly programming workshop covering web APIs and Python automation.",
                date="2026-11-10",
                start_time="10:00",
                end_time="11:30",
                location="Computer Lab 2",
                category="club",
                eligibility=["Open to all college students"],
                required_actions=["Bring laptop with Python installed"],
                uncertainties=[],
                status=RecordStatus.CONFIRMED,
                evidence=[
                    SourceEvidence(
                        document_name="Coding_Club_Workshop_Notice.pdf",
                        page_number=1,
                        text_snippet="Event: Coding Club Workshop - Date: Tuesday, November 10, 2026 - Time: 10:00 AM - 11:30 AM - Location: Computer Lab 2"
                    )
                ]
            ),
            ExtractedEvent(
                id="evt_math_quiz",
                title="Mathematics Quiz",
                description="Midterm preparation quiz covering chapters 1 through 4.",
                date="2026-11-10",
                start_time="11:00",
                end_time="12:00",
                location="Room 204",
                category="exam",
                eligibility=["Mandatory for all math students"],
                required_actions=["Arrive 5 minutes before start time"],
                uncertainties=[],
                status=RecordStatus.CONFIRMED,
                evidence=[
                    SourceEvidence(
                        document_name="Coding_Club_Workshop_Notice.pdf",
                        page_number=1,
                        text_snippet="Event: Mathematics Quiz - Date: Tuesday, November 10, 2026 - Time: 11:00 AM - 12:00 PM (Room 204)"
                    )
                ]
            )
        ],
        extracted_deadlines=[
            ExtractedDeadline(
                id="dl_workshop_reg",
                title="Coding Workshop Registration Deadline",
                due_date="2026-11-09",
                due_time="18:00",
                importance="medium",
                required_actions=["Submit Google Form on club website"],
                eligibility=["All undergraduate students"],
                uncertainties=[],
                status=RecordStatus.CONFIRMED,
                evidence=[
                    SourceEvidence(
                        document_name="Coding_Club_Workshop_Notice.pdf",
                        page_number=1,
                        text_snippet="Registration Deadline: Monday, November 9, 2026 at 6:00 PM (18:00)"
                    )
                ]
            )
        ]
    )
    data_store.add_document(doc2)
    loaded_records.append(doc2)

    # 3. Assignment Notice (Database Systems Assignment 2)
    doc3_id = "doc_demo_assignment"
    doc3_text = (
        "COURSEWORK NOTICE — CS301 DATABASE SYSTEMS\n"
        "Assignment Title: Database Systems Assignment 2\n"
        "Due Date: Friday, November 13, 2026\n"
        "Due Time: 5:00 PM (17:00)\n"
        "Estimated Preparation Time: 4 hours\n"
        "Description: Complete relational schema design, 3NF normalization, and write SQL queries for the library database system. Submit via student portal."
    )
    pages3 = [DocumentPage(page_number=1, text=doc3_text, char_count=len(doc3_text))]

    doc3 = DocumentRecord(
        id=doc3_id,
        filename="Assignment_Notice_Database_Systems.pdf",
        file_type="application/pdf",
        page_count=1,
        uploaded_at="2026-10-27T09:10:00Z",
        pages=pages3,
        is_demo=True,
        extracted_events=[],
        extracted_deadlines=[
            ExtractedDeadline(
                id="dl_db_assignment",
                title="Database Systems Assignment 2",
                due_date="2026-11-13",
                due_time="17:00",
                importance="high",
                required_actions=[
                    "Design relational schema in 3NF/BCNF",
                    "Write 8 complex SQL queries with JOINs",
                    "Upload PDF to course student portal"
                ],
                eligibility=["Enrolled Database Systems students"],
                uncertainties=[],
                status=RecordStatus.CONFIRMED,
                evidence=[
                    SourceEvidence(
                        document_name="Assignment_Notice_Database_Systems.pdf",
                        page_number=1,
                        text_snippet="Assignment Title: Database Systems Assignment 2 - Due Date: Friday, November 13, 2026 - Due Time: 5:00 PM (17:00)"
                    )
                ]
            )
        ]
    )
    data_store.add_document(doc3)
    loaded_records.append(doc3)

    return loaded_records
