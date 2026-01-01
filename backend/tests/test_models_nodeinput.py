import sys
from pathlib import Path

import pytest
from pydantic import ValidationError

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.models import NodeInput, RenderSpec  # noqa: E402


def test_theory_node_legacy_payload_validates():
    node = NodeInput(id="node-1", text="kick 1/4")
    assert node.kind == "theory"
    assert node.text == "kick 1/4"


def test_render_node_validates_with_child_and_render():
    node = NodeInput(
        id="render-1",
        kind="render",
        childId="node-1",
        render=RenderSpec(),
    )
    assert node.kind == "render"
    assert node.childId == "node-1"


def test_render_node_missing_child_fails():
    with pytest.raises(ValidationError):
        NodeInput(id="render-2", kind="render", render=RenderSpec())


def test_theory_node_missing_text_fails():
    with pytest.raises(ValidationError):
        NodeInput(id="node-2")
