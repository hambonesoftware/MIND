"""Additional pattern generators for stream runtime."""

from __future__ import annotations

from typing import List

from ...models import Event
from ..music_elements.harmony_plan import HarmonyPlan
from ..determinism import stable_seed
from .utils import _steps_per_bar_for_grid


def _generate_strum_roll(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    direction = stable_seed(f"strum:{seed}") % 2
    events: List[Event] = []
    steps_per_beat = max(1, steps_per_bar // 4)
    for bar_index in range(bars):
        for beat in range(4):
            chord = harmony.chord_at_step(bar_index, beat * steps_per_beat)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            roll = ordered if direction == 0 else list(reversed(ordered))
            for idx, pitch in enumerate(roll):
                if idx >= steps_per_beat:
                    break
                events.append(
                    Event(
                        tBeat=bar_index * 4.0 + (beat * steps_per_beat + idx) * step_len,
                        lane="note",
                        note=pitch,
                        pitches=[pitch],
                        velocity=96,
                        durationBeats=step_len * 0.7,
                    )
                )
    return events


def _generate_riff(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    riff_patterns = [
        [0, 2, 3, 5, 7],
        [0, 3, 4, 6],
        [1, 3, 5, 6],
    ]
    riff = riff_patterns[stable_seed(f"riff:{seed}") % len(riff_patterns)]
    events: List[Event] = []
    for bar_index in range(bars):
        for idx, step in enumerate(riff):
            if step >= steps_per_bar:
                continue
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[idx % len(ordered)] + (12 if idx % 3 == 2 else 0)
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=104,
                    durationBeats=step_len * 0.6,
                )
            )
    return events


def _generate_hook(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    contour = [0, 1, 2, 3, 2, 1]
    contour_shift = stable_seed(f"hook:{seed}") % len(contour)
    events: List[Event] = []
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        for step in range(0, steps_per_bar, max(1, steps_per_bar // 6)):
            contour_idx = (step // max(1, steps_per_bar // 6) + contour_shift) % len(contour)
            idx = min(contour[contour_idx], len(ordered) - 1)
            pitch = ordered[idx] + (12 if contour_idx >= len(contour) // 2 else 0)
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=108 if contour_idx == 0 else 94,
                    durationBeats=step_len * 0.9,
                )
            )
    return events


def _generate_call_response(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    call_steps = [0, 2, 4]
    response_steps = [6, 7]
    call_shift = stable_seed(f"call:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        for idx, step in enumerate(call_steps):
            if step >= steps_per_bar:
                continue
            pitch = ordered[(idx + call_shift) % len(ordered)]
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=100,
                    durationBeats=step_len * 0.7,
                )
            )
        for idx, step in enumerate(response_steps):
            if step >= steps_per_bar:
                continue
            pitch = ordered[-1] - (idx * 2)
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=88,
                    durationBeats=step_len * 0.7,
                )
            )
    return events


def _generate_chops(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    offset = stable_seed(f"chops:{seed}") % 2
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            if (step + offset) % 2 != 1:
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
                    velocity=104,
                    durationBeats=step_len * 0.4,
                )
            )
    return events


def _generate_light_fills(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    fill_steps = max(2, steps_per_bar // 4)
    events: List[Event] = []
    fill_shift = stable_seed(f"light_fill:{seed}") % 2
    for bar_index in range(bars):
        start = steps_per_bar - fill_steps
        for idx, step in enumerate(range(start, steps_per_bar)):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            shift_idx = (idx + fill_shift) % len(ordered)
            pitch = ordered[shift_idx] + (12 if (idx + fill_shift) % 2 == 1 else 0)
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=90,
                    durationBeats=step_len * 0.5,
                )
            )
    return events


def _generate_fill_transition(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    fill_len = max(3, steps_per_bar // 3)
    for bar_index in range(bars):
        start = steps_per_bar - fill_len
        for idx, step in enumerate(range(start, steps_per_bar)):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[(idx + stable_seed(f"fill:{seed}") % len(ordered)) % len(ordered)]
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=110,
                    durationBeats=step_len * 0.4,
                )
            )
    return events


def _generate_half_time(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    events: List[Event] = []
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    beat_positions = [0.0, 2.0]
    accent_roll = stable_seed(f"half_time:{seed}") % 2
    for bar_index in range(bars):
        for idx, beat in enumerate(beat_positions):
            chord = harmony.chord_at_step(bar_index, int(beat))
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitches = ordered[-3:] if len(ordered) >= 3 else ordered
            velocity = 112 if idx == accent_roll else 98
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + beat,
                    lane="note",
                    note=pitches[0],
                    pitches=pitches,
                    velocity=velocity,
                    durationBeats=step_len * max(1, steps_per_bar // 2),
                )
            )
    return events


def _generate_swing_groove(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    if steps_per_bar >= 12:
        swing_steps = [0, 3, 6, 9]
    else:
        swing_steps = [0, 3, 5, 7]
    roll = stable_seed(f"swing:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        for idx, step in enumerate(swing_steps):
            if step >= steps_per_bar:
                continue
            pitch = ordered[(idx + roll) % len(ordered)]
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=92,
                    durationBeats=step_len * 0.8,
                )
            )
    return events


def _generate_busy_groove(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    density_roll = stable_seed(f"busy:{seed}") % 4
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            if step % 4 == density_roll:
                continue
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[step % len(ordered)]
            velocity = 100 if step % 2 == 0 else 86
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=velocity,
                    durationBeats=step_len * 0.45,
                )
            )
    return events


