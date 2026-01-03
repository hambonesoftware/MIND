from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

from mind_api.mind_core.reporting.moonlight_report import (
    compare_elements_events_to_mxl,
    compare_solver_events_to_mxl,
)
from mind_api.mind_core.reporting.moonlight_example import (
    bars_from_range,
    build_elements_events,
    build_equation_ast,
    load_settings,
)
from mind_api.mind_core.reporting.normalization import (
    DEFAULT_TOLERANCE_STEPS,
    quantize_beats_to_grid_steps,
    steps_per_bar_from_grid,
)
from mind_api.mind_core.solver import solve_equation_bar


def _iter_event_rows_from_equation(settings: dict[str, str]) -> list[dict[str, float | int]]:
    ast = build_equation_ast(settings)
    rows: list[dict[str, float | int]] = []
    steps_per_bar = steps_per_bar_from_grid(ast.grid)
    for bar in bars_from_range(ast.bars):
        events = solve_equation_bar(ast, bar, bpm=120.0)
        for event in events:
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
                rows.append(
                    {
                        "bar": bar + 1,
                        "grid_onset": onset,
                        "pitch": pitch,
                        "duration": duration,
                    }
                )
    return rows


def _emit_summary(rows: list[dict[str, float | int]], fmt: str) -> None:
    if fmt == "csv":
        writer = csv.DictWriter(sys.stdout, fieldnames=["bar", "grid_onset", "pitch", "duration"])
        writer.writeheader()
        writer.writerows(rows)
        return

    payload = {}
    for row in rows:
        payload.setdefault(row["bar"], []).append(
            {
                "grid_onset": row["grid_onset"],
                "pitch": row["pitch"],
                "duration": row["duration"],
            }
        )
    print(json.dumps(payload, indent=2))


def main() -> None:
    parser = argparse.ArgumentParser(description="Verify Moonlight solver output.")
    parser.add_argument(
        "--equation",
        type=Path,
        default=Path("docs/examples/moonlight_v7_3.txt"),
        help="Path to the Moonlight equation example text.",
    )
    parser.add_argument(
        "--summary-format",
        choices=("json", "csv"),
        default="json",
        help="Emit per-bar event summaries in JSON or CSV.",
    )
    parser.add_argument(
        "--compare",
        action="store_true",
        help="Compare solver events against the Moonlight MXL file.",
    )
    parser.add_argument(
        "--mxl",
        type=Path,
        default=Path("sonate-no-14-moonlight-1st-movement.mxl"),
        help="Path to the Moonlight MXL file.",
    )
    args = parser.parse_args()

    settings = load_settings(args.equation)
    mode = settings.get("mode", "equation").strip().lower()
    if mode == "elements":
        events, grid, bars = build_elements_events(settings)
        steps_per_bar = steps_per_bar_from_grid(grid)
        rows: list[dict[str, float | int]] = []
        for event in events:
            bar_index = int(event.tBeat // 4)
            if bar_index not in set(bars):
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
                rows.append(
                    {
                        "bar": bar_index + 1,
                        "grid_onset": onset,
                        "pitch": pitch,
                        "duration": duration,
                    }
                )
    else:
        rows = _iter_event_rows_from_equation(settings)

    bar1_rows = [row for row in rows if row["bar"] == 1]
    bar1_sorted = sorted(bar1_rows, key=lambda row: row["grid_onset"])
    bar1_pitches = [row["pitch"] for row in bar1_sorted[:12]]
    expected = [56, 61, 64, 56, 61, 64, 56, 61, 64, 56, 61, 64]
    mismatch_count = sum(
        1 for actual, expected_pitch in zip(bar1_pitches, expected) if actual != expected_pitch
    ) + max(0, len(expected) - len(bar1_pitches))
    print(
        f"bar 1 first12={bar1_pitches} mismatch_count={mismatch_count}",
        file=sys.stderr,
    )
    if mode != "elements":
        assert (
            bar1_pitches == expected
        ), f"bar 1 mismatch: {bar1_pitches} (mismatch_count={mismatch_count})"

    _emit_summary(rows, args.summary_format)

    if args.compare:
        if mode == "elements":
            onset_diffs, timing_mismatches = compare_elements_events_to_mxl(
                events,
                grid=grid,
                bars=bars,
                mxl_path=args.mxl,
                part_ids=("P1",),
                staff=1,
                bar_start=1,
                bar_end=16,
            )
        else:
            ast = build_equation_ast(settings)
            onset_diffs, timing_mismatches = compare_solver_events_to_mxl(
                ast,
                args.mxl,
                part_ids=("P1",),
                staff=1,
                bar_start=1,
                bar_end=16,
            )
        print(
            "comparison_summary="
            f"{{\"onset_diffs\": {len(onset_diffs)}, "
            f"\"timing_mismatches\": {len(timing_mismatches)}}}",
            file=sys.stderr,
        )


if __name__ == "__main__":
    main()
