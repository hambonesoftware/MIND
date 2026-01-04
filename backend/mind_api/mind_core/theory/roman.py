from __future__ import annotations

from typing import List

from .key import Key


_MAJOR_SCALE = [0, 2, 4, 5, 7, 9, 11]
_MINOR_SCALE = [0, 2, 3, 5, 7, 8, 10]
_HARMONIC_MINOR = [0, 2, 3, 5, 7, 8, 11]


def _degree_from_symbol(symbol: str) -> int:
    base = symbol.strip().lower().replace("7", "")
    romans = ["i", "ii", "iii", "iv", "v", "vi", "vii"]
    for idx, roman in enumerate(romans):
        if base == roman:
            return idx
    raise ValueError(f"Unsupported roman numeral '{symbol}'")


def _scale_for_symbol(key: Key, symbol: str) -> List[int]:
    scale = _MAJOR_SCALE if key.mode == "major" else _MINOR_SCALE
    if key.mode == "minor" and symbol.strip().startswith("V"):
        scale = _HARMONIC_MINOR
    return scale


def resolve_roman(key: Key, symbol: str) -> List[int]:
    degree = _degree_from_symbol(symbol)
    scale = _scale_for_symbol(key, symbol)
    triad_degrees = [degree, (degree + 2) % 7, (degree + 4) % 7]
    pcs = [(key.tonic + scale[d]) % 12 for d in triad_degrees]
    return pcs


def resolve_roman_chord(key: Key, symbol: str, variant_style: str = "triads") -> List[int]:
    pcs = resolve_roman(key, symbol)
    if not pcs:
        return []
    scale = _scale_for_symbol(key, symbol)
    degree = _degree_from_symbol(symbol)
    if variant_style in {"7ths", "9ths_soft"}:
        seventh = (key.tonic + scale[(degree + 6) % 7]) % 12
        pcs.append(seventh)
    if variant_style == "9ths_soft":
        ninth = (key.tonic + scale[(degree + 1) % 7]) % 12
        pcs.append(ninth)
    return pcs
