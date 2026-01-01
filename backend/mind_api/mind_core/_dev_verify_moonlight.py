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
        harmony="1-2:C#m/G#;3-4:V;5-14:VI;15-16:i",
        motions=(
            "arpeggiate(pattern=low-mid-high,mode=tones,"
            "voicing=moonlight,order=5-1-3,start=0)"
        ),
    )
    for bar in range(16):
        events = solve_equation_bar(ast, bar, bpm=120.0)
        if bar == 0:
            bar_events = sorted(events, key=lambda event: event.tBeat)
            pitches = [event.pitches[0] for event in bar_events[:12]]
            print(f"bar 1 first12={pitches}")
            expected = [56, 61, 64, 56, 61, 64, 56, 61, 64, 56, 61, 64]
            assert pitches == expected, f"bar 1 mismatch: {pitches}"
        print(
            f"bar {bar + 1}: events={len(events)} "
            f"first={events[:3]} max_dur={max((e.durationBeats for e in events), default=0)}"
        )


if __name__ == "__main__":
    main()
