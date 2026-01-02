"""Parse MusicXML/MXL files into normalized note events."""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
from pathlib import Path
from typing import Iterable, Optional
from xml.etree import ElementTree
from zipfile import ZipFile

from .normalization import (
    DEFAULT_BEATS_PER_BAR,
    DEFAULT_GRID,
    DEFAULT_TOLERANCE_STEPS,
    quantize_beats_to_grid_steps,
    select_grid_for_events,
    steps_per_bar_from_grid,
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


@dataclass
class RawNoteEvent:
    bar_index: int
    onset_beats: Fraction
    duration_beats: Fraction
    pitch: int
    voice: str
    staff: int
    part_id: str
    tie_start: bool
    tie_stop: bool
    tie_continue: bool


def parse_mxl_note_events(
    path: str | Path,
    *,
    part_ids: Optional[Iterable[str]] = None,
    staff: Optional[int] = None,
    voice: Optional[str] = None,
    bar_start: Optional[int] = None,
    bar_end: Optional[int] = None,
    grid: str = DEFAULT_GRID,
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
        steps. Timing is kept at high resolution until after chord grouping and
        tie merging.
    """
    path = Path(path)
    part_filter = set(part_ids or []) or None

    root = _load_score_root(path)
    namespace = _extract_namespace(root.tag)

    raw_events: list[RawNoteEvent] = []
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
            measure_cursor = Fraction(0, 1)
            last_note_onset: Optional[Fraction] = None

            for element in measure:
                if element.tag == f"{namespace}attributes":
                    divisions = _divisions_from_attributes(element, namespace) or divisions
                    continue

                if element.tag == f"{namespace}backup":
                    measure_cursor -= _duration_in_beats(element, namespace, divisions)
                    continue

                if element.tag == f"{namespace}forward":
                    measure_cursor += _duration_in_beats(element, namespace, divisions)
                    continue

                if element.tag != f"{namespace}note":
                    continue

                note = element
                voice_value = _child_text(note, f"{namespace}voice") or "1"
                staff_value = int(_child_text(note, f"{namespace}staff") or 1)

                duration_value = _duration_in_beats(note, namespace, divisions)
                is_chord = note.find(f"{namespace}chord") is not None
                is_rest = note.find(f"{namespace}rest") is not None

                if is_chord and last_note_onset is not None:
                    onset = last_note_onset
                else:
                    onset = measure_cursor

                if not is_chord:
                    last_note_onset = onset
                    measure_cursor += duration_value

                if is_rest:
                    continue
                if staff is not None and staff_value != staff:
                    continue
                if voice is not None and voice_value != voice:
                    continue

                pitch = _pitch_to_midi(note, namespace)
                if pitch is None:
                    continue

                tie_start, tie_stop, tie_continue = _tie_flags(note, namespace)

                raw_events.append(
                    RawNoteEvent(
                        bar_index=measure_index - 1,
                        onset_beats=onset,
                        duration_beats=duration_value,
                        pitch=pitch,
                        voice=voice_value,
                        staff=staff_value,
                        part_id=part_id,
                        tie_start=tie_start,
                        tie_stop=tie_stop,
                        tie_continue=tie_continue,
                    )
                )

    merged_events = _merge_tied_events(raw_events)
    normalized = _quantize_events(
        merged_events,
        grid=grid,
        beats_per_bar=DEFAULT_BEATS_PER_BAR,
        tolerance_steps=DEFAULT_TOLERANCE_STEPS,
    )
    return normalized


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
    return _divisions_from_attributes(attributes, namespace) or 1


def _child_text(parent: ElementTree.Element, tag: str) -> Optional[str]:
    child = parent.find(tag)
    if child is None or child.text is None:
        return None
    return child.text.strip()


def _divisions_from_attributes(
    attributes: ElementTree.Element, namespace: str
) -> Optional[int]:
    divisions = attributes.find(f"{namespace}divisions")
    if divisions is None or divisions.text is None:
        return None
    try:
        return int(divisions.text.strip())
    except ValueError:
        return None


def _duration_in_beats(
    element: ElementTree.Element, namespace: str, divisions: int
) -> Fraction:
    duration_text = _child_text(element, f"{namespace}duration")
    if not duration_text:
        return Fraction(0, 1)
    try:
        duration_divisions = int(duration_text)
    except ValueError:
        return Fraction(0, 1)
    if divisions <= 0:
        return Fraction(0, 1)
    return Fraction(duration_divisions, divisions)


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


def _tie_flags(note: ElementTree.Element, namespace: str) -> tuple[bool, bool, bool]:
    types: set[str] = set()
    for tie in note.findall(f"{namespace}tie"):
        tie_type = tie.get("type")
        if tie_type:
            types.add(tie_type)
    for tied in note.findall(f"{namespace}notations/{namespace}tied"):
        tie_type = tied.get("type")
        if tie_type:
            types.add(tie_type)
    return "start" in types, "stop" in types, "continue" in types


def _merge_tied_events(events: list[RawNoteEvent]) -> list[RawNoteEvent]:
    merged: list[RawNoteEvent] = []
    active: dict[tuple[str, int, str, int], RawNoteEvent] = {}

    for event in events:
        key = (event.part_id, event.staff, event.voice, event.pitch)
        if key in active:
            active_event = active[key]
            active_event.duration_beats += event.duration_beats
            if event.tie_stop and not event.tie_continue:
                merged.append(active_event)
                del active[key]
            continue

        if event.tie_start or event.tie_continue:
            if event.tie_stop and not event.tie_continue:
                merged.append(event)
            else:
                active[key] = event
            continue

        merged.append(event)

    merged.extend(active.values())
    return merged


def _quantize_events(
    events: list[RawNoteEvent],
    *,
    grid: str,
    beats_per_bar: int,
    tolerance_steps: float,
) -> list[NormalizedNoteEvent]:
    beat_values = []
    for event in events:
        beat_values.append(float(event.onset_beats))
        beat_values.append(float(event.duration_beats))

    effective_grid = grid
    if grid == "adaptive":
        effective_grid = select_grid_for_events(beat_values, beats_per_bar=beats_per_bar)

    steps_per_bar = steps_per_bar_from_grid(effective_grid)
    normalized: list[NormalizedNoteEvent] = []
    for event in events:
        onset_steps = quantize_beats_to_grid_steps(
            float(event.onset_beats),
            steps_per_bar=steps_per_bar,
            beats_per_bar=beats_per_bar,
            tolerance_steps=tolerance_steps,
        )
        duration_steps = quantize_beats_to_grid_steps(
            float(event.duration_beats),
            steps_per_bar=steps_per_bar,
            beats_per_bar=beats_per_bar,
            tolerance_steps=tolerance_steps,
        )
        normalized.append(
            NormalizedNoteEvent(
                bar_index=event.bar_index,
                grid_onset=onset_steps,
                duration=duration_steps,
                pitch=event.pitch,
                voice=event.voice,
                staff=event.staff,
                part_id=event.part_id,
            )
        )
    return normalized
