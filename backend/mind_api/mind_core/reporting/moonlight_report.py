"""Moonlight solver vs. MXL diff report."""

from __future__ import annotations

import argparse
import json
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from mind_api.models import EquationAST
from mind_api.mind_core.equation_parser import parse_equation_text
from mind_api.mind_core.solver import solve_equation_bar

from .mxl_parser import NormalizedNoteEvent, parse_mxl_note_events
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


def _parse_key_value_block(path: Path) -> dict[str, str]:
    payload: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if value.startswith("\"") and value.endswith("\""):
            value = value[1:-1]
        payload[key] = value
    return payload


def _load_equation_from_example(path: Path) -> EquationAST:
    settings = _parse_key_value_block(path)
    lane = settings.get("lane", "note")
    grid = settings.get("grid", DEFAULT_GRID)
    bars = settings.get("bars", "1-16")
    key = settings.get("key", "C major")
    harmony = settings.get("harmony", "1-16:I")
    motions = settings.get("motions", "sustain(chord)")
    preset = settings.get("preset")

    equation_text = (
        "equation("
        f"lane=\"{lane}\", "
        f"grid=\"{grid}\", "
        f"bars=\"{bars}\", "
        f"key=\"{key}\", "
        f"harmony=\"{harmony}\", "
        f"motions=\"{motions}\""
        + (f", preset=\"{preset}\"" if preset else "")
        + ")"
    )
    ast, diagnostics = parse_equation_text(equation_text)
    if diagnostics or ast is None:
        messages = "; ".join(diag.message for diag in diagnostics)
        raise ValueError(f"Failed to parse equation from {path}: {messages}")
    return ast


def _bars_from_range(bars: str) -> range:
    start_raw, end_raw = bars.split("-", 1)
    start = int(start_raw.strip())
    end = int(end_raw.strip())
    return range(start - 1, end)


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
    return json.dumps(payload, indent=2)


def main() -> None:
    parser = argparse.ArgumentParser(description="Compare Moonlight solver output to MXL.")
    parser.add_argument(
        "--equation",
        type=Path,
        default=Path("docs/examples/moonlight_v7_1.txt"),
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
    args = parser.parse_args()

    ast = _load_equation_from_example(args.equation)
    bars = _bars_from_range(ast.bars)
    solver_events = _collect_solver_events(ast, bars)

    mxl_events = parse_mxl_note_events(
        args.mxl, part_ids=args.part_id, staff=args.staff, bar_start=1, bar_end=16
    )

    onset_diffs, timing_mismatches = _diff_onsets(solver_events, mxl_events)

    if args.json:
        print(_as_json(onset_diffs, timing_mismatches))
    else:
        print(_render_text_report(onset_diffs, timing_mismatches))


if __name__ == "__main__":
    main()
