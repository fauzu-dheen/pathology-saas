import jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from app.config import settings

ALGORITHM = "HS256"


def create_app_jwt(user_id: str, org_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "org_id": str(org_id),
        "type": "session",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expires_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_app_jwt(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    if payload.get("type") != "session":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return payload


def create_pending_token(claims: dict) -> str:
    """Short-lived token carrying server-verified Google claims, used only to
    complete onboarding. Client cannot forge sub/email since this is server-signed."""
    payload = {
        "sub": claims["sub"],
        "email": claims["email"],
        "name": claims.get("name"),
        "type": "pending_onboarding",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.pending_token_expires_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)


def decode_pending_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired onboarding token")
    if payload.get("type") != "pending_onboarding":
        raise HTTPException(status_code=401, detail="Invalid token type")
    return payload