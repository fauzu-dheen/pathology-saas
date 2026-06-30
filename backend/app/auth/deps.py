from fastapi import Depends, Header, HTTPException
from app.auth.jwt import decode_app_jwt

def get_current_claims(authorization: str | None = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or malformed Authorization header")
    token = authorization.removeprefix("Bearer ").strip()
    return decode_app_jwt(token)  # {sub: user_id, org_id, ...}


def get_current_user_id(claims: dict = Depends(get_current_claims)) -> str:
    return claims["sub"]


def get_current_org_id(claims: dict = Depends(get_current_claims)) -> str:
    return claims["org_id"]