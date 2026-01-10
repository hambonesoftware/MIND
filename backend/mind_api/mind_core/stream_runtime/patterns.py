"""Pattern generators for stream runtime."""

from __future__ import annotations

from typing import List

from ...models import Event
from ..music_elements.harmony_plan import HarmonyPlan
from ..music_elements.phrase_plan import PhrasePlan
from ..music_elements.texture_engine import generate_events
from ..music_elements.texture_recipe import TextureRecipe
from ..determinism import stable_seed
from .utils import _pattern_family_for_type, _steps_per_bar_for_grid
from .patterns_extra import (
    _generate_strum_roll,
    _generate_riff,
    _generate_hook,
    _generate_call_response,
    _generate_chops,
    _generate_light_fills,
    _generate_fill_transition,
    _generate_half_time,
    _generate_swing_groove,
    _generate_busy_groove,
    _generate_riser,
    _generate_noise_sweep,
    _generate_impact,
    _generate_string_pulse,
    _generate_pizzicato_stabs,
    _generate_comping_chords,
    _generate_funk_clav,
    _generate_anthem_strum,
    _generate_power_chords,
    _generate_sidechain_pulse,
    _generate_stutter_chops,
    _generate_poly_bounce,
    _generate_cascara_ticks,
    _generate_bongo_rolls,
    _generate_tres_guajeo,
    _generate_boom_chuck,
)
from .patterns_extra_more import (
    _generate_mandolin_chop,
    _generate_banjo_clawhammer,
)


def _generate_pattern_type(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    pattern_type: str,
    piece_id: str,
    sustain_policy: str = "hold_until_change",
) -> List[Event]:
    pattern_family = _pattern_family_for_type(pattern_type, seed=seed)
    texture = TextureRecipe(pattern_family=pattern_family, sustain_policy=sustain_policy)
    phrase = PhrasePlan(density_curve=(1.0,))
    return generate_events(
        harmony,
        texture,
        phrase,
        bars=bars,
        grid=grid,
        seed=seed,
        piece_id=piece_id,
    )


def _generate_simple_arpeggio(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-up",
        piece_id=piece_id,
    )


def _generate_descending_arpeggio(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-down",
        piece_id=piece_id,
    )


def _generate_skipping_arpeggio(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-skip",
        piece_id=piece_id,
    )


def _generate_sustain_drone(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-down",
        piece_id=piece_id,
        sustain_policy="hold_until_change",
    )


def _generate_offbeat_plucks(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-up",
        piece_id=piece_id,
    )


def _generate_swing_response(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-down",
        piece_id=piece_id,
    )


def _generate_latin_clave(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-up",
        piece_id=piece_id,
    )


def _generate_folk_roll(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-up",
        piece_id=piece_id,
    )


def _generate_airy_arp(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-up",
        piece_id=piece_id,
    )


def _generate_grit_riff(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-skip",
        piece_id=piece_id,
    )


def _generate_montuno_pattern(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-up",
        piece_id=piece_id,
    )


def _generate_travis_pick(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
    piece_id: str,
) -> List[Event]:
    return _generate_pattern_type(
        harmony,
        bars=bars,
        grid=grid,
        seed=seed,
        pattern_type="arp-3-down",
        piece_id=piece_id,
    )


def _generate_alberti_bass(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    variant_roll = stable_seed(f"alberti:{seed}") % 2
    pattern = [0, 2, 1, 2] if variant_roll == 0 else [0, 1, 2, 1]
    events: List[Event] = []
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            idx = min(pattern[step % len(pattern)], len(ordered) - 1)
            pitch = ordered[idx]
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=96,
                    durationBeats=step_len,
                )
            )
    return events


def _generate_walking_bass(
    harmony: HarmonyPlan,
    *,
    bars: int,
    seed: int,
    register_min: int,
    register_max: int,
) -> List[Event]:
    events: List[Event] = []
    direction_roll = stable_seed(f"walking:{seed}") % 4
    passing_intervals = [-2, 2, -1, 1]
    passing = passing_intervals[direction_roll % len(passing_intervals)]
    approach_up = direction_roll % 2 == 0
    for bar_index in range(bars):
        for beat in range(4):
            chord = harmony.chord_at_step(bar_index, beat * max(1, harmony.steps_per_bar // 4))
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            root = ordered[0]
            third = ordered[min(1, len(ordered) - 1)]
            fifth = ordered[min(2, len(ordered) - 1)] if len(ordered) > 2 else root + 7
            choices = [root - 12, root, third, fifth]
            pitch = choices[min(beat, len(choices) - 1)]
            if beat == 3:
                target = root + (passing if approach_up else -passing)
                pitch = target
            while pitch < register_min:
                pitch += 12
            while pitch > register_max:
                pitch -= 12
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + beat,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=96,
                    durationBeats=1.0,
                )
            )
    return events


