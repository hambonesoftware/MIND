from __future__ import annotations

from mind_api.models import EquationAST
from mind_api.mind_core.solver import solve_equation_bar


def main() -> None:
    ast = EquationAST(
        lane="note",
        grid="1/12",
        bars="1-16",
        preset="gm:0:0",
        key="C# minor",
        harmony="1-2:i;3-4:V;5-14:VI;15-16:i",
        motions="sustain(chord); arpeggiate(grid=1/12, pattern=low-mid-high-mid)",
    )
    for bar in range(16):
        events = solve_equation_bar(ast, bar, bpm=120.0)
        print(
            f"bar {bar + 1}: events={len(events)} "
            f"first={events[:3]} max_dur={max((e.durationBeats for e in events), default=0)}"
        )


if __name__ == "__main__":
    main()
