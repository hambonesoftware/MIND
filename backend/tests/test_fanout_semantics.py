from __future__ import annotations

import sys

sys.path.append("backend")

from mind_api.mind_core.stream_runtime import run_stream_runtime
from mind_api.models import CompileRequest, FlowGraph, FlowGraphEdge, FlowGraphEdgeEndpoint, FlowGraphNode


def _node(node_id: str, node_type: str, params: dict | None = None, ports: dict | None = None) -> FlowGraphNode:
    return FlowGraphNode(id=node_id, type=node_type, params=params or {}, ui={}, ports=ports)


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


def test_thought_fanout_sends_tokens_to_all_outgoing_edges() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "thought-a",
                "thought",
                params={"durationBars": 1, "patternType": "arp-3-up"},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            ),
            _node(
                "thought-b",
                "thought",
                params={"durationBars": 1, "patternType": "arp-3-up", "registerMin": 48, "registerMax": 60},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []},
            ),
            _node(
                "thought-c",
                "thought",
                params={"durationBars": 1, "patternType": "arp-3-up", "registerMin": 84, "registerMax": 96},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []},
            ),
        ],
        [
            _edge("e0", "start", "out", "thought-a", "in"),
            _edge("e1", "thought-a", "out", "thought-b", "in"),
            _edge("e2", "thought-a", "out", "thought-c", "in"),
        ],
    )

    res0 = run_stream_runtime(CompileRequest(flowGraph=graph, barIndex=0, bpm=120))
    assert res0.runtimeState is not None
    assert {t.nodeId for t in res0.runtimeState.activeTokens} == {"thought-b", "thought-c"}

    res1 = run_stream_runtime(
        CompileRequest(flowGraph=graph, barIndex=1, bpm=120, runtimeState=res0.runtimeState)
    )
    assert res1.events, "Expected events from fan-out targets"
    assert res1.runtimeState is not None
    pitches = {tuple(sorted(ev.pitches or [])) for ev in res1.events}
    assert any(min(p) <= 60 for p in pitches)  # thought-b register
    assert any(max(p) >= 84 for p in pitches)  # thought-c register


def test_start_edges_queue_sequentially_before_fanout_nodes() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "thought-long",
                "thought",
                params={"durationBars": 2, "patternType": "arp-3-up"},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []},
            ),
            _node(
                "thought-next",
                "thought",
                params={"durationBars": 1, "patternType": "arp-3-down"},
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []},
            ),
        ],
        [
            _edge("e1", "start", "out", "thought-long", "in"),
            _edge("e2", "start", "out", "thought-next", "in"),
        ],
    )

    res0 = run_stream_runtime(CompileRequest(flowGraph=graph, barIndex=0, bpm=120))
    assert res0.runtimeState is not None
    assert "thought-long" in res0.runtimeState.activeThoughts
    assert all(token.nodeId != "thought-next" for token in res0.runtimeState.activeTokens)

    res1 = run_stream_runtime(
        CompileRequest(flowGraph=graph, barIndex=1, bpm=120, runtimeState=res0.runtimeState)
    )
    assert res1.runtimeState is not None
    assert any(token.nodeId == "thought-next" for token in res1.runtimeState.activeTokens)
