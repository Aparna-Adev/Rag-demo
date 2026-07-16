"""Secure document-upload endpoint."""

from json import dumps
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from app.auth import get_current_user
from app.config import settings
from app.database import get_connection
from app.services.chunking import chunk_text
from app.services.document_loader import extract_text
from app.services.embeddings import create_embeddings
from app.utils.audit import log_audit_event
from app.utils.rate_limit import enforce_request_limit
from app.utils.security import (
    SecurityValidationError,
    validate_chunks,
    validate_extracted_text,
)

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIRECTORY = Path("data/uploads")
ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict[str, object] = Depends(get_current_user),
) -> dict[str, int | str]:
    """Validate, save, extract, chunk, and store a document."""
    client_ip = request.client.host if request.client else "unknown"

    enforce_request_limit(
        int(current_user["id"]),
        client_ip,
        "upload",
        settings.uploads_per_hour,
    )

    original_filename = file.filename or ""
    extension = Path(original_filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        log_audit_event(
            event_type="document.upload",
            endpoint="documents/upload",
            outcome="rejected",
            user_id=int(current_user["id"]),
            client_ip=client_ip,
            metadata={"reason": "unsupported_type"},
        )
        raise HTTPException(
            status_code=400,
            detail="Only TXT, PDF, and DOCX files are allowed.",
        )

    content = await file.read()

    if not content:
        log_audit_event(
            event_type="document.upload",
            endpoint="documents/upload",
            outcome="rejected",
            user_id=int(current_user["id"]),
            client_ip=client_ip,
            metadata={"reason": "empty_file"},
        )
        raise HTTPException(status_code=400, detail="The uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE:
        log_audit_event(
            event_type="document.upload",
            endpoint="documents/upload",
            outcome="rejected",
            user_id=int(current_user["id"]),
            client_ip=client_ip,
            metadata={"reason": "file_too_large"},
        )
        raise HTTPException(status_code=400, detail="Maximum file size is 10 MB.")

    UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)
    stored_name = f"{uuid4()}{extension}"
    saved_path = UPLOAD_DIRECTORY / stored_name
    saved_path.write_bytes(content)

    try:
        extracted_text = extract_text(saved_path)
        validate_extracted_text(extracted_text)
        chunks = chunk_text(extracted_text)
        validate_chunks(chunks)
        embeddings = create_embeddings(chunks)
    except SecurityValidationError as error:
        saved_path.unlink(missing_ok=True)
        outcome = "injection_blocked" if "prompt-injection" in str(error) else "rejected"
        log_audit_event(
            event_type="document.upload",
            endpoint="documents/upload",
            outcome=outcome,
            user_id=int(current_user["id"]),
            client_ip=client_ip,
            metadata={"reason": "security_gate"},
        )
        raise HTTPException(status_code=400, detail=str(error)) from error
    except Exception as error:
        saved_path.unlink(missing_ok=True)
        log_audit_event(
            event_type="document.upload",
            endpoint="documents/upload",
            outcome="rejected",
            user_id=int(current_user["id"]),
            client_ip=client_ip,
            metadata={"reason": "extraction_failed"},
        )
        raise HTTPException(
            status_code=400,
            detail="The document text could not be extracted.",
        ) from error

    with get_connection() as connection:
        cursor = connection.execute(
            "INSERT INTO documents (filename, stored_filename, owner_id) VALUES (?, ?, ?)",
            (original_filename, stored_name, current_user["id"]),
        )
        document_id = cursor.lastrowid

        connection.executemany(
            """
            INSERT INTO chunks (document_id, content, chunk_index, embedding)
            VALUES (?, ?, ?, ?)
            """,
            [
                (document_id, chunk, index, dumps(embedding))
                for index, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            ],
        )

    log_audit_event(
        event_type="document.upload",
        endpoint="documents/upload",
        outcome="accepted",
        user_id=int(current_user["id"]),
        client_ip=client_ip,
        metadata={"document_id": document_id, "chunk_count": len(chunks)},
    )

    return {
        "message": "Document processed successfully.",
        "document_id": document_id,
        "filename": original_filename,
        "chunk_count": len(chunks),
    }
