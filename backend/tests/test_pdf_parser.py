import pytest
from pathlib import Path
from app.pdf_parser import DocumentParser, PDFParserError
from app.config import settings

def test_extract_pdf_pages():
    pdf_path = settings.SAMPLE_DIR / "01_CS301_Operating_Systems_Midterm_Lab_Schedule.pdf"
    assert pdf_path.exists(), "Sample PDF must exist"
    
    pages = DocumentParser.extract_from_pdf_file(pdf_path)
    assert len(pages) == 2, "CS301 document should have exactly 2 pages"
    assert pages[0].page_number == 1
    assert pages[1].page_number == 2
    assert "CS301: Advanced Operating Systems" in pages[0].text
    assert "Kernel Lab Practical Exam" in pages[0].text
    assert "Final Multithreaded Kernel Module Project" in pages[1].text
    assert pages[0].char_count > 100

def test_extract_txt_pages():
    txt_content = b"Line 1\nLine 2\n\fLine on page 2"
    pages = DocumentParser.extract_from_txt_bytes(txt_content, "sample.txt")
    assert len(pages) == 2
    assert pages[0].page_number == 1
    assert pages[1].page_number == 2
    assert "Line 1" in pages[0].text
    assert "Line on page 2" in pages[1].text

def test_unsupported_format():
    with pytest.raises(PDFParserError):
        DocumentParser.parse_document(b"dummy binary", "archive.zip")
