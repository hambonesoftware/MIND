from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.reporting.moonlight_report import (  # noqa: E402
    _diff_sounding_state,
)
from mind_api.mind_core.reporting.mxl_parser import NormalizedNoteEvent  # noqa: E402


def test_sounding_state_equates_retriggers_and_sustain():
    solver_events = [
        NormalizedNoteEvent(
            bar_index=0,
            grid_onset=0,
            duration=3,
            pitch=60,
            voice="solver",
            staff=1,
            part_id="solver",
        )
    ]
    mxl_events = [
        NormalizedNoteEvent(
            bar_index=0,
            grid_onset=0,
            duration=1,
            pitch=60,
            voice="mxl",
            staff=1,
            part_id="mxl",
        ),
        NormalizedNoteEvent(
            bar_index=0,
            grid_onset=1,
            duration=1,
            pitch=60,
            voice="mxl",
            staff=1,
            part_id="mxl",
        ),
        NormalizedNoteEvent(
            bar_index=0,
            grid_onset=2,
            duration=1,
            pitch=60,
            voice="mxl",
            staff=1,
            part_id="mxl",
        ),
    ]
    diffs = _diff_sounding_state(
        solver_events,
        mxl_events,
        steps_per_bar=4,
        bars=[0],
    )
    assert diffs == []


def test_sounding_state_detects_missing_sustain_steps():
    solver_events = [
        NormalizedNoteEvent(
            bar_index=0,
            grid_onset=0,
            duration=3,
            pitch=60,
            voice="solver",
            staff=1,
            part_id="solver",
        )
    ]
    mxl_events = [
        NormalizedNoteEvent(
            bar_index=0,
            grid_onset=0,
            duration=1,
            pitch=60,
            voice="mxl",
            staff=1,
            part_id="mxl",
        )
    ]
    diffs = _diff_sounding_state(
        solver_events,
        mxl_events,
        steps_per_bar=4,
        bars=[0],
    )
    diff_steps = {(diff.bar_index, diff.step) for diff in diffs}
    assert diff_steps == {(0, 1), (0, 2)}
