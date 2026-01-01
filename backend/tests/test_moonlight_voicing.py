import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.theory.voicing import voice_chord_moonlight  # noqa: E402


def test_moonlight_voicing_c_sharp_minor_slash():
    voiced = voice_chord_moonlight([8, 1, 4])
    assert voiced[:3] == [56, 61, 64]
