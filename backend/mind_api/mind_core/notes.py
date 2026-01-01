"""Helpers for parsing note specifications.

This module provides utility functions to convert human readable note
strings (such as ``C4``, ``D#3`` or ``Bb2``) into MIDI note numbers
and to parse colon‑separated lists of pitches.  These helpers are
used by the parser and compiler to support chords in v0.3.1.

Functions exported:

* ``note_name_to_midi(name: str) -> int`` – Convert a note name to its
  MIDI number.
* ``parse_notes_spec(spec: str) -> List[int]`` – Parse a
  colon‑separated list of note names or MIDI numbers.
"""

from __future__ import annotations

from typing import List


_NOTE_TO_SEMITONE = {
    "C": 0,
    "D": 2,
    "E": 4,
    "F": 5,
    "G": 7,
    "A": 9,
    "B": 11,
}


def note_name_to_midi(name: str) -> int:
    """Convert a note name to a MIDI note number.

    Note names consist of a letter A–G (case insensitive), an optional
    accidental (``#`` for sharp or ``b`` for flat) and an octave
    number.  Middle C (``C4``) is MIDI note 60.

    :param name: A note name such as ``C4``, ``D#3`` or ``Bb2``.
    :returns: Integer MIDI note number (0–127).
    :raises ValueError: If the name is invalid or out of range.
    """
    name = name.strip()
    if not name:
        raise ValueError("empty note name")
    # Extract letter, accidental and octave components
    letter = name[0].upper()
    if letter not in _NOTE_TO_SEMITONE:
        raise ValueError(f"invalid note letter '{letter}'")
    idx = 1
    accidental = 0
    if idx < len(name) and name[idx] in ('#', 'b'):
        accidental = 1 if name[idx] == '#' else -1
        idx += 1
    # The remainder must be an integer octave
    octave_str = name[idx:]
    if not octave_str or not (octave_str.lstrip("+-").isdigit()):
        raise ValueError(f"invalid octave in note '{name}'")
    octave = int(octave_str)
    semitone = _NOTE_TO_SEMITONE[letter] + accidental
    # Compute MIDI number using (octave + 1) * 12 + semitone.  MIDI note 0
    # corresponds to C-1; C4 is 60.
    midi = (octave + 1) * 12 + semitone
    if midi < 0 or midi > 127:
        raise ValueError(f"MIDI note out of range for '{name}'")
    return midi


def parse_notes_spec(spec: str) -> List[int]:
    """Parse a colon‑separated list of note names or MIDI numbers.

    Accepts tokens such as ``60``, ``C4``, ``D#3`` and ``Bb2`` separated
    by colons.  Whitespace around tokens is ignored.  Integers must
    fall within 0–127 inclusive.  Note names are converted via
    ``note_name_to_midi``.  Returns a list of MIDI numbers.

    :param spec: The raw notes specification string.
    :returns: List of MIDI note numbers.
    :raises ValueError: If any token is invalid or out of range.
    """
    if spec is None:
        return []
    tokens = [t.strip() for t in spec.split(":") if t.strip()]
    if not tokens:
        return []
    pitches: List[int] = []
    for token in tokens:
        # Try integer first
        if token.lstrip("+-").isdigit():
            val = int(token)
            if val < 0 or val > 127:
                raise ValueError(f"MIDI number {val} out of range (0–127)")
            pitches.append(val)
            continue
        # Otherwise interpret as note name
        midi = note_name_to_midi(token)
        pitches.append(midi)
    return pitches


def parse_sequence_spec(spec: str) -> List[int]:
    """Parse a whitespace- or comma-separated sequence of note names or MIDI numbers.

    The sequence specification is similar to the notes specification but
    uses whitespace (spaces, tabs or newlines) and commas as separators
    instead of colons.  Empty tokens are ignored.  Each token may be
    a MIDI number (0–127) or a note name such as C4, D#3 or Bb2.  Note
    names are converted via ``note_name_to_midi``.

    :param spec: Raw sequence specification string.
    :returns: List of MIDI note numbers corresponding to the sequence.
    :raises ValueError: If any token is invalid or out of range, or if
        no valid tokens are found.
    """
    if spec is None:
        return []
    # Replace commas with spaces then split on whitespace
    normalized = spec.replace(",", " ")
    tokens = [t.strip() for t in normalized.split() if t.strip()]
    if not tokens:
        raise ValueError("empty sequence specification")
    pitches: List[int] = []
    for token in tokens:
        # Try integer first
        if token.lstrip("+-").isdigit():
            val = int(token)
            if val < 0 or val > 127:
                raise ValueError(f"MIDI number {val} out of range (0–127)")
            pitches.append(val)
            continue
        # Otherwise interpret as note name
        midi = note_name_to_midi(token)
        pitches.append(midi)
    return pitches
