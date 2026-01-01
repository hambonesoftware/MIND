"""Render post-processing chain helpers."""

from __future__ import annotations

from typing import List, Optional

from ...models import Event, RenderSpec
from .perc import apply_perc
from .strum import apply_strum


def apply_render_chain(
    events: List[Event],
    render: Optional[RenderSpec],
    bpm: float,
) -> List[Event]:
    """Apply render transforms in order to the event list."""
    if not render:
        return events

    processed = events
    if render.strum:
        processed = apply_strum(processed, render.strum, bpm)
    if render.perc:
        processed = apply_perc(processed, render.perc)
    return processed
