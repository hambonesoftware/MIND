import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.theory.chord_symbols import parse_chord_symbol  # noqa: E402


def test_parse_chord_symbol_minor_triad():
    assert parse_chord_symbol("C#m") == [1, 4, 8]


def test_parse_chord_symbol_slash_bass():
    assert parse_chord_symbol("C#m/G#") == [8, 1, 4]


def test_parse_chord_symbol_dominant_seventh():
    assert parse_chord_symbol("G#7") == [8, 0, 3, 6]


def test_parse_chord_symbol_sus4_seventh():
    assert parse_chord_symbol("G#7sus4") == [8, 1, 3, 6]


def test_parse_chord_symbol_major_seventh():
    assert parse_chord_symbol("Bmaj7") == [11, 3, 6, 10]
