import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.solver import solve_equation_bar  # noqa: E402
from mind_api.models import EquationAST  # noqa: E402


def test_moonlight_bar1_pitches():
    ast = EquationAST(
        lane="note",
        grid="1/12",
        bars="1-16",
        preset=None,
        key="C# minor",
        harmony="1-2:C#m/G#;3-4:V;5-14:VI;15-16:i",
        motions=(
            "arpeggiate(pattern=low-mid-high,mode=tones,"
            "voicing=moonlight,order=5-1-3,start=0)"
        ),
    )
    events = solve_equation_bar(ast, bar_index=0, bpm=120.0)
    pitches = [event.pitches[0] for event in sorted(events, key=lambda e: e.tBeat)[:12]]
    assert pitches == [56, 61, 64, 56, 61, 64, 56, 61, 64, 56, 61, 64]


def test_solver_smoke_regression_equation():
    ast = EquationAST(
        lane="note",
        grid="1/12",
        bars="1-16",
        preset=None,
        key="C minor",
        harmony="1-4:i",
        motions="sustain(chord); arpeggiate(grid=1/12, pattern=low-mid-high-mid)",
    )
    events_a = solve_equation_bar(ast, bar_index=0, bpm=120.0)
    events_b = solve_equation_bar(ast, bar_index=0, bpm=120.0)

    assert events_a
    assert [event.tBeat for event in events_a] == [event.tBeat for event in events_b]
