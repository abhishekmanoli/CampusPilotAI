"""Generate realistic sample campus documents (PDF and TXT) for CampusPilot AI."""
import fitz
from pathlib import Path

SAMPLE_DIR = Path(__file__).resolve().parent

SAMPLE_DIR.mkdir(parents=True, exist_ok=True)

# Doc 1: CS301 Operating Systems Syllabus & Schedule
doc1_text_p1 = """DEPARTMENT OF COMPUTER SCIENCE & ENGINEERING
CS301: Advanced Operating Systems — Fall Semester 2026
Course Syllabus, Exam Timetable & Lab Policies

Instructor: Prof. Jonathan Vance | Office: Turing Hall 402
Teaching Assistants: Sarah Lin, Marcus Brody
Lecture Hours: Monday & Wednesday, 10:00 AM - 11:30 AM (Room 101)

COURSE MILESTONES & EXAM SCHEDULE:
1. Midterm Theory Examination
   - Date: Monday, November 2, 2026
   - Time: 10:00 - 11:30 (Room 101)
   - Scope: Virtual Memory, Process Synchronization, Scheduling Algorithms.

2. Hands-on Kernel Lab Practical Exam [MANDATORY]
   - Date: Friday, November 13, 2026
   - Time: 14:00 - 17:00 (2:00 PM - 5:00 PM)
   - Location: Turing Hall Lab 3B
   - Weight: 25% of final course grade.
   - Eligibility & Requirements:
     * Minimum 75% lab attendance required to sit for the practical.
     * Must bring physical University ID card.
     * One single-sided 8.5x11 handwritten formula sheet permitted.
     * STRICT POLICY: No makeup labs permitted without Dean of Student Affairs medical waiver.
"""

doc1_text_p2 = """CS301: Advanced Operating Systems — Deliverables & Deadlines

PROJECT MILESTONE & FINAL CODE SUBMISSION:
- Milestone Title: Final Multithreaded Kernel Module Project
- Due Date: Saturday, November 14, 2026
- Due Time: 23:59 (11:59 PM)
- Submission Platform: University Canvas Portal (Zip format with Makefile)
- Late Policy: Deductions of 10% per hour up to 6 hours. Zero credit after 6 hours.
- Required Actions:
  * Complete benchmark analysis against Linux 6.8 kernel baseline.
  * Submit 6-page technical report with concurrency race-condition analysis.
  * Tag git commit release v1.0-final.

UNCERTAINTIES & TENTATIVE ITEMS:
- Oral Defense Date: Tentatively scheduled for November 18-20, 2026. Exact slots to be assigned following portal submission.
"""

# Doc 2: Robotics Club Hackathon Notice
doc2_text = """UNIVERSITY ROBOTICS & AUTOMATION SOCIETY (URAS)
OFFICIAL ANNOUNCEMENT: 2026 CAMPUS AUTONOMOUS BOT HACKATHON
"RoboPilot 2026: The 24-Hour Autonomous Navigation Challenge"

EVENT SCHEDULE & MANDATORY TIMING:
- Event Date: Friday, November 13, 2026
- Hours: 13:00 - 18:00 (1:00 PM - 6:00 PM)
- Location: Student Innovation Center, Main Atrium & Robotics Arena
- Schedule Breakdown:
  * 13:00 - 13:30: Team Check-in, Hardware Kit Handout & Sensor Calibration
  * 13:30: Keynote & Challenge Briefing by Industry Sponsors
  * 14:00 - 17:00: Main Track Coding & Hardware Obstacle Run
  * 17:15 - 18:00: Final Judging, Live Demonstrations & Award Ceremony

ELIGIBILITY & TEAM RULES:
- Open to all actively enrolled undergraduate engineering students.
- Teams must comprise exactly 3 to 4 students.
- Prerequisite: Active URAS Society membership or registered GDG chapter affiliation.
- Required Tools: Bring your own laptop, Linux/ROS2 environment pre-installed.

PRIZES & CERTIFICATES:
- 1st Place: $2,500 Hardware Grant + GDG Global Showcase Invitation.
- 2nd Place: $1,000 Component Voucher.

IMPORTANT AMBIGUITY / UNCERTAINTIES:
- Venue access is subject to Student Affairs final safety inspection.
- Microcontroller kits will be allocated on a first-come, first-served basis at 13:00 check-in.
"""

# Doc 3: Dean's Merit Scholarship Notice
doc3_text = """OFFICE OF ACADEMIC EXCELLENCE & STUDENT FINANCIAL AID
ANNOUNCEMENT: FALL 2026 DEAN'S MERIT SCHOLARSHIP & RESEARCH GRANT
Grant Amount: $5,000 Tuition Waiver + $1,500 Conference Travel Allowance

CRITICAL SUBMISSION DEADLINE:
- Due Date: Saturday, November 14, 2026
- Due Time: 17:00 (5:00 PM Sharp)
- Submission Method: University Financial Portal (Ref: SCH-2026-F)
- Note: The portal closes automatically at 17:00:00. No extensions will be granted.

ELIGIBILITY CRITERIA:
- Cumulative Grade Point Average (GPA): 3.80 or higher (Unweighted 4.0 scale).
- Must have completed at least 45 credit hours in Computer Science or Electrical Engineering.
- No active academic disciplinary warnings on student record.

MANDATORY REQUIRED ACTIONS & DOCUMENTS:
1. Certified Official Academic Transcript through Summer 2026.
2. Two Letters of Recommendation from tenured or tenure-track faculty members.
3. 500-Word Personal Statement: "Future Directions in Edge Intelligence and Autonomous Systems".
4. Resume / Curriculum Vitae detailing undergraduate research publications or software projects.

PENDING UNCERTAINTIES:
- Interview Stage: Shortlisted candidates will be invited for an oral panel interview in early December 2026 (Dates TBA).
"""

def create_pdf(filename: str, pages_text: list[str]):
    pdf_path = SAMPLE_DIR / filename
    doc = fitz.open()
    for text in pages_text:
        page = doc.new_page(width=612, height=792) # Standard Letter size
        rect = fitz.Rect(54, 54, 558, 738) # Margins
        page.insert_textbox(rect, text, fontsize=10.5, fontname="helv", align=0)
    doc.save(str(pdf_path))
    doc.close()
    print(f"Created PDF: {pdf_path}")

def create_txt(filename: str, text: str):
    txt_path = SAMPLE_DIR / filename
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Created TXT: {txt_path}")

if __name__ == "__main__":
    # Create PDFs
    create_pdf("01_CS301_Operating_Systems_Midterm_Lab_Schedule.pdf", [doc1_text_p1, doc1_text_p2])
    create_pdf("02_Robotics_Club_Annual_Autonomous_Hackathon.pdf", [doc2_text])
    create_pdf("03_Merit_Scholarship_Application_Notice.pdf", [doc3_text])

    # Create TXTs
    create_txt("01_CS301_Operating_Systems_Midterm_Lab_Schedule.txt", f"{doc1_text_p1}\n\f\n{doc1_text_p2}")
    create_txt("02_Robotics_Club_Annual_Autonomous_Hackathon.txt", doc2_text)
    create_txt("03_Merit_Scholarship_Application_Notice.txt", doc3_text)

    print("All sample documents generated successfully.")
