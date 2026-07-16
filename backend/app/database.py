"""SQLite database setup."""

import sqlite3
from pathlib import Path

DATABASE_PATH = Path("data/rag.db")


def get_connection() -> sqlite3.Connection:
    """Open the local SQLite database."""
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    """Create the initial document and chunk tables."""
    with get_connection() as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                stored_filename TEXT,
                owner_id INTEGER,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS chunks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                document_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                chunk_index INTEGER NOT NULL,
                embedding TEXT,
                FOREIGN KEY (document_id) REFERENCES documents(id)
            );
            """
        )

        columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(chunks)")
        }

        if "embedding" not in columns:
            connection.execute("ALTER TABLE chunks ADD COLUMN embedding TEXT")

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        document_columns = {
            row["name"]
            for row in connection.execute("PRAGMA table_info(documents)")
        }

        if "owner_id" not in document_columns:
            connection.execute("ALTER TABLE documents ADD COLUMN owner_id INTEGER")

        if "stored_filename" not in document_columns:
            connection.execute("ALTER TABLE documents ADD COLUMN stored_filename TEXT")

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS rate_limit_windows (
                scope TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                window_start INTEGER NOT NULL,
                request_count INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (scope, endpoint, window_start)
            )
            """
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS llm_usage (
                user_id INTEGER NOT NULL,
                usage_date TEXT NOT NULL,
                request_count INTEGER NOT NULL DEFAULT 0,
                prompt_tokens INTEGER NOT NULL DEFAULT 0,
                completion_tokens INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (user_id, usage_date)
            )
            """
        )

        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS audit_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                event_type TEXT NOT NULL,
                endpoint TEXT NOT NULL,
                outcome TEXT NOT NULL,
                ip_hash TEXT,
                metadata_json TEXT NOT NULL DEFAULT '{}',
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
