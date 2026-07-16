"""SQLite-backed request and Groq usage limits for the local MVP."""

from datetime import datetime, timezone
from hashlib import sha256
from time import time

from fastapi import HTTPException, status

from app.config import settings
from app.database import get_connection
from app.utils.audit import log_audit_event

WINDOW_SECONDS = 60 * 60  # One-hour fixed window.


def _ip_scope(client_ip: str) -> str:
    """Hash the IP so raw addresses are not stored in SQLite."""
    value = f"{settings.rate_limit_salt}:{client_ip}"
    return f"ip:{sha256(value.encode()).hexdigest()}"


def enforce_request_limit(
    user_id: int,
    client_ip: str,
    endpoint: str,
    maximum: int,
) -> None:
    """Atomically enforce matching user and IP hourly limits."""
    window_start = int(time() // WINDOW_SECONDS) * WINDOW_SECONDS
    scopes = [f"user:{user_id}", _ip_scope(client_ip)]
    blocked = False

    with get_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")

        for scope in scopes:
            row = connection.execute(
                """
                SELECT request_count
                FROM rate_limit_windows
                WHERE scope = ? AND endpoint = ? AND window_start = ?
                """,
                (scope, endpoint, window_start),
            ).fetchone()

            if row is not None and row["request_count"] >= maximum:
                blocked = True
                break

        if not blocked:
            for scope in scopes:
                connection.execute(
                    """
                    INSERT INTO rate_limit_windows
                        (scope, endpoint, window_start, request_count)
                    VALUES (?, ?, ?, 1)
                    ON CONFLICT(scope, endpoint, window_start)
                    DO UPDATE SET request_count = request_count + 1
                    """,
                    (scope, endpoint, window_start),
                )

    if blocked:
        log_audit_event(
            event_type="rate_limit.blocked",
            endpoint=endpoint,
            outcome="blocked",
            user_id=user_id,
            client_ip=client_ip,
            metadata={"category": "hourly_request"},
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Request limit exceeded. Try again later.",
        )


def reserve_groq_call(user_id: int, client_ip: str = "") -> None:
    """Reserve one daily Groq call before the provider is contacted."""
    usage_date = datetime.now(timezone.utc).date().isoformat()
    blocked = False

    with get_connection() as connection:
        connection.execute("BEGIN IMMEDIATE")

        row = connection.execute(
            """
            SELECT request_count FROM llm_usage
            WHERE user_id = ? AND usage_date = ?
            """,
            (user_id, usage_date),
        ).fetchone()

        if row is not None and row["request_count"] >= settings.groq_calls_per_day:
            blocked = True
        else:
            connection.execute(
                """
                INSERT INTO llm_usage (user_id, usage_date, request_count)
                VALUES (?, ?, 1)
                ON CONFLICT(user_id, usage_date)
                DO UPDATE SET request_count = request_count + 1
                """,
                (user_id, usage_date),
            )

    if blocked:
        log_audit_event(
            event_type="chat.request",
            endpoint="chat",
            outcome="quota_blocked",
            user_id=user_id,
            client_ip=client_ip,
            metadata={"reason": "daily_groq_quota"},
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Daily AI usage limit exceeded.",
        )


def record_groq_tokens(
    user_id: int,
    prompt_tokens: int,
    completion_tokens: int,
) -> None:
    """Record provider token counts without logging conversation content."""
    usage_date = datetime.now(timezone.utc).date().isoformat()

    with get_connection() as connection:
        connection.execute(
            """
            UPDATE llm_usage
            SET
                prompt_tokens = prompt_tokens + ?,
                completion_tokens = completion_tokens + ?
            WHERE user_id = ? AND usage_date = ?
            """,
            (prompt_tokens, completion_tokens, user_id, usage_date),
        )
