from __future__ import annotations

import re
from typing import List, Optional

from ..lattice import Lattice


def _parse_pattern(pattern: str) -> List[str]:
    """
    Parse pattern tokens like:
      "low-mid-high-mid"
      "low mid high mid"
      "0-1-2-1"
    """
    pat = (pattern or "").strip()
    if not pat:
        pat = "low-mid-high-mid"
    tokens = re.split(r"[\s,\-_/]+", pat)
    return [t.strip().lower() for t in tokens if t and t.strip()]


def _parse_order(order: Optional[str], chord_len: int) -> List[int]:
    """
    Optional ordering of tones within the chosen chord.

    Supports:
      - "up", "down", "updown"
      - "0,1,2,1" (any int list)

    Falls back to "up" if nothing valid is provided.
    """
    if chord_len <= 0:
        return [0]

    if not order:
        return list(range(chord_len))

    o = order.strip().lower()
    if o in {"up", "asc", "ascending"}:
        return list(range(chord_len))
    if o in {"down", "desc", "descending"}:
        return list(reversed(range(chord_len)))
    if o in {"updown", "up-down", "ascdesc"}:
        if chord_len == 1:
            return [0]
        up = list(range(chord_len))
        down = list(range(chord_len - 2, 0, -1))
        return up + down

    # Try to parse an explicit integer list
    parts = re.split(r"[\s,]+", o)
    ints: List[int] = []
    for p in parts:
        p = p.strip()
        if not p:
            continue
        try:
            ints.append(int(p))
        except ValueError:
            ints = []
            break

    if ints:
        return ints

    return list(range(chord_len))


def apply_arpeggiate(
    lattice: Lattice,
    chord_by_register: List[List[int]],
    pattern: str = "low-mid-high-mid",
    order: Optional[str] = None,
    start: int = 0,
    chord_by_step: Optional[List[List[int]]] = None,
    velocity: int = 90,
    dur_steps: int = 1,
) -> None:
    """
    Apply an arpeggio to a lattice by adding onsets at grid steps.

    - chord_by_register: [lowChord, midChord, highChord]
    - pattern: token sequence ("low-mid-high-mid" or "0-1-2-1")
      * low/mid/high select register chord (0/1/2)
      * digits select a tone index within the chosen chord
    - order: optional ordering of tones when token is a register name
    - start: pattern phase offset (shifts which token is used at step 0)
    - chord_by_step: if provided, overrides chord selection per step (tones mode)
    """
    tokens = _parse_pattern(pattern)

    steps_per_bar = getattr(lattice, "steps_per_bar", 0) or 0
    if steps_per_bar <= 0:
        return

    try:
        start_i = int(start)
    except Exception:
        start_i = 0

    arp_counter = 0

    for step in range(steps_per_bar):
        tok = tokens[(step + start_i) % len(tokens)] if tokens else "mid"

        # Select chord for this step
        if chord_by_step is not None:
            if not chord_by_step:
                chord: List[int] = []
            else:
                chord = chord_by_step[step] if step < len(chord_by_step) else chord_by_step[-1]
        else:
            reg_idx = 1  # mid default
            if tok in {"low", "l"}:
                reg_idx = 0
            elif tok in {"mid", "m"}:
                reg_idx = 1
            elif tok in {"high", "h"}:
                reg_idx = 2

            if not chord_by_register:
                chord = []
            else:
                reg_idx = max(0, min(len(chord_by_register) - 1, reg_idx))
                chord = chord_by_register[reg_idx]

        if not chord:
            continue

        # Choose pitch within chord
        if tok.isdigit():
            idx = int(tok) % len(chord)
            pitch = chord[idx]
        else:
            tone_order = _parse_order(order, len(chord))
            tone_idx = tone_order[arp_counter % len(tone_order)] % len(chord)
            pitch = chord[tone_idx]

        arp_counter += 1

        # IMPORTANT: Lattice.add_onset expects pitches: List[int]
        lattice.add_onset(
            step=step,
            pitches=[pitch],
            velocity=velocity,
            dur_steps=dur_steps,
        )
