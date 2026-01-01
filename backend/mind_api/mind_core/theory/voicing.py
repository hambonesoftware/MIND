from __future__ import annotations

from typing import List


_RANGES = {
    "low": (36, 52),
    "mid": (48, 64),
    "high": (60, 76),
}


def _notes_in_range(pitch_class: int, low: int, high: int) -> List[int]:
    notes = []
    for midi in range(low, high + 1):
        if midi % 12 == pitch_class:
            notes.append(midi)
    return notes


def voice_chord(pitch_classes: List[int], register: str = "mid") -> List[int]:
    if register not in _RANGES:
        register = "mid"
    low, high = _RANGES[register]
    voiced: List[int] = []
    for pc in pitch_classes:
        candidates = _notes_in_range(pc, low, high)
        if candidates:
            voiced.append(candidates[0])
        else:
            midi = pc
            while midi < low:
                midi += 12
            while midi > high:
                midi -= 12
            voiced.append(midi)
    return voiced


def voice_chord_moonlight(pitch_classes_ordered: List[int]) -> List[int]:
    voiced: List[int] = []
    target_bases = [56, 61, 64, 67]
    for idx, pc in enumerate(pitch_classes_ordered[:4]):
        base = target_bases[min(idx, len(target_bases) - 1)]
        while base % 12 != pc:
            base += 1
        while base > 68:
            base -= 12
        voiced.append(base)
    return voiced
