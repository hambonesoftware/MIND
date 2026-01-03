import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.compiler import MAX_GRAPH_DEPTH, compile_request  # noqa: E402
from mind_api.models import CompileRequest, EdgeInput, NodeInput, RenderSpec  # noqa: E402


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
    start = NodeInput(id="start", kind="start")
    theory = _simple_theory_node("n1")
    req = _base_request([start, theory])
    req.edges = [
        EdgeInput.model_validate(
            {"from": {"nodeId": "start"}, "to": {"nodeId": "n1"}},
        ),
    ]
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
    start = NodeInput(id="start", kind="start")
    req = _base_request([start, child, render])
    req.edges = [
        EdgeInput.model_validate(
            {"from": {"nodeId": "start"}, "to": {"nodeId": "r1"}},
        ),
        EdgeInput.model_validate(
            {"from": {"nodeId": "r1"}, "to": {"nodeId": "n1"}},
        ),
    ]
    resp = compile_request(req)
    assert resp.ok is True
    assert len(resp.events) == 1
    assert resp.events[0].tBeat == 0.0


def test_compile_cycle_reports_error():
    start = NodeInput(id="start", kind="start")
    node_a = NodeInput(id="a", kind="render", childId="b", render=RenderSpec())
    node_b = NodeInput(id="b", kind="render", childId="a", render=RenderSpec())
    req = _base_request([start, node_a, node_b])
    req.startNodeIds = ["start"]
    req.edges = [
        EdgeInput.model_validate(
            {"from": {"nodeId": "start"}, "to": {"nodeId": "a"}},
        ),
        EdgeInput.model_validate(
            {"from": {"nodeId": "a"}, "to": {"nodeId": "b"}},
        ),
        EdgeInput.model_validate(
            {"from": {"nodeId": "b"}, "to": {"nodeId": "a"}},
        ),
    ]
    resp = compile_request(req)
    assert resp.ok is False
    assert any("Cycle detected" in diag.message for diag in resp.diagnostics)


def test_graph_validation_reports_missing_edge_nodes():
    node = _simple_theory_node("n1")
    start = NodeInput(id="start", kind="start")
    edge = EdgeInput.model_validate(
        {"from": {"nodeId": "n1"}, "to": {"nodeId": "missing"}},
    )
    req = _base_request([start, node])
    req.edges = [
        EdgeInput.model_validate(
            {"from": {"nodeId": "start"}, "to": {"nodeId": "n1"}},
        ),
        edge,
    ]
    resp = compile_request(req)
    assert resp.ok is False
    assert any("Edge references missing node" in diag.message for diag in resp.diagnostics)


def test_graph_validation_reports_port_type_mismatch():
    start = NodeInput(
        id="start",
        kind="start",
        outputPorts=[{"id": "out", "direction": "out", "dataType": "events"}],
    )
    render = NodeInput(
        id="render",
        kind="render",
        render=RenderSpec(),
        inputPorts=[{"id": "in", "direction": "in", "dataType": "flow"}],
        childId="theory",
    )
    theory = _simple_theory_node("theory")
    req = _base_request([start, render, theory])
    req.edges = [
        EdgeInput.model_validate(
            {
                "from": {"nodeId": "start", "portId": "out"},
                "to": {"nodeId": "render", "portId": "in"},
            },
        ),
        EdgeInput.model_validate(
            {"from": {"nodeId": "render"}, "to": {"nodeId": "theory"}},
        ),
    ]
    resp = compile_request(req)
    assert resp.ok is False
    assert any("connects incompatible port types" in diag.message for diag in resp.diagnostics)


def test_reachable_node_traversal_honors_start_nodes():
    start = NodeInput(id="start", kind="start")
    theory = _simple_theory_node("t1")
    unreachable = NodeInput(id="t2", text='beat(kick, "99..")')
    req = _base_request([start, theory, unreachable])
    req.startNodeIds = ["start"]
    req.edges = [
        EdgeInput.model_validate(
            {"from": {"nodeId": "start"}, "to": {"nodeId": "t1"}},
        ),
    ]
    resp = compile_request(req)
    assert resp.ok is True
    assert len(resp.events) == 1


def test_unreachable_nodes_skip_missing_input_validation():
    start = NodeInput(id="start", kind="start")
    reachable = _simple_theory_node("t1")
    unreachable = NodeInput(id="render-missing", kind="render", render=RenderSpec())
    req = _base_request([start, reachable, unreachable])
    req.startNodeIds = ["start"]
    req.edges = [
        EdgeInput.model_validate(
            {"from": {"nodeId": "start"}, "to": {"nodeId": "t1"}},
        ),
    ]
    resp = compile_request(req)
    assert resp.ok is True
    assert len(resp.events) == 1
    assert not any("missing a required input" in diag.message for diag in resp.diagnostics)


def test_missing_input_reports_error_for_entry_node():
    theory = _simple_theory_node("t1")
    req = _base_request([theory])
    req.startNodeIds = ["t1"]
    resp = compile_request(req)
    assert resp.ok is False
    assert any("missing a required input" in diag.message for diag in resp.diagnostics)


def test_loop_guard_trips_on_excessive_depth():
    start = NodeInput(id="start", kind="start")
    render_nodes = []
    edges = [
        EdgeInput.model_validate(
            {"from": {"nodeId": "start"}, "to": {"nodeId": "r0"}},
        ),
    ]
    for idx in range(MAX_GRAPH_DEPTH):
        render_nodes.append(
            NodeInput(
                id=f"r{idx}",
                kind="render",
                childId=f"r{idx + 1}" if idx < MAX_GRAPH_DEPTH - 1 else "t1",
                render=RenderSpec(),
            )
        )
        edges.append(
            EdgeInput.model_validate(
                {
                    "from": {"nodeId": f"r{idx}"},
                    "to": {
                        "nodeId": f"r{idx + 1}" if idx < MAX_GRAPH_DEPTH - 1 else "t1",
                    },
                },
            ),
        )
    theory = _simple_theory_node("t1")
    req = _base_request([start, theory, *render_nodes])
    req.startNodeIds = ["start"]
    req.edges = edges
    resp = compile_request(req)
    assert resp.ok is False
    assert any("Loop guard tripped" in diag.message for diag in resp.diagnostics)
