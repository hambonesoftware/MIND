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


def _sequence(events):
    return [
        (round(event.tBeat, 3), tuple(event.pitches), round(event.durationBeats, 3))
        for event in events
        if event.lane == "note"
    ]


def _compile(style_seed: int):
    params = {
        "durationBars": 1,
        "harmonyMode": "single",
        "chordRoot": "D3",
        "chordQuality": "minor",
        "registerMin": 48,
        "registerMax": 84,
        "rhythmGrid": "1/8",
        "patternType": "arp-3-up",
        "notePatternId": "simple_arpeggio",
        "styleSeed": style_seed,
    }
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought", "thought", params=params, ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []}),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    res = run_stream_runtime(CompileRequest(flowGraph=graph, barIndex=0, bpm=120, seed=3))
    return _sequence(res.events)


def test_style_seed_determinism() -> None:
    seq_a1 = _compile(7)
    seq_a2 = _compile(7)
    seq_b = _compile(9)
    assert seq_a1 == seq_a2, "Events should be deterministic for the same styleSeed."
    assert seq_a1 != seq_b, "Changing styleSeed should alter generated events."
