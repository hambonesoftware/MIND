import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.motions.motion_call import parse_motion_call  # noqa: E402


def test_parse_motion_call_arpeggiate_kwargs():
    name, kwargs = parse_motion_call(
        "arpeggiate(pattern=low-mid-high,mode=tones,voicing=mid,order=5-1-3,start=0)"
    )
    assert name == "arpeggiate"
    assert kwargs == {
        "pattern": "low-mid-high",
        "mode": "tones",
        "voicing": "mid",
        "order": "5-1-3",
        "start": "0",
    }


def test_parse_motion_call_sustain_without_kwargs():
    name, kwargs = parse_motion_call("sustain(chord)")
    assert name == "sustain"
    assert kwargs == {}


def test_parse_motion_call_ignores_unknown_kwargs():
    name, kwargs = parse_motion_call("arpeggiate(pattern=low-mid-high,extra=foo)")
    assert name == "arpeggiate"
    assert kwargs["pattern"] == "low-mid-high"
    assert kwargs["extra"] == "foo"
