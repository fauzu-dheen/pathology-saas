from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app import models


def list_users(db: Session, org_id: str) -> list[models.User]:
    return db.query(models.User).filter_by(organization_id=org_id).all()


def create_user(db: Session, org_id: str, email: str, name: str | None) -> models.User:
    """
    Pre-creates a user by email within the org, with no google_sub yet.
    They get linked automatically on their first Google sign-in
    (see app/auth/service.py: resolve_google_login, case 2).
    """
    user = models.User(
        organization_id=org_id,
        email=email,
        name=name,
        google_sub=None,
        is_admin=False,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="A user with this email already exists in this organization")
    db.refresh(user)
    return user


def get_user_in_org(db: Session, org_id: str, user_id: str) -> models.User:
    user = db.query(models.User).filter_by(id=user_id, organization_id=org_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found in this organization")
    return user


def update_user(db: Session, org_id: str, user_id: str, name: str | None, is_admin: bool | None) -> models.User:
    user = get_user_in_org(db, org_id, user_id)

    if name is not None:
        user.name = name
    if is_admin is not None:
        user.is_admin = is_admin

    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, org_id: str, user_id: str, acting_admin_id: str) -> None:
    if str(user_id) == str(acting_admin_id):
        raise HTTPException(status_code=400, detail="Admins cannot delete their own account")

    user = get_user_in_org(db, org_id, user_id)
    db.delete(user)
    db.commit()