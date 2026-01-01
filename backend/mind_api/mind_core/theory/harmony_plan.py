from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class HarmonySegment:
    start_bar: int
    start_beat: int
    end_bar: int
    end_beat: int
    symbol: str


class HarmonyPlan:
    def __init__(self, segments: List[HarmonySegment]) -> None:
        self.segments = segments

    @classmethod
    def parse(cls, plan: str | None) -> "HarmonyPlan":
        if not plan:
            return cls(
                [
                    HarmonySegment(
                        start_bar=1,
                        start_beat=1,
                        end_bar=16,
                        end_beat=4,
                        symbol="i",
                    )
                ]
            )
        segments: List[HarmonySegment] = []
        for part in plan.split(";"):
            if not part.strip():
                continue
            bars, symbol = part.split(":")
            bars = bars.strip()
            if "-" in bars:
                start_token, end_token = [token.strip() for token in bars.split("-", 1)]
            else:
                start_token = end_token = bars

            start_bar, start_beat = _parse_bar_beat(start_token, default_beat=1)
            end_bar, end_beat = _parse_bar_beat(end_token, default_beat=4)

            if "." not in start_token and "." not in end_token:
                start_beat = 1
                end_beat = 4

            segments.append(
                HarmonySegment(
                    start_bar=start_bar,
                    start_beat=start_beat,
                    end_bar=end_bar,
                    end_beat=end_beat,
                    symbol=symbol.strip(),
                )
            )
        return cls(segments)

    def _segment_for_bar(self, bar: int) -> Optional[HarmonySegment]:
        for seg in self.segments:
            if seg.start_bar <= bar <= seg.end_bar:
                return seg
        return None

    def _segment_for_position(self, bar: int, beat: int) -> Optional[HarmonySegment]:
        for seg in self.segments:
            if bar < seg.start_bar or bar > seg.end_bar:
                continue
            if bar == seg.start_bar and beat < seg.start_beat:
                continue
            if bar == seg.end_bar and beat > seg.end_beat:
                continue
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

    def get_symbol_at_step(self, bar_number: int, step: int, steps_per_bar: int) -> str:
        if steps_per_bar % 4 != 0:
            raise ValueError("steps_per_bar must be divisible by 4 for beat-aware lookup")
        steps_per_beat = steps_per_bar // 4
        beat = (step // steps_per_beat) + 1
        seg = self._segment_for_position(bar_number, beat)
        if seg is None:
            return "i"
        return seg.symbol


def _parse_bar_beat(token: str, default_beat: int) -> tuple[int, int]:
    if "." in token:
        bar_raw, beat_raw = token.split(".", 1)
        return int(bar_raw.strip()), int(beat_raw.strip())
    return int(token.strip()), default_beat
