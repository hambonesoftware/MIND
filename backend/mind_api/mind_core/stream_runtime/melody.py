"""Melody and thought compilation for stream runtime."""

from __future__ import annotations

import logging
from typing import List

from ..determinism import stable_seed
from ...models import Diagnostic, Event, FlowGraphNode
from ..music_elements.harmony_plan import HarmonyPlan
from ..music_elements.phrase_plan import PhrasePlan
from ..music_elements.texture_engine import generate_events
from ..music_elements.texture_recipe import TextureRecipe
from ..notes import note_name_to_midi
from .constants import ALLOWED_GRIDS, PATTERN_TYPE_BY_NOTE_ID
from .harmony import _apply_register, _build_chord_pitches, _normalize_harmony_mode, _resolve_progression_harmony
from .patterns import (
    _generate_alberti_bass,
    _generate_busy_groove,
    _generate_call_response,
    _generate_chops,
    _generate_comping_stabs,
    _generate_fill_transition,
    _generate_gate_mask,
    _generate_half_time,
    _generate_hook,
    _generate_impact,
    _generate_light_fills,
    _generate_noise_sweep,
    _generate_ostinato_pulse,
    _generate_pad_drone,
    _generate_pedal_tone,
    _generate_pulse,
    _generate_riff,
    _generate_riser,
    _generate_root_pulse,
    _generate_step_arp_octave,
    _generate_strum_roll,
    _generate_swing_groove,
    _generate_walking_bass,
    _generate_walking_bass_simple,
)
from .utils import (
    _apply_timing_adjustments,
    _combined_seed,
    _coerce_number,
    _intensity_to_velocity,
    _pattern_family_for_type,
    _slice_events_to_bar,
    _steps_per_bar_for_grid,
)

logger = logging.getLogger(__name__)

_EXPLICIT_NOTE_PATTERN_IDS = {
    "walking_bass",
    "alberti_bass",
    "ostinato_pulse",
    "walking_bass_simple",
    "comping_stabs",
    "gate_mask",
    "step_arp_octave",
    "pad_drone",
    "pedal_tone",
    "root_pulse",
    "pulse",
    "strum_roll",
    "riff",
    "hook",
    "call_response",
    "chops",
    "light_fills",
    "fill_transition",
    "half_time",
    "swing_groove",
    "busy_groove",
    "riser",
    "noise_sweep",
    "impact",
}


def _parse_custom_notes(raw: object) -> List[int]:
    tokens: List[str] = []
    if raw is None:
        return tokens
    if isinstance(raw, str):
        tokens = [tok for tok in raw.split() if tok]
    elif isinstance(raw, list):
        tokens = [str(tok) for tok in raw if tok is not None]
    values: List[int] = []
    for tok in tokens:
        try:
            values.append(int(tok))
            continue
        except (TypeError, ValueError):
            pass
        try:
            values.append(note_name_to_midi(tok))
            continue
        except Exception:
            continue
    return values


def _compile_custom_melody_bar(
    node: FlowGraphNode,
    *,
    bar_offset: int,
    diagnostics: List[Diagnostic],
) -> List[Event]:
    params = node.params or {}
    custom = params.get("customMelody") or {}
    grid = str(custom.get("grid") or params.get("rhythmGrid") or "1/16")
    steps_per_bar = _steps_per_bar_for_grid(grid)
    if steps_per_bar <= 0:
        diagnostics.append(
            Diagnostic(level="error", message=f"Thought '{node.id}': invalid custom grid '{grid}'", line=1, col=1)
        )
        return []

    bars = custom.get("bars") or []
    if not isinstance(bars, list) or not bars:
        diagnostics.append(
            Diagnostic(level="warn", message=f"Thought '{node.id}': missing custom melody bars; skipping.", line=1, col=1)
        )
        return []

    entry = bars[bar_offset % len(bars)] if bars else {}
    rhythm = str(entry.get("rhythm") or "")
    if not rhythm:
        diagnostics.append(
            Diagnostic(level="warn", message=f"Thought '{node.id}': empty rhythm for custom melody; skipping.", line=1, col=1)
        )
        return []

    notes = _parse_custom_notes(entry.get("notes"))
    note_index = 0
    step_len = 4.0 / steps_per_bar
    events: List[Event] = []

    for idx, ch in enumerate(rhythm):
        if ch in {".", "-"}:
            continue

        hold_steps = 0
        j = idx + 1
        while j < len(rhythm) and rhythm[j] == "-":
            hold_steps += 1
            j += 1

        duration_beats = (1 + hold_steps) * step_len
        tbeat = idx * step_len

        if note_index >= len(notes):
            diagnostics.append(
                Diagnostic(
                    level="warn",
                    message=f"Thought '{node.id}': insufficient notes for custom melody; truncating.",
                    line=1,
                    col=1,
                )
            )
            break

        pitches = [notes[note_index]]
        note_index += 1

        events.append(
            Event(
                tBeat=tbeat,
                lane="note",
                note=pitches[0],
                pitches=pitches,
                velocity=_intensity_to_velocity(ch) if ch and ch.isdigit() else 96,
                durationBeats=duration_beats,
            )
        )

    return events


