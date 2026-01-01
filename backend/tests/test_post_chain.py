import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.post.chain import apply_render_chain  # noqa: E402
from mind_api.models import CompileRequest, Event, PercSpec, RenderSpec, StrumSpec  # noqa: E402


def test_render_chain_strum_then_perc():
    event = Event(
        tBeat=0.0,
        lane="note",
        note=60,
        pitches=[60, 64],
        velocity=100,
        durationBeats=1.0,
        preset=None,
    )
    render = RenderSpec(
        strum=StrumSpec(enabled=True, spreadMs=60, directionByStep="D"),
        perc=PercSpec(enabled=True, grid="1/8", hat="x......."),
    )
    req = CompileRequest(seed=1, bpm=120.0, barIndex=0, nodes=[])

    output = apply_render_chain([event], render, req)

    assert len(output) == 3
    assert sum(1 for ev in output if ev.lane == "note") == 2
    assert sum(1 for ev in output if ev.lane == "hat") == 1
