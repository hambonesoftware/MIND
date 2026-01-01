import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.theory.key import parse_key  # noqa: E402
from mind_api.mind_core.theory.roman import resolve_roman  # noqa: E402


def test_roman_c_sharp_minor_i():
    key = parse_key("C# minor")
    pcs = resolve_roman(key, "i")
    assert set(pcs) == {1, 4, 8}
