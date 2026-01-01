import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.post.strum import apply_strum  # noqa: E402
from mind_api.models import Event, StrumSpec  # noqa: E402


def test_strum_splits_chord_with_offsets():
    event = Event(
        tBeat=0.0,
        lane="note",
        note=60,
        pitches=[60, 64, 67, 72],
        velocity=100,
        durationBeats=1.0,
        preset=None,
    )
    spec = StrumSpec(enabled=True, spreadMs=60, directionByStep="D")
    output = apply_strum([event], spec, bpm=120.0)

    assert len(output) == 4
    assert [ev.pitches[0] for ev in output] == [60, 64, 67, 72]
    assert output[0].tBeat == 0.0
    assert output[1].tBeat > output[0].tBeat
    assert output[2].tBeat > output[1].tBeat
    assert output[3].tBeat > output[2].tBeat