def _generate_ostinato_pulse(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    accent_every = 2 if steps_per_bar >= 8 else 1
    events: List[Event] = []
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[0]
            velocity = 102 if step % accent_every == 0 else 90
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=velocity,
                    durationBeats=step_len,
                )
            )
    return events


def _generate_walking_bass_simple(
    harmony: HarmonyPlan,
    *,
    bars: int,
    seed: int,
    register_min: int,
    register_max: int,
) -> List[Event]:
    events: List[Event] = []
    pattern_roll = stable_seed(f"walking_simple:{seed}") % 2
    for bar_index in range(bars):
        for beat in range(4):
            chord = harmony.chord_at_step(bar_index, beat * max(1, harmony.steps_per_bar // 4))
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            root = ordered[0]
            fifth = ordered[min(2, len(ordered) - 1)] if len(ordered) > 2 else root + 7
            pitch = root if (beat + pattern_roll) % 2 == 0 else fifth
            while pitch < register_min:
                pitch += 12
            while pitch > register_max:
                pitch -= 12
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + beat,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=92,
                    durationBeats=1.0,
                )
            )
    return events


def _generate_comping_stabs(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    for bar_index in range(bars):
        bar_seed = stable_seed(f"comping:{seed}:{bar_index}")
        for step in range(steps_per_bar):
            if step % 2 == 0:
                continue
            if bar_seed % 3 == 0 and step % 4 == 1:
                continue
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
                    velocity=88,
                    durationBeats=step_len * 0.6,
                )
            )
    return events


def _generate_gate_mask(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            mask_roll = stable_seed(f"gate:{seed}:{bar_index}:{step}") % 100
            if mask_roll < 45:
                continue
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitches = ordered
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitches[0],
                    pitches=pitches,
                    velocity=80,
                    durationBeats=step_len * 0.5,
                )
            )
    return events


def _generate_step_arp_octave(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    pattern = [0, 1, 2, 1]
    octave_roll = stable_seed(f"octave_arp:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            idx = min(pattern[step % len(pattern)], len(ordered) - 1)
            pitch = ordered[idx]
            if (step + octave_roll) % len(pattern) == len(pattern) - 1:
                pitch += 12
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=95,
                    durationBeats=step_len,
                )
            )
    return events


def _generate_pad_drone(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    events: List[Event] = []
    sustain_roll = stable_seed(f"pad_drone:{seed}") % 3
    sustain_len = 4.0 if sustain_roll == 0 else 3.5
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        pitches = ordered[-4:] if len(ordered) > 4 else ordered
        events.append(
            Event(
                tBeat=bar_index * 4.0,
                lane="note",
                note=pitches[0],
                pitches=pitches,
                velocity=70,
                durationBeats=sustain_len,
            )
        )
        if sustain_roll == 2 and steps_per_bar >= 8:
            shimmer_step = int(steps_per_bar * 0.75)
            shimmer_pitch = pitches[-1] + 12
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + shimmer_step * (4.0 / steps_per_bar),
                    lane="note",
                    note=shimmer_pitch,
                    pitches=[shimmer_pitch],
                    velocity=62,
                    durationBeats=4.0 / steps_per_bar,
                )
            )
    return events


def _generate_pedal_tone(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    events: List[Event] = []
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    octave_roll = stable_seed(f"pedal:{seed}") % 2
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        pitch = ordered[0] + (12 if octave_roll == 1 else 0)
        events.append(
            Event(
                tBeat=bar_index * 4.0,
                lane="note",
                note=pitch,
                pitches=[pitch],
                velocity=68,
                durationBeats=4.0 - step_len * 0.5,
            )
        )
    return events


def _generate_root_pulse(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    pulse_roll = stable_seed(f"root_pulse:{seed}") % 2
    for bar_index in range(bars):
        for step in range(0, steps_per_bar, max(1, steps_per_bar // 4)):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[0]
            velocity = 100 if (step // max(1, steps_per_bar // 4)) % 2 == pulse_roll else 88
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=velocity,
                    durationBeats=step_len * 0.8,
                )
            )
    return events


def _generate_pulse(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    offset = stable_seed(f"pulse:{seed}") % 2
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            if step % 2 != offset:
                continue
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            idx = step % len(ordered)
            pitch = ordered[idx]
            velocity = 98 if step % 4 == 0 else 84
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=velocity,
                    durationBeats=step_len * 0.9,
                )
            )
    return events
