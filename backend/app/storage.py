import os
from supabase import create_client, Client
from app.config import settings

_client: Client = create_client(settings.supabase_url, settings.supabase_secret_key)

CACHE_DIR = "/tmp/slide_cache"
os.makedirs(CACHE_DIR, exist_ok=True)


def upload_slide_file(
    path: str, file_bytes: bytes, content_type: str = "application/octet-stream"
) -> None:
    _client.storage.from_(settings.supabase_slides_bucket).upload(
        path, file_bytes, {"content-type": content_type}
    )


def delete_slide_file(path: str) -> None:
    _client.storage.from_(settings.supabase_slides_bucket).remove([path])
    local_path = _local_cache_path(path)
    if os.path.exists(local_path):
        os.remove(local_path)


def get_signed_url(path: str, expires_in_seconds: int = 3600) -> str:
    result = _client.storage.from_(settings.supabase_slides_bucket).create_signed_url(
        path, expires_in_seconds
    )
    return result["signedURL"]


def _local_cache_path(storage_path: str) -> str:
    safe_name = storage_path.replace("/", "_")
    return os.path.join(CACHE_DIR, safe_name)


def get_local_cached_path(storage_path: str) -> str:
    """
    Downloads the SVS file from Supabase Storage to local disk if not already
    cached, and returns the local path. OpenSlide requires a local file with
    random byte-range access, so we can't read the SVS directly from a remote URL.
    """
    local_path = _local_cache_path(storage_path)
    if os.path.exists(local_path):
        return local_path

    file_bytes = _client.storage.from_(settings.supabase_slides_bucket).download(storage_path)
    with open(local_path, "wb") as f:
        f.write(file_bytes)

    return local_path
