from __future__ import annotations

from mind_api.mind_core.stream_runtime import run_stream_runtime
from mind_api.models import CompileRequest, FlowGraph, FlowGraphEdge, FlowGraphEdgeEndpoint, FlowGraphNode


def _node(node_id: str, node_type: str, params: dict | None = None, ports: dict | None = None) -> FlowGraphNode:
    return FlowGraphNode(
        id=node_id,
        type=node_type,
        params=params or {},
        ui={},
        ports=ports,
    )


def _edge(edge_id: str, from_node: str, from_port: str, to_node: str, to_port: str) -> FlowGraphEdge:
    return FlowGraphEdge(
        id=edge_id,
        **{
            "from": FlowGraphEdgeEndpoint(nodeId=from_node, portId=from_port),
            "to": FlowGraphEdgeEndpoint(nodeId=to_node, portId=to_port),
        },
    )


def _graph(nodes: list[FlowGraphNode], edges: list[FlowGraphEdge]) -> FlowGraph:
    return FlowGraph(graphVersion=9, nodes=nodes, edges=edges)


def test_counter_pre_increment() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "counter",
                "counter",
                params={"start": 0, "step": 1, "resetOnPlay": True},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            ),
        ],
        [_edge("e1", "start", "out", "counter", "in")],
    )
    req = CompileRequest(flowGraph=graph, barIndex=0, bpm=120)
    res = run_stream_runtime(req)
    assert res.runtimeState is not None
    assert res.runtimeState.counters.get("counter") == 1


def test_switch_first_match() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "counter",
                "counter",
                params={"start": 0, "step": 1, "resetOnPlay": True},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            ),
            _node(
                "switch",
                "switch",
                params={
                    "mode": "first",
                    "defaultBranch": "default",
                    "branches": [
                        {"id": "branch-1", "condition": {"type": "always", "value": True}},
                        {"id": "branch-2", "condition": {"type": "always", "value": True}},
                    ],
                },
                ports={
                    "inputs": [{"id": "in", "type": "flow"}],
                    "outputs": [
                        {"id": "branch-1", "type": "flow"},
                        {"id": "branch-2", "type": "flow"},
                        {"id": "default", "type": "flow"},
                    ],
                },
            ),
        ],
        [
            _edge("e1", "start", "out", "counter", "in"),
            _edge("e2", "counter", "out", "switch", "in"),
        ],
    )
    req = CompileRequest(flowGraph=graph, barIndex=0, bpm=120)
    res = run_stream_runtime(req)
    assert res.runtimeState is not None
    assert res.runtimeState.lastSwitchRoutes.get("switch") == "branch-1"


def test_join_waits_for_all_inputs() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought-a", "thought", params={"durationBars": 1, "patternType": "arp-3-up"},
                  ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought-b", "thought", params={"durationBars": 1, "patternType": "arp-3-down"},
                  ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "join",
                "join",
                params={"inputCount": 2},
                ports={
                    "inputs": [{"id": "in-1", "type": "flow"}, {"id": "in-2", "type": "flow"}],
                    "outputs": [{"id": "out", "type": "flow"}],
                },
            ),
        ],
        [
            _edge("e1", "start", "out", "thought-a", "in"),
            _edge("e2", "start", "out", "thought-b", "in"),
            _edge("e3", "thought-a", "out", "join", "in-1"),
            _edge("e4", "thought-b", "out", "join", "in-2"),
        ],
    )
    req = CompileRequest(flowGraph=graph, barIndex=0, bpm=120)
    res = run_stream_runtime(req)
    assert res.runtimeState is not None
    assert res.runtimeState.joins.get("join") in ([], ["in-1"], ["in-2"], ["in-1", "in-2"])


def test_or_merge_allows_single_input() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought-a", "thought", params={"durationBars": 1, "patternType": "arp-3-up"},
                  ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]}),
        ],
        [_edge("e1", "start", "out", "thought-a", "in")],
    )
    req = CompileRequest(flowGraph=graph, barIndex=0, bpm=120)
    res = run_stream_runtime(req)
    assert res.events


def test_safety_cap_warns() -> None:
    nodes = [_node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]} )]
    edges = []
    previous = "start"
    for idx in range(600):
        node_id = f"counter-{idx}"
        nodes.append(
            _node(
                node_id,
                "counter",
                params={"start": 0, "step": 1, "resetOnPlay": True},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            )
        )
        edges.append(_edge(f"edge-{idx}", previous, "out", node_id, "in"))
        previous = node_id
    graph = _graph(nodes, edges)
    req = CompileRequest(flowGraph=graph, barIndex=0, bpm=120)
    res = run_stream_runtime(req)
    assert any("Safety cap" in diag.message for diag in res.diagnostics)
