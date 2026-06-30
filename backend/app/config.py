from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    google_client_id: str
    jwt_secret: str
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 days
    pending_token_expires_minutes: int = 15
    frontend_origin: str = "http://localhost:5173"
    supabase_url: str
    supabase_secret_key: str
    supabase_slides_bucket: str = "slides"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
