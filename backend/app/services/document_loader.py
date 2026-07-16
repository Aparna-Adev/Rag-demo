"""Extract text from supported document formats."""

from pathlib import Path

from docx import Document
from pypdf import PdfReader


def extract_text(file_path: Path) -> str:
    """Read text from a TXT, PDF, or DOCX file."""
    extension = file_path.suffix.lower()

    if extension == ".txt":
        return file_path.read_text(encoding="utf-8", errors="replace")

    if extension == ".pdf":
        reader = PdfReader(str(file_path))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if extension == ".docx":
        document = Document(str(file_path))
        return "\n".join(paragraph.text for paragraph in document.paragraphs)

    raise ValueError("Unsupported document type.")
