"""Moonlight solver vs. MXL diff report."""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from mind_api.models import EquationAST, Event
from mind_api.mind_core.solver import solve_equation_bar

from .mxl_parser import NormalizedNoteEvent, parse_mxl_note_events
from .moonlight_example import (
    bars_from_range,
    build_elements_events,
    build_equation_ast,
    load_settings,
)
from .normalization import (
    DEFAULT_GRID,
    DEFAULT_TOLERANCE_STEPS,
    quantize_beats_to_grid_steps,
    steps_per_bar_from_grid,
)


@dataclass(frozen=True)
class PitchTiming:
    onset: float
    duration: float


@dataclass(frozen=True)
class OnsetDiff:
    bar_index: int
    onset: float
    missing_pitches: tuple[int, ...]
    extra_pitches: tuple[int, ...]


@dataclass(frozen=True)
class TimingMismatch:
    bar_index: int
    pitch: int
    mxl_timings: tuple[PitchTiming, ...]
    solver_timings: tuple[PitchTiming, ...]


@dataclass(frozen=True)
class SoundingStateDiff:
    bar_index: int
    step: int
    missing_pitches: tuple[int, ...]
    extra_pitches: tuple[int, ...]


def _collect_solver_events(ast: EquationAST, bars: Iterable[int]) -> list[NormalizedNoteEvent]:
    events: list[NormalizedNoteEvent] = []
    steps_per_bar = steps_per_bar_from_grid(ast.grid)

    for bar_index in bars:
        bar_events = solve_equation_bar(ast, bar_index, bpm=120.0)
        for event in bar_events:
            onset = quantize_beats_to_grid_steps(
                event.tBeat,
                steps_per_bar=steps_per_bar,
                tolerance_steps=DEFAULT_TOLERANCE_STEPS,
            )
            duration = quantize_beats_to_grid_steps(
                event.durationBeats,
                steps_per_bar=steps_per_bar,
                tolerance_steps=DEFAULT_TOLERANCE_STEPS,
            )
            pitches = list(event.pitches)
            if not pitches and event.note is not None:
                pitches.append(event.note)
            for pitch in pitches:
                events.append(
                    NormalizedNoteEvent(
                        bar_index=bar_index,
                        grid_onset=onset,
                        duration=duration,
                        pitch=pitch,
                        voice="solver",
                        staff=1,
                        part_id="solver",
                    )
                )
    return events


