from pydantic import BaseModel, Field


class GoogleAuthRequest(BaseModel):
    id_token: str


class GoogleAuthResponse(BaseModel):
    needs_onboarding: bool
    access_token: str | None = None
    pending_token: str | None = None


class OnboardRequest(BaseModel):
    pending_token: str
    org_name: str = Field(min_length=1, max_length=120)
    org_slug: str = Field(min_length=1, max_length=60, pattern=r"^[a-z0-9-]+$")


class MeResponse(BaseModel):
    user_id: str
    org_id: str
    org_name: str
    org_slug: str
    email: str
    name: str | None
    is_admin: bool
    permissions: list[str]
