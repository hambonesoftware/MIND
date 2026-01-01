from __future__ import annotations

from typing import List

from ..models import EquationAST, Event
from .lattice import Lattice, steps_per_bar_from_grid
from .motions import apply_arpeggiate, apply_sustain
from .theory import HarmonyPlan, parse_key, resolve_roman, voice_chord


def _parse_motions(motions: str | None) -> List[str]:
    if not motions:
        return ["sustain(chord)"]
    return [chunk.strip() for chunk in motions.split(";") if chunk.strip()]


def _pattern_from_motion(motion: str) -> str:
    if "pattern=" not in motion:
        return "low-mid-high-mid"
    parts = motion.split("pattern=")
    return parts[1].split(",")[0].strip().strip(")")


def solve_equation_bar(ast: EquationAST, bar_index: int, bpm: float) -> List[Event]:
    steps_per_bar = steps_per_bar_from_grid(ast.grid)
    lattice = Lattice(steps_per_bar)

    key = parse_key(ast.key)
    plan = HarmonyPlan.parse(ast.harmony)
    bar_number = bar_index + 1
    symbol = plan.get_symbol(bar_number)
    chord_pcs = resolve_roman(key, symbol)

    voiced_low = voice_chord(chord_pcs, register="low")
    voiced_mid = voice_chord(chord_pcs, register="mid")
    voiced_high = voice_chord(chord_pcs, register="high")

    motions = _parse_motions(ast.motions)
    for motion in motions:
        if motion.startswith("sustain"):
            apply_sustain(
                lattice,
                chord=voiced_mid,
                bar_index=bar_index,
                segment_start=plan.get_segment_start(bar_number),
                segment_length=plan.get_segment_length(bar_number),
            )
        elif motion.startswith("arpeggiate"):
            pattern = _pattern_from_motion(motion)
            apply_arpeggiate(
                lattice,
                chord_by_register=[voiced_low, voiced_mid, voiced_high],
                pattern=pattern,
            )

    return lattice.to_events(lane=ast.lane, preset=ast.preset)