def _collect_elements_events(
    events: Iterable[Event],
    *,
    grid: str,
    bars: Iterable[int],
) -> list[NormalizedNoteEvent]:
    normalized: list[NormalizedNoteEvent] = []
    steps_per_bar = steps_per_bar_from_grid(grid)
    bar_set = set(bars)
    for event in events:
        bar_index = int(event.tBeat // 4)
        if bar_index not in bar_set:
            continue
        bar_onset = event.tBeat - (bar_index * 4.0)
        onset = quantize_beats_to_grid_steps(
            bar_onset,
            steps_per_bar=steps_per_bar,
            tolerance_steps=DEFAULT_TOLERANCE_STEPS,
        )
        duration = quantize_beats_to_grid_steps(
            event.durationBeats,
            steps_per_bar=steps_per_bar,
            tolerance_steps=DEFAULT_TOLERANCE_STEPS,
        )
        pitches = list(event.pitches)
        if not pitches and event.note is not None:
            pitches.append(event.note)
        for pitch in pitches:
            normalized.append(
                NormalizedNoteEvent(
                    bar_index=bar_index,
                    grid_onset=onset,
                    duration=duration,
                    pitch=pitch,
                    voice="elements",
                    staff=1,
                    part_id="elements",
                )
            )
    return normalized


def _group_by_bar_onset(
    events: Iterable[NormalizedNoteEvent],
) -> dict[int, dict[float, set[int]]]:
    grouped: dict[int, dict[float, set[int]]] = defaultdict(lambda: defaultdict(set))
    for event in events:
        grouped[event.bar_index][event.grid_onset].add(event.pitch)
    return grouped


def _group_pitch_timings(
    events: Iterable[NormalizedNoteEvent],
) -> dict[int, dict[int, set[PitchTiming]]]:
    grouped: dict[int, dict[int, set[PitchTiming]]] = defaultdict(lambda: defaultdict(set))
    for event in events:
        grouped[event.bar_index][event.pitch].add(
            PitchTiming(event.grid_onset, event.duration)
        )
    return grouped


def _diff_onsets(
    solver_events: Iterable[NormalizedNoteEvent],
    mxl_events: Iterable[NormalizedNoteEvent],
) -> tuple[list[OnsetDiff], list[TimingMismatch]]:
    solver_by_onset = _group_by_bar_onset(solver_events)
    mxl_by_onset = _group_by_bar_onset(mxl_events)
    onset_diffs: list[OnsetDiff] = []

    bar_indices = sorted(set(solver_by_onset) | set(mxl_by_onset))
    for bar_index in bar_indices:
        solver_onsets = solver_by_onset.get(bar_index, {})
        mxl_onsets = mxl_by_onset.get(bar_index, {})
        all_onsets = sorted(set(solver_onsets) | set(mxl_onsets))
        for onset in all_onsets:
            solver_pitches = solver_onsets.get(onset, set())
            mxl_pitches = mxl_onsets.get(onset, set())
            missing = tuple(sorted(mxl_pitches - solver_pitches))
            extra = tuple(sorted(solver_pitches - mxl_pitches))
            if missing or extra:
                onset_diffs.append(
                    OnsetDiff(
                        bar_index=bar_index,
                        onset=onset,
                        missing_pitches=missing,
                        extra_pitches=extra,
                    )
                )

    solver_timings = _group_pitch_timings(solver_events)
    mxl_timings = _group_pitch_timings(mxl_events)
    timing_mismatches: list[TimingMismatch] = []
    for bar_index in sorted(set(solver_timings) | set(mxl_timings)):
        solver_pitch_map = solver_timings.get(bar_index, {})
        mxl_pitch_map = mxl_timings.get(bar_index, {})
        for pitch in sorted(set(solver_pitch_map) | set(mxl_pitch_map)):
            solver_set = solver_pitch_map.get(pitch, set())
            mxl_set = mxl_pitch_map.get(pitch, set())
            if solver_set and mxl_set and solver_set != mxl_set:
                timing_mismatches.append(
                    TimingMismatch(
                        bar_index=bar_index,
                        pitch=pitch,
                        mxl_timings=tuple(sorted(mxl_set, key=lambda t: (t.onset, t.duration))),
                        solver_timings=tuple(
                            sorted(solver_set, key=lambda t: (t.onset, t.duration))
                        ),
                    )
                )

    return onset_diffs, timing_mismatches


def _build_sounding_state(
    events: Iterable[NormalizedNoteEvent],
    *,
    steps_per_bar: int,
    bars: Iterable[int],
) -> dict[int, dict[int, set[int]]]:
    state: dict[int, dict[int, set[int]]] = defaultdict(lambda: defaultdict(set))
    bar_set = set(bars)
    for event in events:
        if event.bar_index not in bar_set:
            continue
        onset_step = int(round(event.grid_onset))
        duration_steps = max(1, int(round(event.duration)))
        end_step = min(steps_per_bar, onset_step + duration_steps)
        for step in range(onset_step, end_step):
            state[event.bar_index][step].add(event.pitch)
    return state


def _diff_sounding_state(
    solver_events: Iterable[NormalizedNoteEvent],
    mxl_events: Iterable[NormalizedNoteEvent],
    *,
    steps_per_bar: int,
    bars: Iterable[int],
) -> list[SoundingStateDiff]:
    solver_state = _build_sounding_state(
        solver_events, steps_per_bar=steps_per_bar, bars=bars
    )
    mxl_state = _build_sounding_state(
        mxl_events, steps_per_bar=steps_per_bar, bars=bars
    )
    diffs: list[SoundingStateDiff] = []
    for bar_index in sorted(set(solver_state) | set(mxl_state) | set(bars)):
        for step in range(steps_per_bar):
            solver_pitches = solver_state.get(bar_index, {}).get(step, set())
            mxl_pitches = mxl_state.get(bar_index, {}).get(step, set())
            missing = tuple(sorted(mxl_pitches - solver_pitches))
            extra = tuple(sorted(solver_pitches - mxl_pitches))
            if missing or extra:
                diffs.append(
                    SoundingStateDiff(
                        bar_index=bar_index,
                        step=step,
                        missing_pitches=missing,
                        extra_pitches=extra,
                    )
                )
    return diffs


def compare_solver_events_to_mxl(
    ast: EquationAST,
    mxl_path: Path,
    *,
    part_ids: Iterable[str] = ("P1",),
    staff: int = 1,
    bar_start: int | None = None,
    bar_end: int | None = None,
) -> tuple[list[OnsetDiff], list[TimingMismatch]]:
    bars = bars_from_range(ast.bars)
    solver_events = _collect_solver_events(ast, bars)
    mxl_events = parse_mxl_note_events(
        mxl_path,
        part_ids=part_ids,
        staff=staff,
        bar_start=bar_start,
        bar_end=bar_end,
    )
    return _diff_onsets(solver_events, mxl_events)


def compare_elements_events_to_mxl(
    events: Iterable[Event],
    *,
    grid: str,
    bars: Iterable[int],
    mxl_path: Path,
    part_ids: Iterable[str] = ("P1",),
    staff: int = 1,
    bar_start: int | None = None,
    bar_end: int | None = None,
) -> tuple[list[OnsetDiff], list[TimingMismatch]]:
    solver_events = _collect_elements_events(events, grid=grid, bars=bars)
    mxl_events = parse_mxl_note_events(
        mxl_path,
        part_ids=part_ids,
        staff=staff,
        bar_start=bar_start,
        bar_end=bar_end,
    )
    return _diff_onsets(solver_events, mxl_events)


def _render_text_report(
    onset_diffs: list[OnsetDiff],
    timing_mismatches: list[TimingMismatch],
) -> str:
    lines: list[str] = []
    if not onset_diffs and not timing_mismatches:
        return "No differences found."

    if onset_diffs:
        lines.append("Onset differences:")
        for diff in onset_diffs:
            lines.append(
                "  "
                f"bar {diff.bar_index + 1} step {diff.onset}: "
                f"missing={list(diff.missing_pitches)} "
                f"extra={list(diff.extra_pitches)}"
            )

    if timing_mismatches:
        if lines:
            lines.append("")
        lines.append("Timing mismatches:")
        for mismatch in timing_mismatches:
            mxl = [(t.onset, t.duration) for t in mismatch.mxl_timings]
            solver = [(t.onset, t.duration) for t in mismatch.solver_timings]
            lines.append(
                "  "
                f"bar {mismatch.bar_index + 1} pitch {mismatch.pitch}: "
                f"mxl={mxl} solver={solver}"
            )

    return "\n".join(lines)


def _as_json(
    onset_diffs: list[OnsetDiff],
    timing_mismatches: list[TimingMismatch],
    *,
    sounding_state_diffs: list[SoundingStateDiff] | None = None,
) -> str:
    payload = {
        "onset_differences": [
            {
                "bar": diff.bar_index + 1,
                "grid_onset": diff.onset,
                "missing_pitches": list(diff.missing_pitches),
                "extra_pitches": list(diff.extra_pitches),
            }
            for diff in onset_diffs
        ],
        "timing_mismatches": [
            {
                "bar": mismatch.bar_index + 1,
                "pitch": mismatch.pitch,
                "mxl": [
                    {"grid_onset": timing.onset, "duration": timing.duration}
                    for timing in mismatch.mxl_timings
                ],
                "solver": [
                    {"grid_onset": timing.onset, "duration": timing.duration}
                    for timing in mismatch.solver_timings
                ],
            }
            for mismatch in timing_mismatches
        ],
        "summary": {
            "onset_diff_count": len(onset_diffs),
            "timing_mismatch_count": len(timing_mismatches),
        },
    }
    if sounding_state_diffs is not None:
        payload["compare_modes"] = {
            "sounding_state": {
                "diff_count": len(sounding_state_diffs),
            }
        }
        payload["sounding_state_differences"] = [
            {
                "bar": diff.bar_index + 1,
                "grid_onset": diff.step,
                "missing_pitches": list(diff.missing_pitches),
                "extra_pitches": list(diff.extra_pitches),
            }
            for diff in sounding_state_diffs
        ]
    return json.dumps(payload, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare Moonlight solver output to MXL.")
    parser.add_argument(
        "--equation",
        type=Path,
        default=Path("docs/examples/moonlight_v7_3.txt"),
        help="Path to the Moonlight equation example text.",
    )
    parser.add_argument(
        "--mxl",
        type=Path,
        default=Path("sonate-no-14-moonlight-1st-movement.mxl"),
        help="Path to the Moonlight MXL file.",
    )
    parser.add_argument(
        "--part-id",
        action="append",
        default=["P1"],
        help="Part ID(s) to include from the MXL score.",
    )
    parser.add_argument(
        "--staff",
        type=int,
        default=1,
        help="Staff number to include (1 = right hand).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Emit the report as JSON.",
    )
    parser.add_argument(
        "--compare-mode",
        choices=("note_on", "sounding_state"),
        default="note_on",
        help="Comparison mode for reporting (default: note_on).",
    )
    args = parser.parse_args()

    settings = load_settings(args.equation)
    mode = settings.get("mode", "equation").strip().lower()
    if mode == "elements":
        elements_events, grid, bars = build_elements_events(settings)
        solver_events = _collect_elements_events(
            elements_events, grid=grid, bars=bars
        )
    else:
        ast = build_equation_ast(settings)
        bars = bars_from_range(ast.bars)
        solver_events = _collect_solver_events(ast, bars)

    mxl_events = parse_mxl_note_events(
        args.mxl, part_ids=args.part_id, staff=args.staff, bar_start=1, bar_end=16
    )

    onset_diffs, timing_mismatches = _diff_onsets(solver_events, mxl_events)
    sounding_state_diffs: list[SoundingStateDiff] | None = None
    if args.compare_mode == "sounding_state":
        if mode == "elements":
            grid = settings.get("grid", DEFAULT_GRID)
        else:
            grid = ast.grid
        steps_per_bar = steps_per_bar_from_grid(grid)
        sounding_state_diffs = _diff_sounding_state(
            solver_events,
            mxl_events,
            steps_per_bar=steps_per_bar,
            bars=bars,
        )

    if args.json:
        print(
            _as_json(
                onset_diffs,
                timing_mismatches,
                sounding_state_diffs=sounding_state_diffs,
            )
        )
    else:
        report = _render_text_report(onset_diffs, timing_mismatches)
        if sounding_state_diffs is not None:
            report = (
                report
                + "\n\nSounding-state differences: "
                + str(len(sounding_state_diffs))
            )
        print(report)


if __name__ == "__main__":
    main()
