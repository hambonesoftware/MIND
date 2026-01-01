from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class HarmonySegment:
    start_bar: int
    end_bar: int
    symbol: str


class HarmonyPlan:
    def __init__(self, segments: List[HarmonySegment]) -> None:
        self.segments = segments

    @classmethod
    def parse(cls, plan: str | None) -> "HarmonyPlan":
        if not plan:
            return cls([HarmonySegment(start_bar=1, end_bar=16, symbol="i")])
        segments: List[HarmonySegment] = []
        for part in plan.split(";"):
            if not part.strip():
                continue
            bars, symbol = part.split(":")
            start, end = [int(x.strip()) for x in bars.split("-")]
            segments.append(
                HarmonySegment(start_bar=start, end_bar=end, symbol=symbol.strip())
            )
        return cls(segments)

    def _segment_for_bar(self, bar: int) -> Optional[HarmonySegment]:
        for seg in self.segments:
            if seg.start_bar <= bar <= seg.end_bar:
                return seg
        return None

    def get_symbol(self, bar: int) -> str:
        seg = self._segment_for_bar(bar)
        if seg is None:
            return "i"
        return seg.symbol

    def get_segment_start(self, bar: int) -> int:
        seg = self._segment_for_bar(bar)
        if seg is None:
            return bar
        return seg.start_bar

    def get_segment_length(self, bar: int) -> int:
        seg = self._segment_for_bar(bar)
        if seg is None:
            return 1
        return seg.end_bar - seg.start_bar + 1
