from __future__ import annotations

from dataclasses import dataclass
from typing import List

from ..models import Event


def steps_per_bar_from_grid(grid: str) -> int:
    mapping = {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,
        "1/16": 16,
        "1/24": 24,
    }
    return mapping.get(grid, 4)


@dataclass
class LatticeOnset:
    step: int
    pitches: List[int]
    velocity: int
    dur_steps: int


class Lattice:
    def __init__(self, steps_per_bar: int) -> None:
        self.steps_per_bar = steps_per_bar
        self.onsets: List[LatticeOnset] = []

    def add_onset(
        self,
        step: int,
        pitches: List[int],
        velocity: int = 100,
        dur_steps: int = 1,
    ) -> None:
        if not pitches:
            return
        self.onsets.append(
            LatticeOnset(
                step=step,
                pitches=list(pitches),
                velocity=velocity,
                dur_steps=max(1, dur_steps),
            )
        )

    def to_events(self, lane: str, preset: str | None) -> List[Event]:
        events: List[Event] = []
        for onset in self.onsets:
            tbeat = (onset.step / self.steps_per_bar) * 4.0
            duration_beats = (onset.dur_steps / self.steps_per_bar) * 4.0
            events.append(
                Event(
                    tBeat=tbeat,
                    lane=lane,
                    note=onset.pitches[0] if onset.pitches else None,
                    pitches=onset.pitches,
                    velocity=onset.velocity,
                    durationBeats=duration_beats,
                    preset=preset,
                )
            )
        return events
