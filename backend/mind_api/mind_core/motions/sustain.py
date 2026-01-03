from __future__ import annotations

from typing import List

from ..lattice import Lattice


def apply_sustain(
    lattice: Lattice,
    chord: List[int],
    bar_index: int,
    segment_start: int,
    segment_length: int,
    *,
    policy: str = "hold_until_change",
    chord_by_step: List[List[int]] | None = None,
    steps_per_bar: int | None = None,
    pedal_lift_steps: List[int] | None = None,
) -> None:
    if policy in {"hold_until_change", "pedal_hold"} and chord_by_step and steps_per_bar:
        _apply_sustain_by_policy(
            lattice,
            chord_by_step=chord_by_step,
            steps_per_bar=steps_per_bar,
            policy=policy,
            pedal_lift_steps=pedal_lift_steps,
        )
        return

    if bar_index + 1 != segment_start:
        return
    dur_steps = lattice.steps_per_bar * segment_length
    lattice.add_onset(step=0, pitches=chord, velocity=96, dur_steps=dur_steps)


def _apply_sustain_by_policy(
    lattice: Lattice,
    *,
    chord_by_step: List[List[int]],
    steps_per_bar: int,
    policy: str,
    pedal_lift_steps: List[int] | None,
) -> None:
    change_steps: List[int] = []
    last_chord: List[int] | None = None
    for step, chord in enumerate(chord_by_step):
        if last_chord is None or chord != last_chord:
            change_steps.append(step)
            last_chord = chord

    if not change_steps:
        return

    pedal_lifts = sorted(
        {
            step
            for step in (pedal_lift_steps or [])
            if 0 < step <= steps_per_bar
        }
    )

    for idx, step in enumerate(change_steps):
        chord = chord_by_step[step]
        if not chord:
            continue
        if policy == "hold_until_change":
            next_step = change_steps[idx + 1] if idx + 1 < len(change_steps) else steps_per_bar
        else:
            next_step = next((lift for lift in pedal_lifts if lift > step), steps_per_bar)
        dur_steps = max(1, next_step - step)
        lattice.add_onset(step=step, pitches=chord, velocity=96, dur_steps=dur_steps)
