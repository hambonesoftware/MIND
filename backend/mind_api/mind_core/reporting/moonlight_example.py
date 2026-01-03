from __future__ import annotations

from pathlib import Path
from typing import Iterable, List

from mind_api.models import EquationAST, Event
from mind_api.mind_core.equation_parser import parse_equation_text
from mind_api.mind_core.lattice import steps_per_bar_from_grid
from mind_api.mind_core.music_elements import HarmonyPlan as ElementsHarmonyPlan
from mind_api.mind_core.music_elements import PhrasePlan, TextureRecipe, generate_events
from mind_api.mind_core.theory import (
    HarmonyPlan,
    parse_chord_symbol,
    parse_key,
    resolve_roman,
    voice_chord,
)


def load_settings(path: Path) -> dict[str, str]:
    payload: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if value.startswith("\"") and value.endswith("\""):
            value = value[1:-1]
        payload[key] = value
    return payload


def bars_from_range(bars: str) -> range:
    start_raw, end_raw = bars.split("-", 1)
    start = int(start_raw.strip())
    end = int(end_raw.strip())
    return range(start - 1, end)


def build_equation_ast(settings: dict[str, str]) -> EquationAST:
    lane = settings.get("lane", "note")
    grid = settings.get("grid", "1/12")
    bars = settings.get("bars", "1-16")
    key = settings.get("key", "C major")
    harmony = settings.get("harmony", "1-16:I")
    motions = settings.get("motions", "sustain(chord)")
    preset = settings.get("preset")

    equation_text = (
        "equation("
        f"lane=\"{lane}\", "
        f"grid=\"{grid}\", "
        f"bars=\"{bars}\", "
        f"key=\"{key}\", "
        f"harmony=\"{harmony}\", "
        f"motions=\"{motions}\""
        + (f", preset=\"{preset}\"" if preset else "")
        + ")"
    )
    ast, diagnostics = parse_equation_text(equation_text)
    if diagnostics or ast is None:
        messages = "; ".join(diag.message for diag in diagnostics)
        raise ValueError(f"Failed to parse equation: {messages}")
    return ast


def build_elements_events(
    settings: dict[str, str],
) -> tuple[list[Event], str, range]:
    grid = settings.get("grid", "1/12")
    bars = settings.get("bars", "1-16")
    key = settings.get("key", "C major")
    harmony = settings.get("harmony", "1-16:I")
    seed = int(settings.get("seed", "0"))
    piece_id = settings.get("piece_id", "moonlight_v7_3")
    density_curve = _parse_float_list(settings.get("density_curve"))
    pattern_family = _parse_pattern_family(settings.get("pattern_family"))
    sustain_policy = settings.get("sustain_policy", "hold_until_change")

    steps_per_bar = steps_per_bar_from_grid(grid)
    key_obj = parse_key(key)
    plan = HarmonyPlan.parse(harmony)

    chords_by_bar: List[List[int]] = []
    change_steps: List[List[int]] = []
    for bar_index in bars_from_range(bars):
        bar_number = bar_index + 1
        symbol = plan.get_symbol(bar_number)
        chord_pcs = _resolve_chord_symbol(key_obj, symbol)
        voiced = voice_chord(chord_pcs, register="mid")
        chords_by_bar.append(voiced)

        bar_changes: List[int] = []
        last_symbol: str | None = None
        for step in range(steps_per_bar):
            step_symbol = plan.get_symbol_at_step(bar_number, step, steps_per_bar)
            if last_symbol is None or step_symbol != last_symbol:
                bar_changes.append(step)
                last_symbol = step_symbol
        change_steps.append(bar_changes or [0])

    harmony_plan = ElementsHarmonyPlan.from_chords(
        chords_by_bar, steps_per_bar=steps_per_bar, change_steps=change_steps
    )
    phrase_plan = PhrasePlan(density_curve=density_curve or (0.85,))
    texture_recipe = TextureRecipe(
        pattern_family=pattern_family or ("low-mid-high", "high-mid-low"),
        sustain_policy=sustain_policy,
    )

    events = generate_events(
        harmony_plan,
        texture_recipe,
        phrase_plan,
        bars=len(chords_by_bar),
        grid=grid,
        seed=seed,
        piece_id=piece_id,
    )
    return events, grid, bars_from_range(bars)


def _parse_float_list(value: str | None) -> tuple[float, ...]:
    if not value:
        return tuple()
    items: list[float] = []
    for token in value.replace("|", ",").split(","):
        token = token.strip()
        if not token:
            continue
        try:
            items.append(float(token))
        except ValueError:
            continue
    return tuple(items)


def _parse_pattern_family(value: str | None) -> tuple[str, ...]:
    if not value:
        return tuple()
    tokens = []
    for token in value.replace(",", "|").split("|"):
        token = token.strip()
        if token:
            tokens.append(token)
    return tuple(tokens)


def _resolve_chord_symbol(key, symbol: str) -> List[int]:
    if symbol and symbol[0].upper() in {"A", "B", "C", "D", "E", "F", "G"}:
        return parse_chord_symbol(symbol)
    return resolve_roman(key, symbol)
