from datetime import datetime
from pydantic import BaseModel


class SlideResponse(BaseModel):
    id: str
    report_id: str
    owner_id: str
    filename: str
    status: str
    file_size_bytes: int | None
    created_at: datetime

    class Config:
        from_attributes = True
