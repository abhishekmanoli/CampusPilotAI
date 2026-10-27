import fitz  # PyMuPDF
import logging
from pathlib import Path
from typing import List, Tuple
from app.schemas import DocumentPage

logger = logging.getLogger(__name__)

class PDFParserError(Exception):
    pass

class DocumentParser:
    """Extracts text from PDF and TXT documents, retaining document names and exact page numbers."""

    @staticmethod
    def extract_from_pdf_bytes(pdf_bytes: bytes, filename: str) -> List[DocumentPage]:
        """Extract pages and text from raw PDF bytes."""
        pages: List[DocumentPage] = []
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        except Exception as e:
            logger.error(f"Failed to open PDF stream for {filename}: {e}")
            raise PDFParserError(f"Could not parse PDF {filename}: {str(e)}")

        try:
            for page_index in range(len(doc)):
                page = doc[page_index]
                text = page.get_text("text").strip()
                page_num = page_index + 1
                pages.append(
                    DocumentPage(
                        page_number=page_num,
                        text=text,
                        char_count=len(text)
                    )
                )
        finally:
            doc.close()

        if not pages:
            pages.append(DocumentPage(page_number=1, text="[Empty Document]", char_count=16))

        return pages

    @staticmethod
    def extract_from_pdf_file(filepath: Path) -> List[DocumentPage]:
        """Extract pages from a PDF file path."""
        with open(filepath, "rb") as f:
            return DocumentParser.extract_from_pdf_bytes(f.read(), filepath.name)

    @staticmethod
    def extract_from_txt_bytes(txt_bytes: bytes, filename: str) -> List[DocumentPage]:
        """Extract text from TXT file with simulated pagination (e.g. 60 lines or form-feed per page)."""
        try:
            content = txt_bytes.decode("utf-8")
        except UnicodeDecodeError:
            content = txt_bytes.decode("latin-1", errors="replace")

        # Split on form feed or by chunks of 60 lines to retain logical pages
        raw_pages = content.split("\f")
        pages: List[DocumentPage] = []

        if len(raw_pages) > 1:
            for idx, page_str in enumerate(raw_pages, start=1):
                clean_str = page_str.strip()
                if clean_str:
                    pages.append(
                        DocumentPage(
                            page_number=idx,
                            text=clean_str,
                            char_count=len(clean_str)
                        )
                    )
        else:
            lines = content.splitlines()
            chunk_size = 50
            if len(lines) <= chunk_size:
                pages.append(
                    DocumentPage(
                        page_number=1,
                        text=content.strip(),
                        char_count=len(content.strip())
                    )
                )
            else:
                for i in range(0, len(lines), chunk_size):
                    chunk_text = "\n".join(lines[i:i + chunk_size]).strip()
                    if chunk_text:
                        pages.append(
                            DocumentPage(
                                page_number=(i // chunk_size) + 1,
                                text=chunk_text,
                                char_count=len(chunk_text)
                            )
                        )

        if not pages:
            pages.append(DocumentPage(page_number=1, text=content.strip(), char_count=len(content.strip())))

        return pages

    @staticmethod
    def parse_document(file_bytes: bytes, filename: str) -> List[DocumentPage]:
        """Universal parser dispatch based on extension."""
        suffix = Path(filename).suffix.lower()
        if suffix == ".pdf":
            return DocumentParser.extract_from_pdf_bytes(file_bytes, filename)
        elif suffix in (".txt", ".text", ".md"):
            return DocumentParser.extract_from_txt_bytes(file_bytes, filename)
        else:
            raise PDFParserError(f"Unsupported file format: {suffix}. Only PDF and TXT files are supported.")
