from __future__ import annotations

from mind_api.mind_core.stream_runtime import run_stream_runtime
from mind_api.mind_core.theory import parse_key, resolve_roman_chord
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


def _pitch_classes_to_midi(pitch_classes: list[int], register_min: int, register_max: int) -> list[int]:
    voiced = []
    base = register_min
    for pc in pitch_classes:
        midi = base + ((pc - base) % 12)
        while midi < register_min:
            midi += 12
        while midi > register_max:
            midi -= 12
        voiced.append(midi)
    return voiced


def _compile_bar(graph: FlowGraph, bar_index: int, runtime_state=None):
    req = CompileRequest(flowGraph=graph, barIndex=bar_index, bpm=120, runtimeState=runtime_state)
    res = run_stream_runtime(req)
    return res


def test_single_chord_notes_override_preserved() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "thought",
                "thought",
                params={
                    "durationBars": 1,
                    "chordNotes": "60:64:67",
                    "registerMin": 60,
                    "registerMax": 67,
                    "patternType": "arp-3-up",
                },
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            ),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    res = _compile_bar(graph, 0)
    assert res.events
    allowed = {60, 64, 67}
    for event in res.events:
        for pitch in event.pitches or []:
            assert pitch in allowed


def test_progression_preset_changes_across_bars() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "thought",
                "thought",
                params={
                    "durationBars": 4,
                    "harmonyMode": "progression_preset",
                    "progressionPresetId": "pop_i_v_vi_iv",
                    "progressionVariantId": "triads",
                    "chordsPerBar": "1",
                    "fillBehavior": "repeat",
                    "key": "C major",
                    "patternType": "arp-3-up",
                },
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            ),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    res0 = _compile_bar(graph, 0)
    res1 = _compile_bar(graph, 1, runtime_state=res0.runtimeState)
    pitches0 = {pitch for event in res0.events for pitch in (event.pitches or [])}
    pitches1 = {pitch for event in res1.events for pitch in (event.pitches or [])}
    assert pitches0
    assert pitches1
    assert pitches0 != pitches1


def test_progression_repeat_fill_behavior() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "thought",
                "thought",
                params={
                    "durationBars": 4,
                    "harmonyMode": "progression_custom",
                    "progressionCustom": "I V",
                    "progressionCustomVariantStyle": "triads",
                    "progressionLength": 2,
                    "chordsPerBar": "1",
                    "fillBehavior": "repeat",
                    "key": "C major",
                    "patternType": "arp-3-up",
                },
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            ),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    res0 = _compile_bar(graph, 0)
    res1 = _compile_bar(graph, 1, runtime_state=res0.runtimeState)
    res2 = _compile_bar(graph, 2, runtime_state=res1.runtimeState)
    pitches0 = {pitch for event in res0.events for pitch in (event.pitches or [])}
    pitches2 = {pitch for event in res2.events for pitch in (event.pitches or [])}
    assert pitches0
    assert pitches2
    assert pitches0 == pitches2


def test_chords_per_bar_two_changes_mid_bar() -> None:
    graph = _graph(
        [
            _node("start", "start", ports={"inputs": [], "outputs": [{"id": "out", "type": "flow"}]}),
            _node(
                "thought",
                "thought",
                params={
                    "durationBars": 1,
                    "harmonyMode": "progression_custom",
                    "progressionCustom": "I V",
                    "progressionCustomVariantStyle": "triads",
                    "chordsPerBar": "2",
                    "fillBehavior": "repeat",
                    "key": "C major",
                    "rhythmGrid": "1/4",
                    "registerMin": 60,
                    "registerMax": 72,
                },
                ports={"inputs": [{"id": "in", "type": "flow"}], "outputs": [{"id": "out", "type": "flow"}]},
            ),
        ],
        [_edge("e1", "start", "out", "thought", "in")],
    )
    res = _compile_bar(graph, 0)
    key = parse_key("C major")
    chord_a = _pitch_classes_to_midi(resolve_roman_chord(key, "I", "triads"), 60, 72)
    chord_b = _pitch_classes_to_midi(resolve_roman_chord(key, "V", "triads"), 60, 72)
    early_events = [event for event in res.events if event.tBeat < 2.0]
    late_events = [event for event in res.events if event.tBeat >= 2.0]
    assert early_events
    assert late_events
    for event in early_events:
        for pitch in event.pitches or []:
            assert pitch in chord_a
    for event in late_events:
        for pitch in event.pitches or []:
            assert pitch in chord_b
