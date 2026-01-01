from __future__ import annotations

from typing import List

from ..lattice import Lattice


def _parse_pattern(pattern: str) -> List[int]:
    tokens = [t.strip() for t in pattern.split("-") if t.strip()]
    mapping = {"low": 0, "mid": 1, "high": 2}
    return [mapping.get(token, 0) for token in tokens] or [0]


def _triad_degree_indexes(chord: List[int]) -> dict[str, int]:
    pcs = [note % 12 for note in chord]
    if len(pcs) < 3:
        return {"1": 0, "3": 1, "5": 2}
    triad_map = {
        (3, 7): (3, 7),
        (4, 7): (4, 7),
        (3, 6): (3, 6),
        (4, 8): (4, 8),
        (5, 7): (5, 7),
    }
    for root in pcs:
        intervals = sorted(((pc - root) % 12) for pc in pcs if pc != root)
        pair = tuple(intervals[:2])
        if pair in triad_map:
            third_interval, fifth_interval = triad_map[pair]
            third_pc = (root + third_interval) % 12
            fifth_pc = (root + fifth_interval) % 12
            return {
                "1": pcs.index(root),
                "3": pcs.index(third_pc) if third_pc in pcs else 1,
                "5": pcs.index(fifth_pc) if fifth_pc in pcs else 2,
            }
    return {"1": 0, "3": 1, "5": 2}


def apply_arpeggiate(
    lattice: Lattice,
    chord_by_register: List[List[int]],
    pattern: str,
    mode: str = "registers",
    order: str | None = None,
    start: int = 0,
    chord_by_step: List[List[int]] | None = None,
) -> None:
    indexes = _parse_pattern(pattern)
    steps = lattice.steps_per_bar
    if mode == "registers":
        for step in range(steps):
            idx = indexes[step % len(indexes)]
            chord = chord_by_register[min(idx, len(chord_by_register) - 1)]
            if not chord:
                continue
            pitch = chord[step % len(chord)]
            lattice.add_onset(step=step, pitches=[pitch], velocity=90, dur_steps=1)
        return

    for step in range(steps):
        if chord_by_step:
            if step >= len(chord_by_step):
                continue
            chord = chord_by_step[step]
        else:
            chord = chord_by_register[1] if len(chord_by_register) > 1 else []
        if not chord:
            continue

        idx = indexes[step % len(indexes)]
        if order:
            mapping = _triad_degree_indexes(chord)
            order_cycle = []
            for token in order.split("-"):
                token = token.strip()
                if not token:
                    continue
                order_cycle.append(mapping.get(token, 0))
        else:
            order_cycle = list(range(len(chord)))

        if not order_cycle:
            order_cycle = list(range(len(chord)))

        tone_index = order_cycle[(idx + start) % len(order_cycle)]
        pitch = chord[tone_index % len(chord)]
        lattice.add_onset(step=step, pitches=[pitch], velocity=90, dur_steps=1)
