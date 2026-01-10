"""Shared helpers for stream runtime."""

from __future__ import annotations

from typing import List

from ..determinism import stable_seed
from .constants import DEFAULT_PATTERN_FAMILY


def _coerce_number(value: object, fallback: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _compare(op: str, left: int, right: int) -> bool:
    return {
        "==": left == right,
        "!=": left != right,
        ">": left > right,
        ">=": left >= right,
        "<": left < right,
        "<=": left <= right,
    }.get(op, False)


def _seeded_random(seed: int, salt: int) -> float:
    value = (seed * 9301 + 49297 + salt * 233) % 233280
    return value / 233280.0


def _is_hit_char(ch: str) -> bool:
    return ch.isdigit()


def _intensity_to_velocity(char: str) -> int:
    try:
        value = int(char)
    except ValueError:
        return 0
    return max(1, min(127, 15 + value * 12))


def _count_sustain_steps(bar_pat: str, start_idx: int) -> int:
    n = 0
    j = start_idx + 1
    while j < len(bar_pat) and bar_pat[j] == "-":
        n += 1
        j += 1
    return n


def _normalize_pattern(raw_pat: str) -> str:
    return "".join(c for c in raw_pat if c not in {" ", "|"})


def _steps_per_bar_for_grid(grid: str) -> int:
    return {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,
        "1/16": 16,
        "1/24": 24,
    }.get(grid, 4)


def _normalize_note_name(value: str, default_octave: int = 4) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    if any(ch.isdigit() for ch in value):
        return value
    return f"{value}{default_octave}"


def _coerce_chords_per_bar(value: str | None) -> float:
    if value == "2":
        return 2.0
    if value == "0.5":
        return 0.5
    return 1.0


def _combined_seed(global_seed: int, style_seed: int, node_id: str) -> int:
    return stable_seed(f"{int(global_seed)}:{int(style_seed)}:{node_id}") % 2147483647


def _pattern_family_for_type(pattern_type: str, *, seed: int) -> tuple[str, ...]:
    base = {
        "arp-3-up": ("low-mid-high", "low-high-mid"),
        "arp-3-down": ("high-mid-low", "high-low-mid"),
        "arp-3-skip": ("low-high-mid", "low-mid-high"),
    }.get(pattern_type, DEFAULT_PATTERN_FAMILY)
    if not base:
        return DEFAULT_PATTERN_FAMILY
    if len(base) == 1:
        return base
    idx = stable_seed(f"pattern:{pattern_type}:{seed}") % len(base)
    return (base[idx],) + tuple(opt for i, opt in enumerate(base) if i != idx)


def _parse_roman_sequence(raw: str | None) -> List[str]:
    if not raw:
        return []
    tokens = [tok.strip() for tok in str(raw).replace(",", " ").split() if tok.strip()]
    return tokens


def _resolve_progression_length(
    params: dict,
    *,
    preset_length: int | None,
    romans: List[str],
) -> int:
    raw = params.get("progressionLength", "preset")
    if raw == "preset" or raw is None:
        return preset_length or max(1, len(romans) or 1)
    try:
        numeric = int(raw)
    except (TypeError, ValueError):
        return preset_length or max(1, len(romans) or 1)
    return max(1, numeric)


def _pitch_classes_to_midi(pitch_classes: List[int], register_min: int, register_max: int) -> List[int]:
    if not pitch_classes:
        return []
    if register_min > register_max:
        register_min, register_max = register_max, register_min
    base = register_min
    voiced: List[int] = []
    for pc in pitch_classes:
        midi = base + ((pc - base) % 12)
        while midi < register_min:
            midi += 12
        while midi > register_max:
            midi -= 12
        voiced.append(max(0, min(127, midi)))
    return voiced


def _apply_timing_adjustments(
    events: list,
    *,
    grid: str,
    syncopation: str,
    timing_warp: str,
    intensity: float,
) -> list:
    if not events:
        return events
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / steps_per_bar
    intensity = max(0.0, min(1.0, float(intensity or 0)))
    for event in events:
        step = int(round(event.tBeat / step_len)) if step_len > 0 else 0
        tbeat = step * step_len
        if syncopation == "offbeat":
            tbeat += step_len * 0.5
        elif syncopation == "anticipation":
            tbeat -= step_len * 0.33
        if timing_warp in {"swing", "shuffle"} and step % 2 == 1:
            warp = step_len * (0.5 if timing_warp == "swing" else 0.75)
            tbeat += warp * intensity
        event.tBeat = max(0.0, min(4.0, tbeat))
    return events


def _slice_events_to_bar(events: list, *, bar_offset: int) -> list:
    if not events:
        return []
    bar_start = bar_offset * 4.0
    bar_end = (bar_offset + 1) * 4.0
    sliced: list = []
    for event in events:
        if bar_start <= event.tBeat < bar_end:
            adjusted = event.model_validate(event.model_dump())
            adjusted.tBeat = event.tBeat - bar_start
            sliced.append(adjusted)
    return sliced


def _compute_pattern_bar_count(pat: str, steps_per_bar: int) -> int:
    if len(pat) <= steps_per_bar:
        return 1
    if len(pat) % steps_per_bar != 0:
        return 1
    return min(16, len(pat) // steps_per_bar)


def _slice_bar_segment(pat: str, steps_per_bar: int, bar_offset: int, bar_count: int) -> str:
    if bar_count <= 1:
        if len(pat) < steps_per_bar:
            times = (steps_per_bar + len(pat) - 1) // len(pat)
            return (pat * times)[:steps_per_bar]
        return pat[:steps_per_bar]

    idx = bar_offset % bar_count
    return pat[idx * steps_per_bar : (idx + 1) * steps_per_bar]
