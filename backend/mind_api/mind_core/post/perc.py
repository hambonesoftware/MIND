from __future__ import annotations

from typing import Dict, List, Optional

from ...models import Event, PercSpec


_LANE_TO_NOTE = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
}


def _steps_per_bar(grid: str) -> Optional[int]:
    mapping = {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,
        "1/16": 16,
        "1/24": 24,
    }
    return mapping.get(grid)


def _emit_mask_events(
    lane: str,
    mask: str,
    steps_per_bar: int,
    velocity: int = 100,
    duration: float = 0.1,
) -> List[Event]:
    events: List[Event] = []
    note = _LANE_TO_NOTE[lane]
    for idx, char in enumerate(mask):
        if char.lower() != "x":
            continue
        tbeat = (idx / steps_per_bar) * 4.0
        events.append(
            Event(
                tBeat=tbeat,
                lane=lane,
                note=note,
                pitches=[note],
                velocity=velocity,
                durationBeats=duration,
                preset=None,
            )
        )
    return events


def apply_perc(events: List[Event], spec: PercSpec) -> List[Event]:
    """Append percussion events from masks."""
    if not spec.enabled:
        return list(events)

    grid = spec.grid or "1/8"
    steps_per_bar = _steps_per_bar(grid)
    if steps_per_bar is None:
        return list(events)

    masks: Dict[str, Optional[str]] = {
        "kick": spec.kick,
        "snare": spec.snare,
        "hat": spec.hat,
    }

    percussion_events: List[Event] = []
    for lane, mask in masks.items():
        if mask:
            percussion_events.extend(_emit_mask_events(lane, mask, steps_per_bar))

    return list(events) + percussion_events
