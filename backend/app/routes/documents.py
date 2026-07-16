"""Owner-filtered document listing and deletion routes."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request

from app.auth import get_current_user
from app.database import get_connection
from app.utils.audit import log_audit_event

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIRECTORY = Path("data/uploads")


def _resolve_upload_path(stored_filename: str) -> Path | None:
    """Return the upload path only if it remains inside the upload directory."""
    upload_root = UPLOAD_DIRECTORY.resolve()
    candidate = (UPLOAD_DIRECTORY / stored_filename).resolve()

    try:
        candidate.relative_to(upload_root)
    except ValueError:
        return None

    return candidate


@router.get("")
def list_documents(
    request: Request,
    current_user: dict[str, object] = Depends(get_current_user),
) -> dict[str, object]:
    """List documents owned by the authenticated user."""
    client_ip = request.client.host if request.client else ""

    with get_connection() as connection:
        rows = connection.execute(
            """
            SELECT
                documents.id,
                documents.filename,
                documents.created_at,
                COUNT(chunks.id) AS chunk_count
            FROM documents
            LEFT JOIN chunks ON chunks.document_id = documents.id
            WHERE documents.owner_id = ?
            GROUP BY documents.id
            ORDER BY documents.created_at DESC, documents.id DESC
            """,
            (current_user["id"],),
        ).fetchall()

    documents = [
        {
            "id": row["id"],
            "filename": row["filename"],
            "created_at": row["created_at"],
            "chunk_count": row["chunk_count"],
        }
        for row in rows
    ]

    log_audit_event(
        event_type="document.list",
        endpoint="documents",
        outcome="success",
        user_id=int(current_user["id"]),
        client_ip=client_ip,
        metadata={"document_count": len(documents)},
    )

    return {"documents": documents}


@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    request: Request,
    current_user: dict[str, object] = Depends(get_current_user),
) -> dict[str, object]:
    """Delete one owned document, its chunks, and its stored file when safe."""
    client_ip = request.client.host if request.client else ""

    with get_connection() as connection:
        document = connection.execute(
            """
            SELECT id, filename, stored_filename
            FROM documents
            WHERE id = ? AND owner_id = ?
            """,
            (document_id, current_user["id"]),
        ).fetchone()

        if document is None:
            log_audit_event(
                event_type="document.delete",
                endpoint="documents/{document_id}",
                outcome="not_found",
                user_id=int(current_user["id"]),
                client_ip=client_ip,
                metadata={"document_id": document_id},
            )
            raise HTTPException(status_code=404, detail="Document was not found.")

        stored_filename = document["stored_filename"]
        file_deleted = False
        file_note = "No stored file path is available for this older record."

        if stored_filename:
            upload_path = _resolve_upload_path(stored_filename)

            if upload_path is None:
                file_note = "Stored file path was not safe to delete automatically."
            elif upload_path.exists():
                upload_path.unlink()
                file_deleted = True
                file_note = "Stored upload file was deleted."
            else:
                file_note = "Stored upload file was already missing."

        connection.execute("DELETE FROM chunks WHERE document_id = ?", (document_id,))
        connection.execute(
            "DELETE FROM documents WHERE id = ? AND owner_id = ?",
            (document_id, current_user["id"]),
        )

    log_audit_event(
        event_type="document.delete",
        endpoint="documents/{document_id}",
        outcome="success",
        user_id=int(current_user["id"]),
        client_ip=client_ip,
        metadata={"document_id": document_id, "file_deleted": file_deleted},
    )

    return {
        "message": "Document deleted successfully.",
        "document_id": document_id,
        "file_deleted": file_deleted,
        "file_note": file_note,
    }
