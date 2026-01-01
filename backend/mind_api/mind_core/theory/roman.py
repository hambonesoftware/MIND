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


def resolve_roman(key: Key, symbol: str) -> List[int]:
    degree = _degree_from_symbol(symbol)
    scale = _MAJOR_SCALE if key.mode == "major" else _MINOR_SCALE
    if key.mode == "minor" and symbol.strip().startswith("V"):
        scale = _HARMONIC_MINOR

    triad_degrees = [degree, (degree + 2) % 7, (degree + 4) % 7]
    pcs = [(key.tonic + scale[d]) % 12 for d in triad_degrees]
    return pcs
