from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable, Tuple

from ..determinism import stable_seed


@dataclass(frozen=True)
class TextureRecipe:
    pattern_family: Tuple[str, ...] = ("low-mid-high",)
    register: str = "mid"
    sustain_policy: str = "hold_until_change"
    accent_weights: Tuple[float, ...] = (1.0, 0.9, 0.85, 0.9)

    def pattern_for_bar(self, *, seed: int, piece_id: str, bar_index: int) -> str:
        if not self.pattern_family:
            return "low-mid-high"
        stable = stable_seed(f"{piece_id}:{seed}:{bar_index}")
        return self.pattern_family[stable % len(self.pattern_family)]
