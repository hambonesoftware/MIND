"""Strum post-processing for chord events."""

from __future__ import annotations

from typing import List, Optional

from ...models import Event, StrumSpec


def _beats_from_spread_ms(spread_ms: Optional[int], bpm: float) -> float:
    if not spread_ms:
        return 0.0
    seconds = spread_ms / 1000.0
    return seconds * (bpm / 60.0)


def _resolve_direction(pattern: Optional[str]) -> str:
    if not pattern:
        return "up"
    lowered = pattern.strip().lower()
    if lowered.startswith("down"):
        return "down"
    if lowered.startswith("up"):
        return "up"
    return "up"


def apply_strum(events: List[Event], spec: StrumSpec, bpm: float) -> List[Event]:
    """Transform chord events into staggered single-note events."""
    spread_beats = _beats_from_spread_ms(spec.spreadMs, bpm)
    if spread_beats <= 0:
        return events

    direction = _resolve_direction(spec.directionPattern)
    processed: List[Event] = []

    for event in events:
        if not event.pitches or len(event.pitches) <= 1:
            processed.append(event)
            continue

        pitches = list(event.pitches)
        if direction == "down":
            pitches = list(reversed(pitches))

        count = len(pitches)
        if count == 1:
            processed.append(event)
            continue

        step = spread_beats / max(count - 1, 1)
        for idx, pitch in enumerate(pitches):
            processed.append(
                Event(
                    tBeat=event.tBeat + step * idx,
                    lane=event.lane,
                    note=pitch,
                    pitches=[pitch],
                    velocity=event.velocity,
                    durationBeats=event.durationBeats,
                    preset=event.preset,
                )
            )

    return processed
