from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app import models


def create_share(db: Session, org_id: str, user_id: str, slide_id: str, expires_in_hours: int | None) -> models.SlideShare:
    slide = db.query(models.Slide).filter_by(id=slide_id, organization_id=org_id).first()
    if slide is None:
        raise HTTPException(status_code=404, detail="Slide not found")

    expires_at = None
    if expires_in_hours is not None:
        expires_at = datetime.now(timezone.utc) + timedelta(hours=expires_in_hours)

    share = models.SlideShare(
        organization_id=org_id,
        slide_id=slide_id,
        created_by_user_id=user_id,
        expires_at=expires_at,
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


def resolve_share_token(db: Session, token: str) -> models.Slide:
    """
    Validates a share token and returns the slide it grants access to.
    No auth required — this is the public entry point for shared links.
    """
    share = db.query(models.SlideShare).filter_by(token=token).first()
    if share is None:
        raise HTTPException(status_code=404, detail="Invalid share link")

    if share.expires_at is not None and share.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=410, detail="This share link has expired")

    slide = db.query(models.Slide).filter_by(id=share.slide_id).first()
    if slide is None:
        raise HTTPException(status_code=404, detail="Slide no longer exists")

    return slide