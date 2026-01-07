from __future__ import annotations

import json
from pathlib import Path


STYLE_IDS = [
    "classical_film",
    "jazz_blues_funk",
    "pop_rock",
    "edm_electronic",
    "latin_afro_cuban",
    "folk_country_bluegrass",
]

MINIMUM_COUNTS = {
    "moods": 4,
    "patterns": 8,
    "progressions": 12,
    "feels": 8,
    "instruments": 10,
    "registers": 6,
}


def _load_snapshot() -> dict:
    root = Path(__file__).resolve().parents[2]
    snapshot_path = root / "frontend" / "src" / "music" / "catalogSnapshot.json"
    assert snapshot_path.exists(), "catalogSnapshot.json is missing; regenerate it from the catalogs."
    return json.loads(snapshot_path.read_text(encoding="utf-8"))


def test_style_catalog_snapshot_has_required_coverage() -> None:
    snapshot = _load_snapshot()
    styles = snapshot.get("styles", {})
    assert set(styles.keys()) == set(STYLE_IDS), "Catalog snapshot must include the 6 required styles."

    for style_id in STYLE_IDS:
        entry = styles.get(style_id, {})
        for key, minimum in MINIMUM_COUNTS.items():
            values = entry.get(key, [])
            assert isinstance(values, list), f"Snapshot field '{key}' for {style_id} must be a list."
            assert len(values) >= minimum, f"{style_id} has {len(values)} {key}, expected at least {minimum}."
