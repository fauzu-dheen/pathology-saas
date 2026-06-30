from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from fastapi import HTTPException
from app.config import settings

_request = google_requests.Request()

def verify_google_id_token(token: str) -> dict:
    try:
        idinfo = id_token.verify_oauth2_token(
            token, _request, settings.google_client_id
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    if idinfo.get("iss") not in ("accounts.google.com", "https://accounts.google.com"):
        raise HTTPException(status_code=401, detail="Invalid token issuer")

    if not idinfo.get("email_verified", False):
        raise HTTPException(status_code=400, detail="Google email not verified")

    return {
        "sub": idinfo["sub"],
        "email": idinfo["email"],
        "name": idinfo.get("name"),
    }