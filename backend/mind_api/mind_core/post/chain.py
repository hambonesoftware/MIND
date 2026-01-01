from __future__ import annotations

from typing import List

from ...models import CompileRequest, Event, RenderSpec
from .perc import apply_perc
from .strum import apply_strum


def apply_render_chain(
    events: List[Event],
    render: RenderSpec | None,
    req: CompileRequest,
) -> List[Event]:
    if render is None:
        return list(events)

    processed = list(events)
    if render.strum and render.strum.enabled:
        processed = apply_strum(processed, render.strum, req.bpm)
    if render.perc and render.perc.enabled:
        processed = apply_perc(processed, render.perc)

    return sorted(
        processed,
        key=lambda e: (
            e.tBeat,
            e.pitches[0] if e.pitches else -1,
            e.lane,
        ),
    )
