from __future__ import annotations

from dataclasses import dataclass


_NOTE_TO_PC = {
    "C": 0,
    "C#": 1,
    "DB": 1,
    "D": 2,
    "D#": 3,
    "EB": 3,
    "E": 4,
    "F": 5,
    "F#": 6,
    "GB": 6,
    "G": 7,
    "G#": 8,
    "AB": 8,
    "A": 9,
    "A#": 10,
    "BB": 10,
    "B": 11,
}


@dataclass(frozen=True)
class Key:
    tonic: int
    mode: str


def parse_key(key: str) -> Key:
    parts = key.strip().split()
    if not parts:
        raise ValueError("Empty key")
    tonic_raw = parts[0].upper()
    tonic_pc = _NOTE_TO_PC.get(tonic_raw)
    if tonic_pc is None:
        raise ValueError(f"Unknown tonic '{parts[0]}'")
    mode = "major"
    if len(parts) > 1:
        mode = parts[1].lower()
    if mode not in {"major", "minor"}:
        raise ValueError(f"Unknown mode '{mode}'")
    return Key(tonic=tonic_pc, mode=mode)
