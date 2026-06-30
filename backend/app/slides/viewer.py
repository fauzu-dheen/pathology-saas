from openslide import OpenSlide
from openslide.deepzoom import DeepZoomGenerator
from fastapi import HTTPException
from io import BytesIO

from app import storage

TILE_SIZE = 254
TILE_OVERLAP = 1
TILE_FORMAT = "jpeg"


def _open_dzi_generator(storage_path: str) -> DeepZoomGenerator:
    local_path = storage.get_local_cached_path(storage_path)
    try:
        slide = OpenSlide(local_path)
    except Exception:
        raise HTTPException(
            status_code=422, detail="File could not be read as a valid SVS/whole-slide image"
        )
    return DeepZoomGenerator(slide, tile_size=TILE_SIZE, overlap=TILE_OVERLAP, limit_bounds=True)


def get_dzi_xml(storage_path: str) -> str:
    dz = _open_dzi_generator(storage_path)
    return dz.get_dzi(TILE_FORMAT)


def get_tile_bytes(storage_path: str, level: int, col: int, row: int) -> bytes:
    dz = _open_dzi_generator(storage_path)

    if level < 0 or level >= dz.level_count:
        raise HTTPException(status_code=404, detail="Invalid zoom level")

    try:
        tile = dz.get_tile(level, (col, row))
    except Exception:
        raise HTTPException(status_code=404, detail="Tile out of bounds")

    buffer = BytesIO()
    tile.save(buffer, TILE_FORMAT, quality=85)
    return buffer.getvalue()
