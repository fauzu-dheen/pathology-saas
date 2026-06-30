from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class SlideResponse(BaseModel):
    id: UUID
    report_id: UUID
    owner_id: UUID | None
    filename: str
    status: str
    file_size_bytes: int | None
    created_at: datetime

    class Config:
        from_attributes = True
