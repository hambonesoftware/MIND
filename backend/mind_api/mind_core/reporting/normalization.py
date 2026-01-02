"""Helpers for normalizing MusicXML timing into solver grid steps.

Mapping rules:
    * MusicXML `duration` values are expressed in divisions per quarter note.
      We first convert them to beats (quarter note == 1 beat).
    * Solver timing uses a fixed grid, matching the equation grid used in
      docs/examples/moonlight_v7_1.txt ("1/12").
    * The grid is interpreted as steps per bar. With the default 4/4 time
      signature (4 beats per bar), grid "1/12" yields 12 steps per bar, or
      1/3 beat per step.

Quantization rules:
    * Onsets and durations are quantized to the nearest grid step.
    * A small tolerance in grid-step units is applied to clamp values that are
      already extremely close to a grid line, preventing floating drift.
"""

from __future__ import annotations

DEFAULT_GRID = "1/12"
DEFAULT_BEATS_PER_BAR = 4
DEFAULT_TOLERANCE_STEPS = 1e-3


def steps_per_bar_from_grid(grid: str) -> int:
    """Return the solver steps-per-bar for a given grid string."""
    return {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,
        "1/16": 16,
        "1/24": 24,
    }.get(grid, 4)


def grid_step_in_beats(
    *, steps_per_bar: int, beats_per_bar: int = DEFAULT_BEATS_PER_BAR
) -> float:
    """Compute the beat length of a single grid step."""
    if steps_per_bar <= 0:
        return 0.0
    return beats_per_bar / float(steps_per_bar)


def quantize_beats_to_grid_steps(
    value_beats: float,
    *,
    steps_per_bar: int,
    beats_per_bar: int = DEFAULT_BEATS_PER_BAR,
    tolerance_steps: float = DEFAULT_TOLERANCE_STEPS,
) -> float:
    """Convert beat values into quantized grid steps."""
    step_beats = grid_step_in_beats(
        steps_per_bar=steps_per_bar, beats_per_bar=beats_per_bar
    )
    if step_beats <= 0.0:
        return 0.0
    raw_steps = value_beats / step_beats
    if abs(raw_steps) <= tolerance_steps:
        return 0.0
    nearest = round(raw_steps)
    if abs(raw_steps - nearest) <= tolerance_steps:
        return float(nearest)
    return float(nearest)


def normalize_note_timing(
    onset_beats: float,
    duration_beats: float,
    *,
    grid: str = DEFAULT_GRID,
    beats_per_bar: int = DEFAULT_BEATS_PER_BAR,
    tolerance_steps: float = DEFAULT_TOLERANCE_STEPS,
) -> tuple[float, float]:
    """Normalize MusicXML beat timings into solver grid step positions."""
    steps_per_bar = steps_per_bar_from_grid(grid)
    onset_steps = quantize_beats_to_grid_steps(
        onset_beats,
        steps_per_bar=steps_per_bar,
        beats_per_bar=beats_per_bar,
        tolerance_steps=tolerance_steps,
    )
    duration_steps = quantize_beats_to_grid_steps(
        duration_beats,
        steps_per_bar=steps_per_bar,
        beats_per_bar=beats_per_bar,
        tolerance_steps=tolerance_steps,
    )
    return onset_steps, duration_steps
