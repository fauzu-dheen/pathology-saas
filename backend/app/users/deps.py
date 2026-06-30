from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.auth.deps import get_current_claims
from app import models


def get_current_user(
    claims: dict = Depends(get_current_claims),
    db: Session = Depends(get_db),
) -> models.User:
    user = db.query(models.User).filter_by(id=claims["sub"]).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def require_admin(user: models.User = Depends(get_current_user)) -> models.User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user