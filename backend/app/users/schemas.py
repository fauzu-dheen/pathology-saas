from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserCreateRequest(BaseModel):
    email: EmailStr
    name: str | None = None


class UserUpdateRequest(BaseModel):
    name: str | None = None
    is_admin: bool | None = None


class UserResponse(BaseModel):
    id: UUID
    email: str
    name: str | None
    is_admin: bool
    google_sub: str | None  # null = pre-created, not yet linked to a Google login

    class Config:
        from_attributes = True
