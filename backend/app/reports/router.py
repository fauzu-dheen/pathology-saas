from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_permission
from app.reports import service
from app.reports.schemas import ReportCreateRequest, ReportUpdateRequest, ReportResponse
from app import models

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportResponse])
def list_reports(
    user: models.User = Depends(require_permission("reports:view")),
    db: Session = Depends(get_db),
):
    return service.list_reports(db, user.organization_id)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: str,
    user: models.User = Depends(require_permission("reports:view")),
    db: Session = Depends(get_db),
):
    return service.get_report_in_org(db, user.organization_id, report_id)


@router.post("", status_code=204)
def create_report(
    payload: ReportCreateRequest,
    user: models.User = Depends(require_permission("reports:create")),
    db: Session = Depends(get_db),
):
    service.create_report(db, user.organization_id, user.id, payload.title, payload.description)


@router.patch("/{report_id}", status_code=204)
def update_report(
    report_id: str,
    payload: ReportUpdateRequest,
    user: models.User = Depends(require_permission("reports:edit")),
    db: Session = Depends(get_db),
):
    service.update_report(db, user.organization_id, report_id, payload.title, payload.description)


@router.delete("/{report_id}", status_code=204)
def delete_report(
    report_id: str,
    user: models.User = Depends(require_permission("reports:delete")),
    db: Session = Depends(get_db),
):
    service.delete_report(db, user.organization_id, report_id)
