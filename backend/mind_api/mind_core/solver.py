from __future__ import annotations

from typing import List

from ..models import EquationAST, Event
from .lattice import Lattice, steps_per_bar_from_grid
from .motions.sustain import apply_sustain
from .motions.arpeggiate import apply_arpeggiate
from .motions.motion_call import parse_motion_call
from .theory import (
    HarmonyPlan,
    parse_chord_symbol,
    parse_key,
    resolve_roman,
    voice_chord,
    voice_chord_moonlight,
)


def _parse_motions(motions: str | None) -> List[str]:
    if not motions:
        return ["sustain(chord)"]
    return [chunk.strip() for chunk in motions.split(";") if chunk.strip()]


def _resolve_chord_symbol(key, symbol: str) -> List[int]:
    if symbol and symbol[0].upper() in {"A", "B", "C", "D", "E", "F", "G"}:
        return parse_chord_symbol(symbol)
    return resolve_roman(key, symbol)


def solve_equation_bar(ast: EquationAST, bar_index: int, bpm: float) -> List[Event]:
    steps_per_bar = steps_per_bar_from_grid(ast.grid)
    lattice = Lattice(steps_per_bar)

    key = parse_key(ast.key)
    plan = HarmonyPlan.parse(ast.harmony)
    bar_number = bar_index + 1

    symbol = plan.get_symbol(bar_number)
    chord_pcs = _resolve_chord_symbol(key, symbol)

    voiced_low = voice_chord(chord_pcs, register="low")
    voiced_mid = voice_chord(chord_pcs, register="mid")
    voiced_high = voice_chord(chord_pcs, register="high")

    motions = _parse_motions(ast.motions)
    for motion in motions:
        name, kwargs = parse_motion_call(motion)

        if name == "sustain":
            apply_sustain(
                lattice,
                chord=voiced_mid,
                bar_index=bar_index,
                segment_start=plan.get_segment_start(bar_number),
                segment_length=plan.get_segment_length(bar_number),
            )
            continue

        if name == "arpeggiate":
            pattern = kwargs.get("pattern", "low-mid-high-mid")
            order = kwargs.get("order")
            start_raw = kwargs.get("start", "0")
            try:
                start = int(start_raw)
            except ValueError:
                start = 0

            # We NO LONGER pass mode=... into apply_arpeggiate.
            # If "mode" == "tones", we build chord_by_step and pass it.
            mode = (kwargs.get("mode") or "registers").strip().lower()

            if mode == "tones":
                voicing = (kwargs.get("voicing") or "mid").strip().lower()
                if voicing != "moonlight" and voicing not in {"low", "mid", "high"}:
                    voicing = "mid"

                chord_cache: dict[tuple[str, str], List[int]] = {}
                chord_by_step: List[List[int]] = []

                for step in range(steps_per_bar):
                    step_symbol = plan.get_symbol_at_step(bar_number, step, steps_per_bar)
                    cache_key = (step_symbol, voicing)

                    if cache_key not in chord_cache:
                        pcs = _resolve_chord_symbol(key, step_symbol)
                        if voicing == "moonlight":
                            chord_cache[cache_key] = voice_chord_moonlight(pcs)
                        else:
                            chord_cache[cache_key] = voice_chord(pcs, register=voicing)

                    chord_by_step.append(chord_cache[cache_key])

                apply_arpeggiate(
                    lattice,
                    chord_by_register=[voiced_low, voiced_mid, voiced_high],
                    pattern=pattern,
                    order=order,
                    start=start,
                    chord_by_step=chord_by_step,
                )
                continue

            # default/registers mode
            apply_arpeggiate(
                lattice,
                chord_by_register=[voiced_low, voiced_mid, voiced_high],
                pattern=pattern,
                order=order,
                start=start,
                chord_by_step=None,
            )
            continue

    return lattice.to_events(lane=ast.lane, preset=ast.preset)
