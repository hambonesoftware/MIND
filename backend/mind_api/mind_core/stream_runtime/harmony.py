"""Harmony and chord resolution helpers for stream runtime."""

from __future__ import annotations

from typing import List

from ..music_elements.harmony_plan import HarmonyPlan, HarmonyStep
from ..notes import note_name_to_midi, parse_notes_spec
from ..progression_presets import get_progression_preset
from ..theory import parse_key, resolve_roman_chord
from .utils import (
    _coerce_chords_per_bar,
    _coerce_number,
    _normalize_note_name,
    _parse_roman_sequence,
    _pitch_classes_to_midi,
    _resolve_progression_length,
    _steps_per_bar_for_grid,
)


def _build_chord_pitches(params: dict) -> List[int]:
    notes_spec = (params.get("chordNotes") or "").strip()
    if notes_spec:
        try:
            return parse_notes_spec(notes_spec)
        except Exception:
            return []
    root = _normalize_note_name(params.get("chordRoot") or "C")
    if not root:
        root = "C4"
    try:
        root_midi = note_name_to_midi(root)
    except Exception:
        root_midi = 60
    quality = (params.get("chordQuality") or "major").lower()
    intervals = {
        "major": [0, 4, 7],
        "minor": [0, 3, 7],
        "diminished": [0, 3, 6],
        "augmented": [0, 4, 8],
    }.get(quality, [0, 4, 7])
    return [root_midi + interval for interval in intervals]


def _normalize_harmony_mode(params: dict) -> str:
    return (params.get("harmonyMode") or "single").strip().lower()


def _apply_register(pitches: List[int], *, register_min: int, register_max: int) -> List[int]:
    if not pitches:
        return []
    adjusted: List[int] = []
    for pitch in pitches:
        value = pitch
        while value < register_min:
            value += 12
        while value > register_max:
            value -= 12
        adjusted.append(max(0, min(127, value)))
    return adjusted


def _resolve_progression_harmony(params: dict, duration_bars: int, grid: str) -> HarmonyPlan:
    chords_per_bar = _coerce_chords_per_bar(params.get("chordsPerBar"))
    fill_behavior = params.get("fillBehavior") or "repeat"
    harmony_mode = _normalize_harmony_mode(params)
    romans: List[str] = []
    preset_length: int | None = None
    variant_style = "triads"

    if harmony_mode == "progression_preset":
        preset_id = params.get("progressionPresetId")
        preset = get_progression_preset(preset_id)
        if preset:
            romans = preset.romans
            preset_length = preset.default_length
            variant_style = params.get("progressionVariantId") or "triads"
        elif params.get("progressionCustom"):
            romans = _parse_roman_sequence(params.get("progressionCustom"))
            variant_style = params.get("progressionCustomVariantStyle") or params.get(
                "progressionVariantId"
            ) or "triads"
    elif harmony_mode == "progression_custom":
        romans = _parse_roman_sequence(params.get("progressionCustom"))
        variant_style = params.get("progressionCustomVariantStyle") or "triads"

    if not romans:
        chord = _build_chord_pitches(params)
        return HarmonyPlan.from_chords([chord] * duration_bars, steps_per_bar=_steps_per_bar_for_grid(grid))

    progression_length = _resolve_progression_length(
        params,
        preset_length=preset_length,
        romans=romans,
    )
    slots_per_progression = max(1, int((progression_length * chords_per_bar) + 0.999))
    total_slots = max(1, int((duration_bars * chords_per_bar) + 0.999))

    slot_romans: List[str] = []
    for slot in range(slots_per_progression):
        slot_romans.append(romans[slot % len(romans)])

    try:
        key = parse_key(params.get("key") or "C major")
    except Exception:
        key = parse_key("C major")

    register_min = _coerce_number(params.get("registerMin"), 48)
    register_max = _coerce_number(params.get("registerMax"), 84)

    slot_chords: List[List[int]] = []
    for slot_index in range(total_slots):
        roman = None
        if slot_index < slots_per_progression:
            roman = slot_romans[slot_index]
        elif fill_behavior == "repeat":
            roman = slot_romans[slot_index % slots_per_progression]
        elif fill_behavior == "hold_last":
            roman = slot_romans[-1]
        elif fill_behavior == "rest":
            roman = None
        if not roman:
            slot_chords.append([])
            continue
        pcs = resolve_roman_chord(key, roman, variant_style)
        chord = _pitch_classes_to_midi(pcs, register_min, register_max)
        slot_chords.append(_apply_register(chord, register_min=register_min, register_max=register_max))

    steps_per_bar = _steps_per_bar_for_grid(grid)
    if chords_per_bar == 2.0:
        steps: List[HarmonyStep] = []
        half_step = max(1, steps_per_bar // 2)
        for bar_index in range(duration_bars):
            first = slot_chords[bar_index * 2] if (bar_index * 2) < len(slot_chords) else []
            second = slot_chords[bar_index * 2 + 1] if (bar_index * 2 + 1) < len(slot_chords) else []
            steps.append(HarmonyStep(bar_index=bar_index, step=0, chord=first, pedal=False))
            steps.append(HarmonyStep(bar_index=bar_index, step=half_step, chord=second, pedal=False))
        return HarmonyPlan(steps_per_bar=steps_per_bar, steps=steps)

    chords_by_bar: List[List[int]] = []
    for bar_index in range(duration_bars):
        if chords_per_bar == 0.5:
            slot_index = bar_index // 2
        else:
            slot_index = bar_index
        chord = slot_chords[slot_index] if slot_index < len(slot_chords) else []
        chords_by_bar.append(chord)
    return HarmonyPlan.from_chords(chords_by_bar, steps_per_bar=steps_per_bar)
