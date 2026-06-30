from sqlalchemy.orm import Session
from fastapi import HTTPException

from app import models


def list_reports(db: Session, org_id: str) -> list[models.Report]:
    return db.query(models.Report).filter_by(organization_id=org_id).order_by(models.Report.created_at.desc()).all()


def get_report_in_org(db: Session, org_id: str, report_id: str) -> models.Report:
    report = db.query(models.Report).filter_by(id=report_id, organization_id=org_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


def create_report(db: Session, org_id: str, owner_id: str, title: str, description: str | None) -> None:
    report = models.Report(
        organization_id=org_id,
        owner_id=owner_id,
        title=title,
        description=description,
    )
    db.add(report)
    db.commit()


def update_report(db: Session, org_id: str, report_id: str, title: str | None, description: str | None) -> None:
    report = get_report_in_org(db, org_id, report_id)

    if title is not None:
        report.title = title
    if description is not None:
        report.description = description

    db.commit()


def delete_report(db: Session, org_id: str, report_id: str) -> None:
    report = get_report_in_org(db, org_id, report_id)
    db.delete(report)
    db.commit()