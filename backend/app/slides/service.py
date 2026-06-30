import uuid
from sqlalchemy.orm import Session
from fastapi import HTTPException

from app import models, storage

MAX_SVS_FILE_SIZE_BYTES = 50 * 1024 * 1024


def list_slides_for_report(db: Session, org_id: str, report_id: str) -> list[models.Slide]:
    return (
        db.query(models.Slide)
        .filter_by(organization_id=org_id, report_id=report_id)
        .order_by(models.Slide.created_at.desc())
        .all()
    )


def get_slide_in_org(db: Session, org_id: str, slide_id: str) -> models.Slide:
    slide = db.query(models.Slide).filter_by(id=slide_id, organization_id=org_id).first()
    if slide is None:
        raise HTTPException(status_code=404, detail="Slide not found")
    return slide


def get_slide_for_report_in_org(
    db: Session, org_id: str, report_id: str, slide_id: str
) -> models.Slide:
    slide = (
        db.query(models.Slide)
        .filter_by(id=slide_id, organization_id=org_id, report_id=report_id)
        .first()
    )
    if slide is None:
        raise HTTPException(status_code=404, detail="Slide not found")
    return slide


def upload_slide(
    db: Session,
    org_id: str,
    report_id: str,
    owner_id: str,
    filename: str,
    file_bytes: bytes,
) -> None:
    if not filename.lower().endswith(".svs"):
        raise HTTPException(status_code=400, detail="Only .svs files are allowed")

    if len(file_bytes) > MAX_SVS_FILE_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Only SVS files below 50 MB are allowed")

    # confirm report exists in this org before attaching a slide to it
    report = db.query(models.Report).filter_by(id=report_id, organization_id=org_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")

    slide_id = uuid.uuid4()
    storage_path = f"{org_id}/{report_id}/{slide_id}.svs"

    try:
        storage.upload_slide_file(storage_path, file_bytes)
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to upload file to storage")

    slide = models.Slide(
        id=slide_id,
        organization_id=org_id,
        report_id=report_id,
        owner_id=owner_id,
        filename=filename,
        storage_path=storage_path,
        status="ready",
        file_size_bytes=len(file_bytes),
    )
    db.add(slide)
    db.commit()


def delete_slide(db: Session, org_id: str, report_id: str, slide_id: str) -> None:
    slide = get_slide_for_report_in_org(db, org_id, report_id, slide_id)
    try:
        storage.delete_slide_file(slide.storage_path)
    except Exception:
        pass  # don't block DB cleanup if storage delete fails; orphaned file is acceptable for now
    db.delete(slide)
    db.commit()
