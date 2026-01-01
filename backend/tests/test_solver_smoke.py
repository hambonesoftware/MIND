import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.solver import solve_equation_bar  # noqa: E402
from mind_api.models import EquationAST  # noqa: E402


def test_solver_smoke_deterministic():
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
    assert [e.tBeat for e in events_a] == [e.tBeat for e in events_b]
