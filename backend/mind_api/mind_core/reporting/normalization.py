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
ADAPTIVE_GRIDS = ("1/12", "1/16", "1/24")


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


def select_grid_for_events(
    event_beats: list[float],
    *,
    beats_per_bar: int = DEFAULT_BEATS_PER_BAR,
    candidate_grids: tuple[str, ...] = ADAPTIVE_GRIDS,
) -> str:
    """Pick a grid that best fits the provided beat values."""
    if not event_beats:
        return DEFAULT_GRID

    best_grid = candidate_grids[0] if candidate_grids else DEFAULT_GRID
    best_error = float("inf")
    best_steps = steps_per_bar_from_grid(best_grid)

    for grid in candidate_grids:
        steps_per_bar = steps_per_bar_from_grid(grid)
        step_beats = grid_step_in_beats(
            steps_per_bar=steps_per_bar, beats_per_bar=beats_per_bar
        )
        if step_beats <= 0:
            continue
        error = 0.0
        for value in event_beats:
            raw_steps = value / step_beats
            error += abs(raw_steps - round(raw_steps))
        if error < best_error - 1e-9:
            best_error = error
            best_grid = grid
            best_steps = steps_per_bar
        elif abs(error - best_error) <= 1e-9 and steps_per_bar > best_steps:
            best_grid = grid
            best_steps = steps_per_bar

    return best_grid


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
