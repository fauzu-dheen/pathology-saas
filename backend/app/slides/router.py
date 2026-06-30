from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_permission
from app.slides import service
from app.slides.schemas import SlideResponse
from app import models

router = APIRouter(prefix="/reports/{report_id}/slides", tags=["slides"])


@router.get("", response_model=list[SlideResponse])
def list_slides(
    report_id: str,
    user: models.User = Depends(require_permission("slides:view")),
    db: Session = Depends(get_db),
):
    return service.list_slides_for_report(db, user.organization_id, report_id)


@router.post("", status_code=204)
async def upload_slide(
    report_id: str,
    file: UploadFile = File(...),
    user: models.User = Depends(require_permission("slides:upload")),
    db: Session = Depends(get_db),
):
    file_bytes = await file.read()
    service.upload_slide(db, user.organization_id, report_id, user.id, file.filename, file_bytes)


@router.delete("/{slide_id}", status_code=204)
def delete_slide(
    report_id: str,
    slide_id: str,
    user: models.User = Depends(require_permission("slides:delete")),
    db: Session = Depends(get_db),
):
    service.delete_slide(db, user.organization_id, slide_id)
