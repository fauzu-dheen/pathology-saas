from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ReportCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None


class ReportUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None


class ReportResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    owner_id: UUID | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