def _compile_thought_bar(
    node: FlowGraphNode,
    bar_offset: int,
    bpm: float,
    diagnostics: List[Diagnostic],
    seed: int,
) -> List[Event]:
    params = node.params or {}
    melody_mode = (params.get("melodyMode") or "generated").lower()
    if melody_mode == "custom":
        events = _compile_custom_melody_bar(node, bar_offset=bar_offset, diagnostics=diagnostics)
        for event in events:
            event.sourceNodeId = node.id
            event.preset = params.get("instrumentPreset") or None
        return events

    grid = str(params.get("rhythmGrid") or "1/12")
    if grid not in ALLOWED_GRIDS:
        diagnostics.append(
            Diagnostic(level="error", message=f"Thought '{node.id}': invalid grid '{grid}'", line=1, col=1)
        )
        return []

    duration_bars = max(1, _coerce_number(params.get("durationBars"), 1))
    register_min = _coerce_number(params.get("registerMin"), 48)
    register_max = _coerce_number(params.get("registerMax"), 84)
    style_seed = _coerce_number(params.get("styleSeed"), 0)
    combined_seed = _combined_seed(seed, style_seed, node.id)
    note_pattern_id = (params.get("notePatternId") or "").strip().lower()
    supported_note_pattern_ids = _EXPLICIT_NOTE_PATTERN_IDS | set(PATTERN_TYPE_BY_NOTE_ID)
    if note_pattern_id and note_pattern_id not in supported_note_pattern_ids:
        diagnostics.append(
            Diagnostic(
                level="error",
                message=f"Thought '{node.id}': note pattern id '{note_pattern_id}' has no generator.",
                line=1,
                col=1,
            )
        )
        return []
    pattern_seed = stable_seed(f"{combined_seed}:{note_pattern_id}") % 2147483647
    pattern_type = params.get("patternType") or PATTERN_TYPE_BY_NOTE_ID.get(note_pattern_id, "arp-3-up")
    logger.info(
        "thought pattern selection note_pattern_id=%s pattern_type=%s pattern_seed=%s",
        note_pattern_id,
        pattern_type,
        pattern_seed,
    )

    if _normalize_harmony_mode(params) == "single":
        chord = _build_chord_pitches(params)
        chord = _apply_register(chord, register_min=register_min, register_max=register_max)
        harmony = HarmonyPlan.from_chords([chord] * duration_bars, steps_per_bar=_steps_per_bar_for_grid(grid))
    else:
        harmony = _resolve_progression_harmony(params, duration_bars, grid)
    generated: List[Event]
    if note_pattern_id == "walking_bass":
        logger.info("pattern=walking_bass: generator=_generate_walking_bass")
        bass_min = max(0, register_min - 12)
        generated = _generate_walking_bass(
            harmony,
            bars=duration_bars,
            seed=pattern_seed,
            register_min=bass_min,
            register_max=max(register_min, register_max),
        )
    elif note_pattern_id == "alberti_bass":
        logger.info("pattern=alberti_bass: generator=_generate_alberti_bass")
        generated = _generate_alberti_bass(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "ostinato_pulse":
        logger.info("pattern=ostinato_pulse: generator=_generate_ostinato_pulse")
        generated = _generate_ostinato_pulse(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "walking_bass_simple":
        logger.info("pattern=walking_bass_simple: generator=_generate_walking_bass_simple")
        bass_min = max(0, register_min - 12)
        generated = _generate_walking_bass_simple(
            harmony,
            bars=duration_bars,
            seed=pattern_seed,
            register_min=bass_min,
            register_max=max(register_min, register_max),
        )
    elif note_pattern_id == "comping_stabs":
        logger.info("pattern=comping_stabs: generator=_generate_comping_stabs")
        generated = _generate_comping_stabs(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "gate_mask":
        logger.info("pattern=gate_mask: generator=_generate_gate_mask")
        generated = _generate_gate_mask(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "step_arp_octave":
        logger.info("pattern=step_arp_octave: generator=_generate_step_arp_octave")
        generated = _generate_step_arp_octave(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "pad_drone":
        logger.info("pattern=pad_drone: generator=_generate_pad_drone")
        generated = _generate_pad_drone(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "pedal_tone":
        logger.info("pattern=pedal_tone: generator=_generate_pedal_tone")
        generated = _generate_pedal_tone(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "root_pulse":
        logger.info("pattern=root_pulse: generator=_generate_root_pulse")
        generated = _generate_root_pulse(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "pulse":
        logger.info("pattern=pulse: generator=_generate_pulse")
        generated = _generate_pulse(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "strum_roll":
        logger.info("pattern=strum_roll: generator=_generate_strum_roll")
        generated = _generate_strum_roll(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "riff":
        logger.info("pattern=riff: generator=_generate_riff")
        generated = _generate_riff(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "hook":
        logger.info("pattern=hook: generator=_generate_hook")
        generated = _generate_hook(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "call_response":
        logger.info("pattern=call_response: generator=_generate_call_response")
        generated = _generate_call_response(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "chops":
        logger.info("pattern=chops: generator=_generate_chops")
        generated = _generate_chops(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "light_fills":
        logger.info("pattern=light_fills: generator=_generate_light_fills")
        generated = _generate_light_fills(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "fill_transition":
        logger.info("pattern=fill_transition: generator=_generate_fill_transition")
        generated = _generate_fill_transition(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "half_time":
        logger.info("pattern=half_time: generator=_generate_half_time")
        generated = _generate_half_time(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "swing_groove":
        logger.info("pattern=swing_groove: generator=_generate_swing_groove")
        generated = _generate_swing_groove(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "busy_groove":
        logger.info("pattern=busy_groove: generator=_generate_busy_groove")
        generated = _generate_busy_groove(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "riser":
        logger.info("pattern=riser: generator=_generate_riser")
        generated = _generate_riser(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "noise_sweep":
        logger.info("pattern=noise_sweep: generator=_generate_noise_sweep")
        generated = _generate_noise_sweep(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    elif note_pattern_id == "impact":
        logger.info("pattern=impact: generator=_generate_impact")
        generated = _generate_impact(harmony, bars=duration_bars, grid=grid, seed=pattern_seed)
    else:
        pattern_family = _pattern_family_for_type(pattern_type, seed=pattern_seed)
        logger.info(
            "pattern=fallback: generator=generate_events pattern_type=%s pattern_family=%s",
            pattern_type,
            pattern_family,
        )
        texture = TextureRecipe(pattern_family=pattern_family, sustain_policy="hold_until_change")
        phrase = PhrasePlan(density_curve=(1.0,))
        generated = generate_events(
            harmony,
            texture,
            phrase,
            bars=duration_bars,
            grid=grid,
            seed=pattern_seed,
            piece_id=node.id,
        )

    events = _slice_events_to_bar(generated, bar_offset=bar_offset)

    syncopation = params.get("syncopation") or "none"
    timing_warp = params.get("timingWarp") or "none"
    intensity = params.get("timingIntensity") or 0
    events = _apply_timing_adjustments(
        events,
        grid=grid,
        syncopation=syncopation,
        timing_warp=timing_warp,
        intensity=float(intensity or 0),
    )

    lane = str(params.get("lane") or "note")
    preset = params.get("instrumentPreset") or None
    for event in events:
        event.lane = lane
        event.preset = preset
        event.sourceNodeId = node.id
    return events


def _thought_total_bars(node: FlowGraphNode) -> int:
    params = node.params or {}
    return max(1, _coerce_number(params.get("durationBars"), 1))
