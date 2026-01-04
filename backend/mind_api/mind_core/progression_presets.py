from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional


@dataclass(frozen=True)
class ProgressionVariant:
    id: str
    name: str


@dataclass(frozen=True)
class ProgressionPreset:
    id: str
    name: str
    romans: List[str]
    default_length: int
    variants: List[ProgressionVariant]


_DEFAULT_VARIANTS = [
    ProgressionVariant(id="triads", name="Standard (Triads)"),
    ProgressionVariant(id="7ths", name="Add 7ths"),
]


PROGRESSION_PRESETS: List[ProgressionPreset] = [
    ProgressionPreset(
        id="pop_i_v_vi_iv",
        name="I–V–vi–IV (Pop)",
        romans=["I", "V", "vi", "IV"],
        default_length=4,
        variants=_DEFAULT_VARIANTS,
    ),
    ProgressionPreset(
        id="pop_vi_iv_i_v",
        name="vi–IV–I–V (Pop)",
        romans=["vi", "IV", "I", "V"],
        default_length=4,
        variants=_DEFAULT_VARIANTS,
    ),
    ProgressionPreset(
        id="fifties_i_vi_iv_v",
        name="I–vi–IV–V (50s)",
        romans=["I", "vi", "IV", "V"],
        default_length=4,
        variants=_DEFAULT_VARIANTS,
    ),
    ProgressionPreset(
        id="cinematic_minor_i_vi_iii_vii",
        name="i–VI–III–VII (Cinematic minor)",
        romans=["i", "VI", "III", "VII"],
        default_length=4,
        variants=_DEFAULT_VARIANTS,
    ),
    ProgressionPreset(
        id="minor_loop_i_vii_vi_vii",
        name="i–VII–VI–VII (Minor loop)",
        romans=["i", "VII", "VI", "VII"],
        default_length=4,
        variants=_DEFAULT_VARIANTS,
    ),
    ProgressionPreset(
        id="jazz_ii_v_i",
        name="ii–V–I (Jazz)",
        romans=["ii", "V", "I"],
        default_length=3,
        variants=_DEFAULT_VARIANTS,
    ),
]


def get_progression_preset(preset_id: str | None) -> Optional[ProgressionPreset]:
    if not preset_id:
        return None
    for preset in PROGRESSION_PRESETS:
        if preset.id == preset_id:
            return preset
    return None
