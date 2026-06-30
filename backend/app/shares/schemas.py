from datetime import datetime
from pydantic import BaseModel


class ShareCreateRequest(BaseModel):
    expires_in_hours: int | None = None  # None = never expires


class ShareResponse(BaseModel):
    token: str
    expires_at: datetime | None

    class Config:
        from_attributes = True


class SharedSlideMetaResponse(BaseModel):
    filename: str
    report_title: str