def _generate_riser(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    octave_shift = stable_seed(f"riser:{seed}") % 2
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        base_offset = 12 if octave_shift == 1 else 0
        tones = [pitch + base_offset for pitch in ordered] + [
            ordered[-1] + base_offset + 12,
            ordered[-1] + base_offset + 24,
        ]
        for step in range(steps_per_bar):
            idx = int(round((step / max(1, steps_per_bar - 1)) * (len(tones) - 1)))
            pitch = tones[idx]
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=80 + int(30 * (step / max(1, steps_per_bar - 1))),
                    durationBeats=step_len,
                )
            )
    return events


def _generate_noise_sweep(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    events: List[Event] = []
    rise_roll = stable_seed(f"noise:{seed}") % 2
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        start_pitch = ordered[0] + (12 if rise_roll == 1 else 0)
        end_pitch = ordered[-1] + 12
        events.append(
            Event(
                tBeat=bar_index * 4.0,
                lane="note",
                note=start_pitch,
                pitches=[start_pitch],
                velocity=60,
                durationBeats=4.0 - step_len,
            )
        )
        events.append(
            Event(
                tBeat=bar_index * 4.0 + (steps_per_bar - 1) * step_len,
                lane="note",
                note=end_pitch,
                pitches=[end_pitch],
                velocity=84,
                durationBeats=step_len,
            )
        )
    return events


def _generate_impact(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    events: List[Event] = []
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    velocity = 114 + (stable_seed(f"impact:{seed}") % 8)
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
                velocity=velocity,
                durationBeats=step_len * 2,
            )
        )
    return events


def _scaled_steps(pattern_steps: List[int], *, steps_per_bar: int) -> List[int]:
    if steps_per_bar <= 0:
        return []
    if steps_per_bar == 16:
        return pattern_steps
    scale = steps_per_bar / 16.0
    scaled = {min(steps_per_bar - 1, int(round(step * scale))) for step in pattern_steps}
    return sorted(scaled)


def _generate_string_pulse(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    offset = stable_seed(f"string_pulse:{seed}") % 2
    events: List[Event] = []
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
            pitch = ordered[0] if step % 4 == 0 else ordered[min(1, len(ordered) - 1)]
            velocity = 102 if step % 4 == 0 else 88
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


def _generate_pizzicato_stabs(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    offset = stable_seed(f"pizzicato:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            if (step + offset) % 2 == 0:
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
                    velocity=104,
                    durationBeats=step_len * 0.35,
                )
            )
    return events


def _generate_comping_chords(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    placement_roll = stable_seed(f"comping_chords:{seed}") % 2
    hit_beats = [0, 2] if placement_roll == 0 else [1, 3]
    events: List[Event] = []
    for bar_index in range(bars):
        for beat in hit_beats:
            step = beat * steps_per_beat
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitches = ordered[-4:] if len(ordered) > 4 else ordered
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitches[0],
                    pitches=pitches,
                    velocity=96,
                    durationBeats=step_len * steps_per_beat * 0.75,
                )
            )
    return events


def _generate_funk_clav(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    clav_steps = _scaled_steps([0, 3, 6, 8, 10, 12, 15], steps_per_bar=steps_per_bar)
    offset = stable_seed(f"funk_clav:{seed}") % max(1, len(clav_steps))
    events: List[Event] = []
    for bar_index in range(bars):
        for idx, step in enumerate(clav_steps):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[-1]
            velocity = 106 if idx == offset else 92
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=velocity,
                    durationBeats=step_len * 0.4,
                )
            )
    return events


