from sqlalchemy.orm import Session
from app import models

# Canonical list of all permissions, matching the assignment's RBAC requirements.
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
    """
    Grants every permission to a user. Used when a user is created as an
    organization admin during onboarding.

    NOTE: this is a placeholder until the UserPermission model is built.
    Currently a no-op beyond is_admin (which already implies all permissions
    in the permission-check logic) — replace once UserPermission table exists.
    """
    # TODO: once models.UserPermission exists, write rows here, e.g.:
    #
    # for perm in ALL_PERMISSIONS:
    #     db.add(models.UserPermission(user_id=user_id, permission=perm))
    pass