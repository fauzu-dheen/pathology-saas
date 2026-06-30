from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.users.deps import require_admin
from app.users import service
from app.users.schemas import UserCreateRequest, UserUpdateRequest, UserResponse
from app import models

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserResponse])
def list_users(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return service.list_users(db, admin.organization_id)


@router.post("", response_model=UserResponse, status_code=201)
def create_user(
    payload: UserCreateRequest,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return service.create_user(db, admin.organization_id, payload.email, payload.name)


@router.patch("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: str,
    payload: UserUpdateRequest,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    return service.update_user(db, admin.organization_id, user_id, payload.name, payload.is_admin)


@router.delete("/{user_id}", status_code=204)
def delete_user(
    user_id: str,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    service.delete_user(db, admin.organization_id, user_id, admin.id)