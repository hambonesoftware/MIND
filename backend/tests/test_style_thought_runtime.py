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


def test_progression_presets_resolve_from_frontend_catalog() -> None:
    params = {
        "durationBars": 4,
        "harmonyMode": "progression_preset",
        "progressionPresetId": "classical_noble_cadence",
        "progressionCustom": "I V vi IV",
        "progressionVariantId": "triads",
        "progressionLength": "preset",
        "rhythmGrid": "1/4",
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
    bar_roots: dict[int, set[int]] = {}
    runtime_state = None
    for bar_index in range(4):
        res = run_stream_runtime(
            CompileRequest(flowGraph=graph, barIndex=bar_index, bpm=120, seed=2, runtimeState=runtime_state)
        )
        for event in res.events:
            if event.lane != "note":
                continue
            bar_roots.setdefault(bar_index, set()).update(event.pitches)
        runtime_state = res.runtimeState
    unique_roots = {min(pitches) for pitches in bar_roots.values() if pitches}
    assert len(unique_roots) > 1, "Backend progression presets do not include harmonyCatalog IDs."


def test_note_pattern_id_routes_to_distinct_generators() -> None:
    base_params = {
        "durationBars": 1,
        "harmonyMode": "single",
        "chordRoot": "C2",
        "chordQuality": "major",
        "registerMin": 36,
        "registerMax": 64,
        "rhythmGrid": "1/8",
    }
    walking_params = {**base_params, "notePatternId": "walking_bass", "patternType": "arp-3-down"}
    alberti_params = {**base_params, "notePatternId": "alberti_bass", "patternType": "arp-3-up"}

    def _compile(thought_params):
        graph = _graph(
            [
                _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
                _node("thought", "thought", params=thought_params,
                      ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []}),
            ],
            [_edge("e1", "start", "out", "thought", "in")],
        )
        res = run_stream_runtime(CompileRequest(flowGraph=graph, barIndex=0, bpm=110, seed=5))
        return _sequence(res.events)

    walking_seq = _compile(walking_params)
    alberti_seq = _compile(alberti_params)
    assert walking_seq != alberti_seq, "notePatternId is not honored by backend; patterns collapse to arpeggios."


def test_style_seed_controls_deterministic_output() -> None:
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
    }
    graph_a = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought", "thought", params={**params, "styleSeed": 7},
                  ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []}),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    graph_b = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node("thought", "thought", params={**params, "styleSeed": 9},
                  ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": []}),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )

    res_a1 = run_stream_runtime(CompileRequest(flowGraph=graph_a, barIndex=0, bpm=120, seed=3))
    res_a2 = run_stream_runtime(CompileRequest(flowGraph=graph_a, barIndex=0, bpm=120, seed=3))
    res_b = run_stream_runtime(CompileRequest(flowGraph=graph_b, barIndex=0, bpm=120, seed=3))

    seq_a1 = _sequence(res_a1.events)
    seq_a2 = _sequence(res_a2.events)
    seq_b = _sequence(res_b.events)

    assert seq_a1 == seq_a2, "Events should be deterministic for the same styleSeed."
    assert seq_a1 != seq_b, "Changing styleSeed should alter generated events."
