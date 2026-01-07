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


def _compile(note_pattern_id: str):
    params = {
        "durationBars": 1,
        "harmonyMode": "single",
        "chordRoot": "C2",
        "chordQuality": "major",
        "registerMin": 36,
        "registerMax": 64,
        "rhythmGrid": "1/8",
        "patternType": "arp-3-up",
        "notePatternId": note_pattern_id,
    }
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought", "thought", params=params, ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []}),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    res = run_stream_runtime(CompileRequest(flowGraph=graph, barIndex=0, bpm=110, seed=5))
    return _sequence(res.events)


def test_note_pattern_variants_sound_distinct() -> None:
    sequences = {
        "alberti_bass": _compile("alberti_bass"),
        "walking_bass_simple": _compile("walking_bass_simple"),
        "gate_mask": _compile("gate_mask"),
    }
    for pattern_id, seq in sequences.items():
        assert seq, f"{pattern_id} should generate events."
    unique_sequences = {tuple(seq) for seq in sequences.values()}
    assert len(unique_sequences) == len(sequences), "notePatternId generators should produce distinct sequences."
