from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.users.deps import require_admin, get_current_user
from app.users import service
from app.users.schemas import UserCreateRequest, UserUpdateRequest, UserResponse, PermissionsUpdateRequest
from app import models
from app.permissions import grant_permissions


router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return service.list_users(db, current_user.organization_id)


@router.post("", status_code=204)
def create_user(
    payload: UserCreateRequest,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service.create_user(db, admin.organization_id, payload.email, payload.name)


@router.patch("/{user_id}", status_code=204)
def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service.update_user(db, admin.organization_id, user_id, payload.name, payload.is_admin)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service.delete_user(db, admin.organization_id, user_id, admin.id)


@router.put("/{user_id}/permissions", status_code=204)
def set_permissions(
    user_id: str,
    payload: PermissionsUpdateRequest,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    target = service.get_user_in_org(db, admin.organization_id, user_id)
    try:
        grant_permissions(db, target.id, payload.permissions)
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
