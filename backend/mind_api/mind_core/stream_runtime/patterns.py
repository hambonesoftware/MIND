"""Pattern generators for stream runtime."""

from __future__ import annotations

from typing import List

from ...models import Event
from ..music_elements.harmony_plan import HarmonyPlan
from ..determinism import stable_seed
from .utils import _steps_per_bar_for_grid


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
