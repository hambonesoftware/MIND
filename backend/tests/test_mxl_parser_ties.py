from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.reporting.mxl_parser import parse_mxl_note_events  # noqa: E402


FIXTURES_DIR = Path(__file__).resolve().parents[2] / "planV7.3" / "Fixtures"


def test_tie_within_measure_merges_duration():
    xml = """<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1">
      <part-name>Piano</part-name>
    </score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>12</divisions>
        <time><beats>4</beats><beat-type>4</beat-type></time>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>12</duration>
        <voice>1</voice>
        <type>quarter</type>
        <tie type="start"/>
        <notations><tied type="start"/></notations>
      </note>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>12</duration>
        <voice>1</voice>
        <type>quarter</type>
        <tie type="stop"/>
        <notations><tied type="stop"/></notations>
      </note>
    </measure>
  </part>
</score-partwise>
"""
    path = Path(__file__).resolve().parent / "_tmp_tie_within_measure.xml"
    path.write_text(xml, encoding="utf-8")
    try:
        events = parse_mxl_note_events(path)
    finally:
        path.unlink(missing_ok=True)

    assert len(events) == 1
    assert events[0].grid_onset == 0
    assert events[0].duration == 6


def test_tie_across_measures_merges_duration():
    events = parse_mxl_note_events(FIXTURES_DIR / "mxl_tie_across_measures.xml")
    assert len(events) == 1
    assert events[0].grid_onset == 0
    assert events[0].duration == 12
