import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.compiler import compile_request  # noqa: E402
from mind_api.models import CompileRequest, NodeInput, RenderSpec  # noqa: E402


def _simple_theory_node(node_id: str) -> NodeInput:
    return NodeInput(
        id=node_id,
        text='beat(kick, "9...")',
    )


def _base_request(nodes: list[NodeInput]) -> CompileRequest:
    return CompileRequest(
        seed=1,
        bpm=120.0,
        barIndex=0,
        nodes=nodes,
    )


def test_compile_theory_node_returns_events():
    req = _base_request([_simple_theory_node("n1")])
    resp = compile_request(req)
    assert resp.ok is True
    assert len(resp.events) == 1


def test_compile_render_node_wraps_child_identity():
    child = _simple_theory_node("n1")
    render = NodeInput(
        id="r1",
        kind="render",
        childId="n1",
        render=RenderSpec(),
    )
    req = _base_request([child, render])
    resp = compile_request(req)
    assert resp.ok is True
    assert len(resp.events) == 1
    assert resp.events[0].tBeat == 0.0


def test_compile_cycle_reports_error():
    node_a = NodeInput(id="a", kind="render", childId="b", render=RenderSpec())
    node_b = NodeInput(id="b", kind="render", childId="a", render=RenderSpec())
    req = _base_request([node_a, node_b])
    resp = compile_request(req)
    assert resp.ok is False
    assert any("Cycle detected" in diag.message for diag in resp.diagnostics)
