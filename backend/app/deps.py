from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.users.deps import get_current_user
from app.permissions import has_permission
from app import models


def require_permission(permission: str):
    def checker(
        user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> models.User:
        if not has_permission(db, user, permission):
            raise HTTPException(status_code=403, detail=f"Missing permission: {permission}")
        return user
    return checker