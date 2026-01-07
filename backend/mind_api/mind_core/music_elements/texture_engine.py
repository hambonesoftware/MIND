from __future__ import annotations

from typing import Iterable, List

from ..determinism import stable_seed
from ..lattice import Lattice, steps_per_bar_from_grid
from ...models import Event
from .harmony_plan import HarmonyPlan
from .phrase_plan import PhrasePlan
from .texture_recipe import TextureRecipe


_PATTERN_MAP = {
    "low-mid-high": [0, 1, 2],
    "high-mid-low": [2, 1, 0],
    "low-high-mid": [0, 2, 1],
    "high-low-mid": [2, 0, 1],
}


def generate_events(
    harmony: HarmonyPlan,
    texture: TextureRecipe,
    phrase: PhrasePlan,
    *,
    bars: int,
    grid: str = "1/12",
    seed: int = 0,
    piece_id: str = "piece",
) -> List[Event]:
    steps_per_bar = steps_per_bar_from_grid(grid)
    events: List[Event] = []

    for bar_index in range(bars):
        lattice = Lattice(steps_per_bar)
        density = phrase.density_for_bar(bar_index, bars=bars)
        pattern = texture.pattern_for_bar(seed=seed, piece_id=piece_id, bar_index=bar_index)
        pattern_steps = _PATTERN_MAP.get(pattern, _PATTERN_MAP["low-mid-high"])
        pattern_offset = stable_seed(f"{piece_id}:{seed}:{bar_index}:offset") % len(pattern_steps)

        chord_by_step = [
            harmony.chord_at_step(bar_index, step) for step in range(steps_per_bar)
        ]

        for step in range(steps_per_bar):
            if not _should_emit_step(seed, piece_id, bar_index, step, density):
                continue
            chord = chord_by_step[step]
            offset_step = step + pattern_offset
            pitches = _select_pattern_pitches(
                chord,
                pattern_steps,
                offset_step,
                rotation_seed=seed,
            )
            if pitches:
                lattice.add_onset(step=step, pitches=pitches, velocity=96, dur_steps=1)

        if texture.sustain_policy in {"hold_until_change", "pedal_hold"}:
            _apply_sustain_layer(
                lattice,
                chord_by_step=chord_by_step,
                steps_per_bar=steps_per_bar,
                policy=texture.sustain_policy,
            )

        bar_events = lattice.to_events(lane="note", preset=None)
        for event in bar_events:
            event.tBeat += bar_index * 4.0
        events.extend(bar_events)

    return sorted(events, key=lambda e: (e.tBeat, e.pitches[0] if e.pitches else -1))


def _should_emit_step(
    seed: int,
    piece_id: str,
    bar_index: int,
    step: int,
    density: float,
) -> bool:
    density = max(0.0, min(1.0, density))
    if density >= 0.999:
        return True
    threshold = int(density * 1000)
    roll = stable_seed(f"{piece_id}:{seed}:{bar_index}:{step}") % 1000
    return roll < threshold


def _select_pattern_pitches(
    chord: Iterable[int],
    pattern_steps: List[int],
    step: int,
    *,
    rotation_seed: int,
) -> List[int]:
    chord_list = list(chord)
    if not chord_list:
        return []
    if len(chord_list) > 1:
        rotation = rotation_seed % len(chord_list)
        if rotation:
            chord_list = chord_list[rotation:] + chord_list[:rotation]
    index = pattern_steps[step % len(pattern_steps)]
    index = min(index, len(chord_list) - 1)
    return [chord_list[index]]


def _apply_sustain_layer(
    lattice: Lattice,
    *,
    chord_by_step: List[List[int]],
    steps_per_bar: int,
    policy: str,
) -> None:
    change_steps: List[int] = []
    last_chord: List[int] | None = None
    for step, chord in enumerate(chord_by_step):
        if last_chord is None or chord != last_chord:
            change_steps.append(step)
            last_chord = chord
    if not change_steps:
        return

    for idx, step in enumerate(change_steps):
        chord = chord_by_step[step]
        if not chord:
            continue
        if policy == "hold_until_change":
            next_step = change_steps[idx + 1] if idx + 1 < len(change_steps) else steps_per_bar
        else:
            next_step = steps_per_bar
        dur_steps = max(1, next_step - step)
        lattice.add_onset(step=step, pitches=chord, velocity=90, dur_steps=dur_steps)
