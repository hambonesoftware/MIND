import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.solver import solve_equation_bar  # noqa: E402
from mind_api.models import EquationAST  # noqa: E402


def test_solver_stepwise_harmony_changes_in_tones_mode():
    ast = EquationAST(
        lane="note",
        grid="1/12",
        bars="1-1",
        preset=None,
        key="C minor",
        harmony="1.1-1.2:i;1.3-1.4:V",
        motions="arpeggiate(pattern=low-mid-high,mode=tones)",
    )
    events = solve_equation_bar(ast, bar_index=0, bpm=120.0)
    pitch_at_start = next(event.pitches[0] for event in events if event.tBeat == 0.0)
    pitch_at_beat_three = next(event.pitches[0] for event in events if event.tBeat == 2.0)
    assert pitch_at_start != pitch_at_beat_three
