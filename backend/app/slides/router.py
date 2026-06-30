from fastapi import APIRouter, Depends, UploadFile, File, Response
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_permission
from app.slides import service, viewer
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
    service.delete_slide(db, user.organization_id, report_id, slide_id)


@router.get("/{slide_id}/dzi.xml")
def get_slide_dzi(
    report_id: str,
    slide_id: str,
    user: models.User = Depends(require_permission("slides:view")),
    db: Session = Depends(get_db),
):
    slide = service.get_slide_for_report_in_org(db, user.organization_id, report_id, slide_id)
    storage_path = slide.storage_path
    db.close()
    xml = viewer.get_dzi_xml(storage_path)
    return Response(content=xml, media_type="application/xml")


@router.get("/{slide_id}/tiles/{level}/{col}_{row}.jpeg")
def get_slide_tile(
    report_id: str,
    slide_id: str,
    level: int,
    col: int,
    row: int,
    user: models.User = Depends(require_permission("slides:view")),
    db: Session = Depends(get_db),
):
    slide = service.get_slide_for_report_in_org(db, user.organization_id, report_id, slide_id)
    storage_path = slide.storage_path
    db.close()
    tile_bytes = viewer.get_tile_bytes(storage_path, level, col, row)
    return Response(content=tile_bytes, media_type="image/jpeg")
