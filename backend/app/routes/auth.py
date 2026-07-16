"""Registration and JWT login endpoints."""

import sqlite3

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field

from app.auth import create_access_token, hash_password, verify_password
from app.database import get_connection
from app.utils.audit import log_audit_event

router = APIRouter(prefix="/auth", tags=["authentication"])


class RegisterRequest(BaseModel):
    """New local user registration."""

    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(
    api_request: Request,
    request: RegisterRequest,
) -> dict[str, object]:
    """Create a local user with a securely hashed password."""
    client_ip = api_request.client.host if api_request.client else ""

    try:
        with get_connection() as connection:
            cursor = connection.execute(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                (request.email.lower(), hash_password(request.password)),
            )
    except sqlite3.IntegrityError as error:
        log_audit_event(
            event_type="auth.register",
            endpoint="auth/register",
            outcome="duplicate_email",
            client_ip=client_ip,
        )
        raise HTTPException(status_code=409, detail="Email is already registered.") from error

    log_audit_event(
        event_type="auth.register",
        endpoint="auth/register",
        outcome="success",
        user_id=cursor.lastrowid,
        client_ip=client_ip,
    )

    return {"id": cursor.lastrowid, "email": request.email.lower()}


@router.post("/login")
def login_user(
    api_request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> dict[str, str]:
    """Return a JWT access token for valid credentials."""
    client_ip = api_request.client.host if api_request.client else ""

    with get_connection() as connection:
        user = connection.execute(
            "SELECT id, password_hash FROM users WHERE email = ?",
            (form_data.username.lower().strip(),),
        ).fetchone()

    if user is None or not verify_password(form_data.password, user["password_hash"]):
        log_audit_event(
            event_type="auth.login",
            endpoint="auth/login",
            outcome="invalid_credentials",
            client_ip=client_ip,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    log_audit_event(
        event_type="auth.login",
        endpoint="auth/login",
        outcome="success",
        user_id=user["id"],
        client_ip=client_ip,
    )

    return {
        "access_token": create_access_token(user["id"]),
        "token_type": "bearer",
    }
