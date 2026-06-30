from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app import models


def list_users(db: Session, org_id: str) -> list[dict]:
    users = db.query(models.User).filter_by(organization_id=org_id).all()
    if not users:
        return []

    user_ids = [u.id for u in users]

    perm_rows = (
        db.query(models.UserPermission)
        .filter(models.UserPermission.user_id.in_(user_ids))
        .all()
    )

    perms_by_user: dict = defaultdict(set)
    for row in perm_rows:
        perms_by_user[row.user_id].add(row.permission)

    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name,
            "is_admin": u.is_admin,
            "google_sub": u.google_sub,
            "permissions": sorted(perms_by_user.get(u.id, set())),
        }
        for u in users
    ]


def create_user(db: Session, org_id: str, email: str, name: str | None) -> None:
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


def get_user_in_org(db: Session, org_id: str, user_id: str) -> models.User:
    user = db.query(models.User).filter_by(id=user_id, organization_id=org_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found in this organization")
    return user


def update_user(db: Session, org_id: str, user_id: str, name: str | None, is_admin: bool | None) -> None:
    user = get_user_in_org(db, org_id, user_id)

    if name is not None:
        user.name = name
    if is_admin is not None:
        user.is_admin = is_admin

    db.commit()


def delete_user(db: Session, org_id: str, user_id: str, acting_admin_id: str) -> None:
    if str(user_id) == str(acting_admin_id):
        raise HTTPException(status_code=400, detail="Admins cannot delete their own account")

    user = get_user_in_org(db, org_id, user_id)
    db.delete(user)
    db.commit()
