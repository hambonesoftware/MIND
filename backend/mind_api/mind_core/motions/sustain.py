from __future__ import annotations

from typing import List

from ..lattice import Lattice


def apply_sustain(
    lattice: Lattice,
    chord: List[int],
    bar_index: int,
    segment_start: int,
    segment_length: int,
) -> None:
    if bar_index + 1 != segment_start:
        return
    dur_steps = lattice.steps_per_bar * segment_length
    lattice.add_onset(step=0, pitches=chord, velocity=96, dur_steps=dur_steps)
