from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.lattice import Lattice  # noqa: E402
from mind_api.mind_core.motions.sustain import apply_sustain  # noqa: E402


def test_hold_until_change_sustains_until_next_change():
    lattice = Lattice(steps_per_bar=12)
    chord_by_step = [[60, 64, 67]] * 6 + [[62, 65, 69]] * 6

    apply_sustain(
        lattice,
        chord=[60, 64, 67],
        bar_index=0,
        segment_start=1,
        segment_length=1,
        policy="hold_until_change",
        chord_by_step=chord_by_step,
        steps_per_bar=12,
    )

    events = lattice.to_events(lane="note", preset=None)
    assert len(events) == 2
    assert events[0].tBeat == 0
    assert events[0].durationBeats > 1
    assert events[0].durationBeats == 2
    assert events[1].tBeat == 2
    assert events[1].durationBeats == 2


def test_pedal_hold_allows_accumulation_until_lift():
    lattice = Lattice(steps_per_bar=12)
    chord_by_step = [[60, 64, 67]] * 6 + [[62, 65, 69]] * 6

    apply_sustain(
        lattice,
        chord=[60, 64, 67],
        bar_index=0,
        segment_start=1,
        segment_length=1,
        policy="pedal_hold",
        chord_by_step=chord_by_step,
        steps_per_bar=12,
        pedal_lift_steps=[12],
    )

    events = lattice.to_events(lane="note", preset=None)
    assert len(events) == 2
    assert events[0].tBeat == 0
    assert events[0].durationBeats == 4
    assert events[1].tBeat == 2
    assert events[1].durationBeats == 2
