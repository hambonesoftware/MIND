from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, List


@dataclass(frozen=True)
class HarmonyStep:
    bar_index: int
    step: int
    chord: List[int]
    pedal: bool = False


class HarmonyPlan:
    def __init__(self, *, steps_per_bar: int, steps: Iterable[HarmonyStep]) -> None:
        self.steps_per_bar = steps_per_bar
        self.steps = sorted(list(steps), key=lambda s: (s.bar_index, s.step))

    @classmethod
    def from_chords(
        cls,
        chords_by_bar: List[List[int]],
        *,
        steps_per_bar: int,
        change_steps: List[List[int]] | None = None,
    ) -> "HarmonyPlan":
        steps: List[HarmonyStep] = []
        for bar_index, chord in enumerate(chords_by_bar):
            bar_changes = change_steps[bar_index] if change_steps else [0]
            for step in sorted(set(bar_changes)):
                steps.append(
                    HarmonyStep(
                        bar_index=bar_index,
                        step=step,
                        chord=list(chord),
                        pedal=False,
                    )
                )
        return cls(steps_per_bar=steps_per_bar, steps=steps)

    def chord_at_step(self, bar_index: int, step: int) -> List[int]:
        last: List[int] | None = None
        for entry in self.steps:
            if entry.bar_index != bar_index:
                continue
            if entry.step <= step:
                last = entry.chord
            else:
                break
        return list(last or [])

    def change_steps_for_bar(self, bar_index: int) -> List[int]:
        return [
            entry.step for entry in self.steps if entry.bar_index == bar_index
        ] or [0]
