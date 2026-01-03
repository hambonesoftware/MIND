from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Tuple


def _normalize_curve(values: Iterable[float], bars: int) -> Tuple[float, ...]:
    items = [max(0.0, float(value)) for value in values]
    if not items:
        items = [1.0]
    if len(items) < bars:
        items = items + [items[-1]] * (bars - len(items))
    return tuple(items[:bars])


@dataclass(frozen=True)
class PhrasePlan:
    density_curve: Tuple[float, ...] = (1.0,)
    register_curve: Tuple[float, ...] = (0.0,)
    ornament_curve: Tuple[float, ...] = (0.0,)

    def density_for_bar(self, bar_index: int, *, bars: int) -> float:
        curve = _normalize_curve(self.density_curve, bars)
        return curve[bar_index]

    def register_for_bar(self, bar_index: int, *, bars: int) -> float:
        curve = _normalize_curve(self.register_curve, bars)
        return curve[bar_index]

    def ornament_for_bar(self, bar_index: int, *, bars: int) -> float:
        curve = _normalize_curve(self.ornament_curve, bars)
        return curve[bar_index]
