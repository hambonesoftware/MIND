import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.lattice import Lattice  # noqa: E402


def test_lattice_add_onset_to_events():
    lattice = Lattice(steps_per_bar=8)
    lattice.add_onset(step=2, pitches=[60, 64], velocity=90, dur_steps=4)
    events = lattice.to_events(lane="note", preset=None)

    assert len(events) == 1
    event = events[0]
    assert event.tBeat == 1.0
    assert event.durationBeats == 2.0
    assert event.pitches == [60, 64]
