from __future__ import annotations

from typing import List

_NOTE_TO_PC = {
    "C": 0,
    "C#": 1,
    "DB": 1,
    "D": 2,
    "D#": 3,
    "EB": 3,
    "E": 4,
    "E#": 5,
    "FB": 4,
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
    "B#": 0,
    "CB": 11,
}

_QUALITY_INTERVALS = {
    "major": [0, 4, 7],
    "minor": [0, 3, 7],
    "dim": [0, 3, 6],
    "aug": [0, 4, 8],
    "sus4": [0, 5, 7],
}

_EXTENSION_INTERVALS = {
    "7": 10,
    "maj7": 11,
    "dim7": 9,
}


def _parse_note(token: str) -> int:
    normalized = token.strip().upper().replace("♯", "#").replace("♭", "B")
    if normalized.endswith("B") and len(normalized) > 1 and "#" not in normalized:
        normalized = normalized[:-1] + "B"
    pc = _NOTE_TO_PC.get(normalized)
    if pc is None:
        raise ValueError(f"Unknown note '{token}'")
    return pc


def parse_chord_symbol(symbol: str) -> List[int]:
    raw = symbol.strip()
    if not raw:
        raise ValueError("Empty chord symbol")

    bass_pc = None
    if "/" in raw:
        raw, bass = raw.split("/", 1)
        bass_pc = _parse_note(bass)

    root_letter = raw[0].upper()
    if root_letter not in "ABCDEFG":
        raise ValueError(f"Unknown chord root '{raw[0]}'")
    accidental = ""
    if len(raw) > 1 and raw[1] in {"#", "b", "B"}:
        accidental = raw[1]
    root_token = root_letter + (accidental.upper() if accidental else "")
    root_pc = _parse_note(root_token)
    rest = raw[len(root_token) :]

    quality = "major"
    extension = None

    if "sus4" in rest:
        quality = "sus4"
        rest = rest.replace("sus4", "", 1)

    if "dim7" in rest:
        extension = "dim7"
        rest = rest.replace("dim7", "", 1)
    elif "maj7" in rest:
        extension = "maj7"
        rest = rest.replace("maj7", "", 1)
    elif "7" in rest:
        extension = "7"
        rest = rest.replace("7", "", 1)

    rest = rest.strip().lower()
    if rest.startswith("dim"):
        quality = "dim"
    elif rest.startswith("aug"):
        quality = "aug"
    elif rest.startswith("m") and not rest.startswith("maj"):
        quality = "minor"
    elif rest.startswith("maj"):
        quality = "major"

    intervals = list(_QUALITY_INTERVALS[quality])
    if extension:
        intervals.append(_EXTENSION_INTERVALS[extension])

    chord = [(root_pc + interval) % 12 for interval in intervals]

    if bass_pc is not None:
        remaining = [pc for pc in chord if pc != bass_pc]
        return [bass_pc] + remaining
    return chord
