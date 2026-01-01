import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.post.perc import apply_perc  # noqa: E402
from mind_api.models import Event, PercSpec  # noqa: E402


def test_perc_adds_events_on_grid_steps():
    spec = PercSpec(
        enabled=True,
        grid="1/8",
        hat="xxxxxxxx",
        kick="x...x...",
        snare="..x...x.",
    )
    base = Event(
        tBeat=0.0,
        lane="note",
        note=60,
        pitches=[60],
        velocity=100,
        durationBeats=1.0,
        preset=None,
    )
    output = apply_perc([base], spec)

    hat_events = [e for e in output if e.lane == "hat"]
    kick_events = [e for e in output if e.lane == "kick"]
    snare_events = [e for e in output if e.lane == "snare"]

    assert len(hat_events) == 8
    assert len(kick_events) == 2
    assert len(snare_events) == 2

    hat_beats = {e.tBeat for e in hat_events}
    assert hat_beats == {0.0, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5}
