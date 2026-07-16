"""Privacy-preserving security audit logging."""

from hashlib import sha256
from json import dumps

from app.config import settings
from app.database import get_connection


def hash_ip(client_ip: str) -> str:
    """Hash IP addresses before logging them."""
    value = f"{settings.rate_limit_salt}:{client_ip}"
    return sha256(value.encode()).hexdigest()


def log_audit_event(
    *,
    event_type: str,
    endpoint: str,
    outcome: str,
    user_id: int | None = None,
    client_ip: str = "",
    metadata: dict[str, object] | None = None,
) -> None:
    """Record minimal operational evidence without sensitive content."""
    with get_connection() as connection:
        connection.execute(
            """
            INSERT INTO audit_events
                (user_id, event_type, endpoint, outcome, ip_hash, metadata_json)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                event_type,
                endpoint,
                outcome,
                hash_ip(client_ip) if client_ip else None,
                dumps(metadata or {}),
            ),
        )
