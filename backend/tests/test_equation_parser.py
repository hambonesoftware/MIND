import sys
from pathlib import Path

import pytest

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.parser import parse_text  # noqa: E402


def test_equation_parser_valid():
    text = (
        'equation(lane="note", grid="1/12", bars="1-16", '
        'preset="gm:0:0", key="C# minor", harmony="1-2:i", motions="sustain(chord)")'
    )
    ast, diags = parse_text(text)
    assert diags == []
    assert ast is not None
    assert ast.kind == "equation"
    assert ast.lane == "note"
    assert ast.key == "C# minor"


def test_equation_parser_missing_required():
    text = 'equation(lane="note", grid="1/12", bars="1-16")'
    ast, diags = parse_text(text)
    assert ast is None
    assert any("Missing required argument" in diag.message for diag in diags)


def test_equation_parser_unknown_kwarg():
    text = 'equation(lane="note", grid="1/12", bars="1-16", key="C", foo="bar")'
    ast, diags = parse_text(text)
    assert ast is None
    assert any("Unknown argument" in diag.message for diag in diags)


def test_beat_parser_regression():
    text = 'beat(kick, "9...")'
    ast, diags = parse_text(text)
    assert diags == []
    assert ast is not None
    assert ast.kind == "beat"
