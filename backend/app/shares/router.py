from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app import models
from app.db import get_db
from app.deps import require_permission
from app.shares import service
from app.shares.schemas import ShareCreateRequest, ShareResponse, SharedSlideMetaResponse
from app.slides import viewer

# Authenticated: creating a share link, nested under the existing slides routes
share_router = APIRouter(prefix="/reports/{report_id}/slides/{slide_id}/share", tags=["shares"])


@share_router.post("", response_model=ShareResponse)
def create_share(
    report_id: str,
    slide_id: str,
    payload: ShareCreateRequest,
    user: models.User = Depends(require_permission("slides:share")),
    db: Session = Depends(get_db),
):
    share = service.create_share(
        db, user.organization_id, user.id, report_id, slide_id, payload.expires_in_hours
    )
    return share


# Public: viewing a shared slide, no auth at all
public_router = APIRouter(prefix="/shared", tags=["shared"])


@public_router.get("/{token}", response_model=SharedSlideMetaResponse)
def get_shared_slide_meta(token: str, db: Session = Depends(get_db)):
    slide = service.resolve_share_token(db, token)
    report = db.query(models.Report).filter_by(id=slide.report_id).first()
    return SharedSlideMetaResponse(filename=slide.filename, report_title=report.title if report else "")


@public_router.get("/{token}/dzi.xml")
def get_shared_dzi(token: str, db: Session = Depends(get_db)):
    slide = service.resolve_share_token(db, token)
    storage_path = slide.storage_path
    db.close()
    xml = viewer.get_dzi_xml(storage_path)
    return Response(
        content=xml,
        media_type="application/xml",
        headers={"Cache-Control": "private, max-age=3600"},
    )


@public_router.get("/{token}/tiles/{level}/{col}_{row}.jpeg")
def get_shared_tile(token: str, level: int, col: int, row: int, db: Session = Depends(get_db)):
    slide = service.resolve_share_token(db, token)
    storage_path = slide.storage_path
    db.close()
    tile_bytes = viewer.get_tile_bytes(storage_path, level, col, row)
    return Response(
        content=tile_bytes,
        media_type="image/jpeg",
        headers={"Cache-Control": "private, max-age=3600"},
    )
