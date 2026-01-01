from __future__ import annotations

from typing import List

from ...models import Event, StrumSpec


def _strum_direction(spec: StrumSpec) -> str:
    if spec.directionByStep:
        return spec.directionByStep.strip()[:1].upper() or "D"
    return "D"


def apply_strum(events: List[Event], spec: StrumSpec, bpm: float) -> List[Event]:
    """Split chord events into staggered note events."""
    if not spec.enabled:
        return list(events)

    spread_ms = spec.spreadMs or 0
    spread_beats = (spread_ms / 1000.0) * (bpm / 60.0)
    direction = _strum_direction(spec)

    strummed: List[Event] = []
    for event in events:
        if len(event.pitches) < 2 or spread_beats <= 0:
            strummed.append(event)
            continue

        pitches = sorted(event.pitches, reverse=(direction == "U"))
        per_note = spread_beats / max(1, (len(pitches) - 1))
        for index, pitch in enumerate(pitches):
            offset = per_note * index
            duration = max(0.0, event.durationBeats - offset)
            strummed.append(
                Event(
                    tBeat=event.tBeat + offset,
                    lane=event.lane,
                    note=pitch,
                    pitches=[pitch],
                    velocity=event.velocity,
                    durationBeats=duration,
                    preset=event.preset,
                )
            )

    return strummed
