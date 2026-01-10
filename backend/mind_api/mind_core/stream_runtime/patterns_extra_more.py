"""Additional groove pattern generators for stream runtime."""

from __future__ import annotations

from typing import List

from ...models import Event
from ..music_elements.harmony_plan import HarmonyPlan
from ..determinism import stable_seed
from .utils import _steps_per_bar_for_grid


def _generate_mandolin_chop(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    offset = stable_seed(f"mandolin_chop:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for beat in range(4):
            step = beat * steps_per_beat + max(1, steps_per_beat // 2)
            if (beat + offset) % 2 == 1:
                step = min(steps_per_bar - 1, step + 1)
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitches = ordered[-3:] if len(ordered) >= 3 else ordered
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitches[0],
                    pitches=pitches,
                    velocity=106,
                    durationBeats=step_len * 0.3,
                )
            )
    return events


def _generate_banjo_clawhammer(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_strum = max(1, steps_per_bar // 8)
    claw_pattern = [0, 2, 1, 2]
    roll = stable_seed(f"banjo_clawhammer:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for idx, step in enumerate(range(0, steps_per_bar, steps_per_strum)):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            tone_idx = claw_pattern[(idx + roll) % len(claw_pattern)]
            pitch = ordered[min(tone_idx, len(ordered) - 1)]
            if idx % 4 == 3:
                pitch += 12
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=94 if idx % 2 == 0 else 82,
                    durationBeats=step_len * 0.6,
                )
            )
    return events
