from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db  # changed: import instead of define
from app.auth.google import verify_google_id_token
from app.auth.deps import get_current_claims
from app.auth import service
from app.auth.schemas import (
    GoogleAuthRequest,
    GoogleAuthResponse,
    OnboardRequest,
    MeResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/google", response_model=GoogleAuthResponse)
def google_auth(payload: GoogleAuthRequest, db: Session = Depends(get_db)):
    claims = verify_google_id_token(payload.id_token)
    result = service.resolve_google_login(db, claims)
    return GoogleAuthResponse(**result)


@router.post("/onboard", response_model=GoogleAuthResponse)
def onboard(payload: OnboardRequest, db: Session = Depends(get_db)):
    result = service.onboard_new_organization(
        db, payload.pending_token, payload.org_name, payload.org_slug
    )
    return GoogleAuthResponse(**result)


@router.get("/me", response_model=MeResponse)
def me(claims: dict = Depends(get_current_claims), db: Session = Depends(get_db)):
    user = service.get_user_for_claims(db, claims)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return MeResponse(
        user_id=str(user.id),
        org_id=str(user.organization_id),
        email=user.email,
        name=user.name,
        is_admin=user.is_admin,
    )
