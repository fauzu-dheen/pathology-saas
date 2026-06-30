from sqlalchemy.orm import Session
from app import models

ALL_PERMISSIONS = [
    "reports:create",
    "reports:view",
    "reports:edit",
    "reports:delete",
    "slides:upload",
    "slides:view",
    "slides:update",
    "slides:delete",
    "slides:share",
]


def grant_all_permissions(db: Session, user_id: str) -> None:
    """Used when a user is created as an organization admin during onboarding."""
    for perm in ALL_PERMISSIONS:
        db.add(models.UserPermission(user_id=user_id, permission=perm))
    db.flush()


def grant_permissions(db: Session, user_id: str, permissions: list[str]) -> None:
    """Replaces a user's permission set with exactly the given list."""
    invalid = set(permissions) - set(ALL_PERMISSIONS)
    if invalid:
        raise ValueError(f"Unknown permissions: {invalid}")

    db.query(models.UserPermission).filter_by(user_id=user_id).delete()
    for perm in permissions:
        db.add(models.UserPermission(user_id=user_id, permission=perm))
    db.flush()


def get_user_permissions(db: Session, user_id: str) -> set[str]:
    rows = db.query(models.UserPermission).filter_by(user_id=user_id).all()
    return {row.permission for row in rows}


def has_permission(db: Session, user: models.User, permission: str) -> bool:
    """Admins implicitly have every permission; others are checked explicitly."""
    if user.is_admin:
        return True
    return permission in get_user_permissions(db, user.id)
