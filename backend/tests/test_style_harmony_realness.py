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


def test_progression_custom_produces_multiple_chords() -> None:
    params = {
        "durationBars": 2,
        "harmonyMode": "progression_custom",
        "progressionCustom": "I V vi IV",
        "progressionCustomVariantStyle": "triads",
        "progressionLength": 4,
        "chordsPerBar": "1",
        "fillBehavior": "repeat",
        "rhythmGrid": "1/8",
        "patternType": "arp-3-up",
        "registerMin": 48,
        "registerMax": 72,
    }
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought", "thought", params=params, ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []}),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    runtime_state = None
    bar_roots: dict[int, set[int]] = {}
    for bar_index in range(2):
        res = run_stream_runtime(
            CompileRequest(flowGraph=graph, barIndex=bar_index, bpm=120, seed=11, runtimeState=runtime_state)
        )
        for event in res.events:
            if event.lane != "note":
                continue
            bar_roots.setdefault(bar_index, set()).update(event.pitches)
        runtime_state = res.runtimeState
    distinct_roots = {min(pitches) for pitches in bar_roots.values() if pitches}
    assert len(distinct_roots) > 1, "progression_custom should produce more than one chord over time."
