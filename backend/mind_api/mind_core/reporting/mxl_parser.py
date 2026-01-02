"""Parse MusicXML/MXL files into normalized note events."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, Optional
from xml.etree import ElementTree
from zipfile import ZipFile

from .normalization import (
    DEFAULT_GRID,
    DEFAULT_TOLERANCE_STEPS,
    normalize_note_timing,
)


@dataclass(frozen=True)
class NormalizedNoteEvent:
    """Note event aligned to solver grid steps within a bar."""

    bar_index: int
    grid_onset: float
    duration: float
    pitch: int
    voice: str
    staff: int
    part_id: str


def parse_mxl_note_events(
    path: str | Path,
    *,
    part_ids: Optional[Iterable[str]] = None,
    staff: Optional[int] = None,
    voice: Optional[str] = None,
    bar_start: Optional[int] = None,
    bar_end: Optional[int] = None,
) -> list[NormalizedNoteEvent]:
    """Extract normalized note events from a MusicXML/MXL file.

    Args:
        path: Path to the .mxl or .musicxml file.
        part_ids: Optional iterable of part IDs to include.
        staff: Optional staff number to include (1 = right hand in piano scores).
        voice: Optional voice label to include.
        bar_start: Optional 1-based start bar (inclusive).
        bar_end: Optional 1-based end bar (inclusive).

    Returns:
        List of note events with onsets and durations snapped to solver grid
        steps (default grid "1/12").
    """
    path = Path(path)
    part_filter = set(part_ids or []) or None

    root = _load_score_root(path)
    namespace = _extract_namespace(root.tag)

    events: list[NormalizedNoteEvent] = []
    for part in root.findall(f"{namespace}part"):
        part_id = part.get("id", "")
        if part_filter and part_id not in part_filter:
            continue

        measure_index = 0
        for measure in part.findall(f"{namespace}measure"):
            measure_index += 1
            if bar_start is not None and measure_index < bar_start:
                continue
            if bar_end is not None and measure_index > bar_end:
                break

            divisions = _measure_divisions(measure, namespace)
            voice_positions: dict[tuple[str, int], float] = {}

            for note in measure.findall(f"{namespace}note"):
                voice_value = _child_text(note, f"{namespace}voice") or "1"
                staff_value = int(_child_text(note, f"{namespace}staff") or 1)
                position_key = (voice_value, staff_value)
                current_position = voice_positions.get(position_key, 0.0)

                duration_value = _duration_in_beats(note, namespace, divisions)
                is_chord = note.find(f"{namespace}chord") is not None
                is_rest = note.find(f"{namespace}rest") is not None

                onset = current_position
                if not is_chord:
                    voice_positions[position_key] = current_position + duration_value

                if is_rest:
                    continue
                if staff is not None and staff_value != staff:
                    continue
                if voice is not None and voice_value != voice:
                    continue

                pitch = _pitch_to_midi(note, namespace)
                if pitch is None:
                    continue

                grid_onset, grid_duration = normalize_note_timing(
                    onset,
                    duration_value,
                    grid=DEFAULT_GRID,
                    tolerance_steps=DEFAULT_TOLERANCE_STEPS,
                )

                events.append(
                    NormalizedNoteEvent(
                        bar_index=measure_index - 1,
                        grid_onset=grid_onset,
                        duration=grid_duration,
                        pitch=pitch,
                        voice=voice_value,
                        staff=staff_value,
                        part_id=part_id,
                    )
                )

    return events


def _load_score_root(path: Path) -> ElementTree.Element:
    if path.suffix.lower() in {".xml", ".musicxml"}:
        return ElementTree.parse(path).getroot()

    with ZipFile(path) as archive:
        xml_name = _find_musicxml_file(archive)
        with archive.open(xml_name) as handle:
            return ElementTree.parse(handle).getroot()


def _find_musicxml_file(archive: ZipFile) -> str:
    for name in archive.namelist():
        if name.lower().endswith((".xml", ".musicxml")) and not name.startswith("META-INF/"):
            return name
    raise ValueError("No MusicXML content found inside archive")


def _extract_namespace(tag: str) -> str:
    if tag.startswith("{"):
        return tag.split("}", 1)[0] + "}"
    return ""


def _measure_divisions(measure: ElementTree.Element, namespace: str) -> int:
    attributes = measure.find(f"{namespace}attributes")
    if attributes is None:
        return 1
    divisions = attributes.find(f"{namespace}divisions")
    if divisions is None or divisions.text is None:
        return 1
    try:
        return int(divisions.text.strip())
    except ValueError:
        return 1


def _child_text(parent: ElementTree.Element, tag: str) -> Optional[str]:
    child = parent.find(tag)
    if child is None or child.text is None:
        return None
    return child.text.strip()


def _duration_in_beats(
    note: ElementTree.Element, namespace: str, divisions: int
) -> float:
    duration_text = _child_text(note, f"{namespace}duration")
    if not duration_text:
        return 0.0
    try:
        duration_divisions = int(duration_text)
    except ValueError:
        return 0.0
    if divisions <= 0:
        return 0.0
    return duration_divisions / float(divisions)


def _pitch_to_midi(note: ElementTree.Element, namespace: str) -> Optional[int]:
    pitch = note.find(f"{namespace}pitch")
    if pitch is None:
        return None

    step = _child_text(pitch, f"{namespace}step")
    octave_text = _child_text(pitch, f"{namespace}octave")
    if step is None or octave_text is None:
        return None

    try:
        octave = int(octave_text)
    except ValueError:
        return None

    alter_text = _child_text(pitch, f"{namespace}alter")
    alter = int(alter_text) if alter_text and alter_text.lstrip("+-").isdigit() else 0

    step_map = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}
    semitone = step_map.get(step.upper())
    if semitone is None:
        return None

    midi = (octave + 1) * 12 + semitone + alter
    if 0 <= midi <= 127:
        return midi
    return None
