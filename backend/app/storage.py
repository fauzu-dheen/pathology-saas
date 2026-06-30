from supabase import create_client, Client
from app.config import settings

_client: Client = create_client(settings.supabase_url, settings.supabase_secret_key)


def upload_slide_file(
    path: str, file_bytes: bytes, content_type: str = "application/octet-stream"
) -> None:
    _client.storage.from_(settings.supabase_slides_bucket).upload(
        path, file_bytes, {"content-type": content_type}
    )


def delete_slide_file(path: str) -> None:
    _client.storage.from_(settings.supabase_slides_bucket).remove([path])


def get_signed_url(path: str, expires_in_seconds: int = 3600) -> str:
    result = _client.storage.from_(settings.supabase_slides_bucket).create_signed_url(
        path, expires_in_seconds
    )
    return result["signedURL"]
