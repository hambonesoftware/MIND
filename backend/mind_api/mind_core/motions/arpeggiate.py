from __future__ import annotations

from typing import List

from ..lattice import Lattice


def _parse_pattern(pattern: str) -> List[int]:
    tokens = [t.strip() for t in pattern.split("-") if t.strip()]
    mapping = {"low": 0, "mid": 1, "high": 2}
    return [mapping.get(token, 0) for token in tokens] or [0]


def apply_arpeggiate(
    lattice: Lattice,
    chord_by_register: List[List[int]],
    pattern: str,
) -> None:
    indexes = _parse_pattern(pattern)
    steps = lattice.steps_per_bar
    for step in range(steps):
        idx = indexes[step % len(indexes)]
        chord = chord_by_register[min(idx, len(chord_by_register) - 1)]
        if not chord:
            continue
        pitch = chord[step % len(chord)]
        lattice.add_onset(step=step, pitches=[pitch], velocity=90, dur_steps=1)
