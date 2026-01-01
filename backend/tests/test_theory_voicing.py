import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.theory.voicing import voice_chord  # noqa: E402


def test_voice_chord_preserves_input_order():
    pitch_classes = [8, 1, 4]
    voiced = voice_chord(pitch_classes, register="mid")
    assert [note % 12 for note in voiced] == pitch_classes


def test_voice_chord_keeps_dominant_seventh_spelling_order():
    pitch_classes = [8, 0, 3, 6]
    voiced = voice_chord(pitch_classes, register="mid")
    assert [note % 12 for note in voiced] == pitch_classes
