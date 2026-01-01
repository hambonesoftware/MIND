"""Percussion post-processing for mask-driven drums."""

from __future__ import annotations

from typing import List

from ...models import Event, PercSpec

LANE_TO_MIDI = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
}


def _steps_per_bar(grid: str) -> int:
    mapping = {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,
        "1/16": 16,
        "1/24": 24,
    }
    return mapping.get(grid, 8)


def _mask_to_events(mask: str, lane: str, steps_per_bar: int) -> List[Event]:
    events: List[Event] = []
    for idx, ch in enumerate(mask):
        if ch in {".", " "}:
            continue
        tbeat = (idx / steps_per_bar) * 4.0
        events.append(
            Event(
                tBeat=tbeat,
                lane=lane,
                note=LANE_TO_MIDI[lane],
                pitches=[LANE_TO_MIDI[lane]],
                velocity=100,
                durationBeats=0.1,
                preset=None,
            )
        )
    return events


def apply_perc(events: List[Event], spec: PercSpec) -> List[Event]:
    """Add percussion events from masks."""
    if not spec.grid:
        return events

    steps_per_bar = _steps_per_bar(spec.grid)
    output = list(events)
    if spec.kickMask:
        output.extend(_mask_to_events(spec.kickMask, "kick", steps_per_bar))
    if spec.snareMask:
        output.extend(_mask_to_events(spec.snareMask, "snare", steps_per_bar))
    if spec.hatMask:
        output.extend(_mask_to_events(spec.hatMask, "hat", steps_per_bar))
    return output