def _generate_anthem_strum(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    direction = stable_seed(f"anthem_strum:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for beat in (0, 2):
            step = beat * steps_per_beat
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            roll = ordered if direction == 0 else list(reversed(ordered))
            for idx, pitch in enumerate(roll):
                if idx >= steps_per_beat:
                    break
                events.append(
                    Event(
                        tBeat=bar_index * 4.0 + (step + idx) * step_len,
                        lane="note",
                        note=pitch,
                        pitches=[pitch],
                        velocity=112 if idx == 0 else 96,
                        durationBeats=step_len * 0.8,
                    )
                )
    return events


def _generate_power_chords(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    accent_roll = stable_seed(f"power_chords:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for beat in range(4):
            if beat % 2 != accent_roll:
                continue
            step = beat * steps_per_beat
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            root = ordered[0]
            fifth = ordered[min(2, len(ordered) - 1)] if len(ordered) > 2 else root + 7
            pitches = [root, fifth, root + 12]
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitches[0],
                    pitches=pitches,
                    velocity=110,
                    durationBeats=step_len * steps_per_beat * 0.9,
                )
            )
    return events


def _generate_sidechain_pulse(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    octave_roll = stable_seed(f"sidechain_pulse:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[0] + (12 if octave_roll == 1 and step % 4 == 2 else 0)
            beat_phase = step % steps_per_beat
            velocity = 68 + int(38 * (beat_phase / max(1, steps_per_beat - 1)))
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=velocity,
                    durationBeats=step_len * 0.85,
                )
            )
    return events


def _generate_stutter_chops(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    fill_roll = stable_seed(f"stutter_chops:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for beat in range(4):
            for sub in range(2):
                step = beat * steps_per_beat + sub
                if step >= steps_per_bar:
                    continue
                if beat % 2 == fill_roll and sub == 1:
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
                        velocity=102 if sub == 0 else 90,
                        durationBeats=step_len * 0.3,
                    )
                )
    return events


def _generate_poly_bounce(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    bounce_pattern = [0, 2, 1, 2]
    octave_roll = stable_seed(f"poly_bounce:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for step in range(steps_per_bar):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            idx = bounce_pattern[step % len(bounce_pattern)]
            pitch = ordered[min(idx, len(ordered) - 1)]
            if (step + octave_roll) % 3 == 2:
                pitch += 12
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=96 if step % 4 == 0 else 84,
                    durationBeats=step_len * 0.7,
                )
            )
    return events


def _generate_cascara_ticks(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    cascara_steps = _scaled_steps([0, 3, 6, 7, 10, 12, 14], steps_per_bar=steps_per_bar)
    accent_roll = stable_seed(f"cascara:{seed}") % max(1, len(cascara_steps))
    events: List[Event] = []
    for bar_index in range(bars):
        for idx, step in enumerate(cascara_steps):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[0]
            velocity = 98 if idx == accent_roll else 86
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=velocity,
                    durationBeats=step_len * 0.4,
                )
            )
    return events


def _generate_bongo_rolls(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    roll_offset = stable_seed(f"bongo_rolls:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        chord = harmony.chord_at_step(bar_index, 0)
        if not chord:
            continue
        ordered = sorted(chord)
        if not ordered:
            continue
        roll_start = max(0, steps_per_bar - steps_per_beat)
        for idx, step in enumerate(range(roll_start, steps_per_bar)):
            pitch = ordered[min((idx + roll_offset) % len(ordered), len(ordered) - 1)]
            if idx % 2 == 1:
                pitch += 12
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=90 + (idx % 2) * 6,
                    durationBeats=step_len * 0.35,
                )
            )
    return events


def _generate_tres_guajeo(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    guajeo_steps = _scaled_steps([0, 2, 3, 5, 6, 8, 10, 11, 13, 14], steps_per_bar=steps_per_bar)
    offset = stable_seed(f"tres_guajeo:{seed}") % max(1, len(guajeo_steps))
    events: List[Event] = []
    for bar_index in range(bars):
        for idx, step in enumerate(guajeo_steps):
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            pitch = ordered[(idx + offset) % len(ordered)]
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=[pitch],
                    velocity=104 if idx == 0 else 92,
                    durationBeats=step_len * 0.5,
                )
            )
    return events


def _generate_boom_chuck(
    harmony: HarmonyPlan,
    *,
    bars: int,
    grid: str,
    seed: int,
) -> List[Event]:
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / max(1, steps_per_bar)
    steps_per_beat = max(1, steps_per_bar // 4)
    accent_roll = stable_seed(f"boom_chuck:{seed}") % 2
    events: List[Event] = []
    for bar_index in range(bars):
        for beat in range(4):
            step = beat * steps_per_beat
            chord = harmony.chord_at_step(bar_index, step)
            if not chord:
                continue
            ordered = sorted(chord)
            if not ordered:
                continue
            if (beat + accent_roll) % 2 == 0:
                pitch = ordered[0]
                pitches = [pitch]
                velocity = 102
                duration = step_len * steps_per_beat * 0.9
            else:
                pitches = ordered[-3:] if len(ordered) >= 3 else ordered
                pitch = pitches[0]
                velocity = 92
                duration = step_len * steps_per_beat * 0.6
            events.append(
                Event(
                    tBeat=bar_index * 4.0 + step * step_len,
                    lane="note",
                    note=pitch,
                    pitches=pitches,
                    velocity=velocity,
                    durationBeats=duration,
                )
            )
    return events

