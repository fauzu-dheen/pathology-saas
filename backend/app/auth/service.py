from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app import models
from app.permissions import grant_all_permissions
from app.auth.jwt import create_app_jwt, create_pending_token, decode_pending_token


def resolve_google_login(db: Session, claims: dict) -> dict:
    """
    Implements the three-way identity resolution:
    1. existing google_sub -> issue session
    2. pre-created user by email, google_sub IS NULL -> link + issue session
    3. no match -> issue pending token for onboarding
    """
    user = db.query(models.User).filter_by(google_sub=claims["sub"]).first()

    if user is None:
        user = (
            db.query(models.User)
            .filter_by(email=claims["email"], google_sub=None)
            .first()
        )
        if user is not None:
            user.google_sub = claims["sub"]
            if not user.name and claims.get("name"):
                user.name = claims["name"]
            db.commit()
            db.refresh(user)

    if user is None:
        pending_token = create_pending_token(claims)
        return {"needs_onboarding": True, "pending_token": pending_token, "access_token": None}

    access_token = create_app_jwt(user_id=user.id, org_id=user.organization_id)
    return {"needs_onboarding": False, "access_token": access_token, "pending_token": None}


def onboard_new_organization(db: Session, pending_token: str, org_name: str, org_slug: str) -> dict:
    claims = decode_pending_token(pending_token)  # re-verify, never trust client-sent identity

    existing_org = db.query(models.Organization).filter_by(slug=org_slug).first()
    if existing_org:
        raise HTTPException(status_code=409, detail="Organization slug already taken")

    org = models.Organization(name=org_name, slug=org_slug)
    db.add(org)
    db.flush()

    user = models.User(
        organization_id=org.id,
        email=claims["email"],
        name=claims.get("name"),
        google_sub=claims["sub"],
        is_admin=True,
    )
    db.add(user)

    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="User already exists")

    grant_all_permissions(db, user.id)
    db.commit()
    db.refresh(user)

    access_token = create_app_jwt(user_id=user.id, org_id=org.id)
    return {"needs_onboarding": False, "access_token": access_token, "pending_token": None}


def get_user_for_claims(db: Session, claims: dict) -> models.User | None:
    return db.query(models.User).filter_by(id=claims["sub"]).first()