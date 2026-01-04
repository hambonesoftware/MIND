"""
Token-based stream runtime for V9 flow graphs.
"""

from __future__ import annotations

from typing import Dict, Iterable, List, Optional

from ..models import (
    CompileRequest,
    CompileResponse,
    Diagnostic,
    Event,
    FlowGraph,
    FlowGraphEdge,
    FlowGraphNode,
    StreamRuntimeState,
    StreamRuntimeToken,
    StreamRuntimeThoughtState,
)
from .music_elements.harmony_plan import HarmonyPlan, HarmonyStep
from .music_elements.phrase_plan import PhrasePlan
from .music_elements.texture_engine import generate_events
from .music_elements.texture_recipe import TextureRecipe
from .notes import note_name_to_midi, parse_notes_spec
from .progression_presets import get_progression_preset
from .theory import parse_key, resolve_roman_chord


LANE_TO_MIDI_NOTE = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
    "note": 60,
}

ALLOWED_GRIDS = {"1/4", "1/8", "1/12", "1/16", "1/24"}

MAX_NODE_FIRINGS_PER_BAR = 256
MAX_TOKENS_PER_BAR = 512


def _coerce_number(value: object, fallback: int = 0) -> int:
    if isinstance(value, bool):
        return int(value)
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback


def _compare(op: str, left: int, right: int) -> bool:
    return {
        "==": left == right,
        "!=": left != right,
        ">": left > right,
        ">=": left >= right,
        "<": left < right,
        "<=": left <= right,
    }.get(op, False)


def _seeded_random(seed: int, salt: int) -> float:
    value = (seed * 9301 + 49297 + salt * 233) % 233280
    return value / 233280.0


def _is_hit_char(ch: str) -> bool:
    return ch.isdigit()


def _intensity_to_velocity(char: str) -> int:
    try:
        value = int(char)
    except ValueError:
        return 0
    return max(1, min(127, 15 + value * 12))


def _count_sustain_steps(bar_pat: str, start_idx: int) -> int:
    n = 0
    j = start_idx + 1
    while j < len(bar_pat) and bar_pat[j] == "-":
        n += 1
        j += 1
    return n


def _normalize_pattern(raw_pat: str) -> str:
    return "".join(c for c in raw_pat if c not in {" ", "|"})


def _steps_per_bar_for_grid(grid: str) -> int:
    return {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,
        "1/16": 16,
        "1/24": 24,
    }.get(grid, 4)


def _normalize_note_name(value: str, default_octave: int = 4) -> str:
    value = (value or "").strip()
    if not value:
        return ""
    if any(ch.isdigit() for ch in value):
        return value
    return f"{value}{default_octave}"


def _build_chord_pitches(params: dict) -> List[int]:
    notes_spec = (params.get("chordNotes") or "").strip()
    if notes_spec:
        try:
            return parse_notes_spec(notes_spec)
        except Exception:
            return []
    root = _normalize_note_name(params.get("chordRoot") or "C")
    if not root:
        root = "C4"
    try:
        root_midi = note_name_to_midi(root)
    except Exception:
        root_midi = 60
    quality = (params.get("chordQuality") or "major").lower()
    intervals = {
        "major": [0, 4, 7],
        "minor": [0, 3, 7],
        "diminished": [0, 3, 6],
        "augmented": [0, 4, 8],
    }.get(quality, [0, 4, 7])
    return [root_midi + interval for interval in intervals]


def _normalize_harmony_mode(params: dict) -> str:
    return (params.get("harmonyMode") or "single").strip().lower()


def _coerce_chords_per_bar(value: str | None) -> float:
    if value == "2":
        return 2.0
    if value == "0.5":
        return 0.5
    return 1.0


def _parse_roman_sequence(raw: str | None) -> List[str]:
    if not raw:
        return []
    tokens = [tok.strip() for tok in str(raw).replace(",", " ").split() if tok.strip()]
    return tokens


def _resolve_progression_length(
    params: dict,
    *,
    preset_length: int | None,
    romans: List[str],
) -> int:
    raw = params.get("progressionLength", "preset")
    if raw == "preset" or raw is None:
        return preset_length or max(1, len(romans) or 1)
    try:
        numeric = int(raw)
    except (TypeError, ValueError):
        return preset_length or max(1, len(romans) or 1)
    return max(1, numeric)


def _pitch_classes_to_midi(pitch_classes: List[int], register_min: int, register_max: int) -> List[int]:
    if not pitch_classes:
        return []
    if register_min > register_max:
        register_min, register_max = register_max, register_min
    base = register_min
    voiced: List[int] = []
    for pc in pitch_classes:
        midi = base + ((pc - base) % 12)
        while midi < register_min:
            midi += 12
        while midi > register_max:
            midi -= 12
        voiced.append(max(0, min(127, midi)))
    return voiced


def _resolve_progression_harmony(params: dict, duration_bars: int, grid: str) -> HarmonyPlan:
    chords_per_bar = _coerce_chords_per_bar(params.get("chordsPerBar"))
    fill_behavior = params.get("fillBehavior") or "repeat"
    harmony_mode = _normalize_harmony_mode(params)
    romans: List[str] = []
    preset_length: int | None = None
    variant_style = "triads"

    if harmony_mode == "progression_preset":
        preset = get_progression_preset(params.get("progressionPresetId"))
        if preset:
            romans = preset.romans
            preset_length = preset.default_length
            variant_style = params.get("progressionVariantId") or "triads"
    elif harmony_mode == "progression_custom":
        romans = _parse_roman_sequence(params.get("progressionCustom"))
        variant_style = params.get("progressionCustomVariantStyle") or "triads"

    if not romans:
        chord = _build_chord_pitches(params)
        return HarmonyPlan.from_chords([chord] * duration_bars, steps_per_bar=_steps_per_bar_for_grid(grid))

    progression_length = _resolve_progression_length(
        params,
        preset_length=preset_length,
        romans=romans,
    )
    slots_per_progression = max(1, int((progression_length * chords_per_bar) + 0.999))
    total_slots = max(1, int((duration_bars * chords_per_bar) + 0.999))

    slot_romans: List[str] = []
    for slot in range(slots_per_progression):
        slot_romans.append(romans[slot % len(romans)])

    try:
        key = parse_key(params.get("key") or "C major")
    except Exception:
        key = parse_key("C major")

    register_min = _coerce_number(params.get("registerMin"), 48)
    register_max = _coerce_number(params.get("registerMax"), 84)

    slot_chords: List[List[int]] = []
    for slot_index in range(total_slots):
        roman = None
        if slot_index < slots_per_progression:
            roman = slot_romans[slot_index]
        elif fill_behavior == "repeat":
            roman = slot_romans[slot_index % slots_per_progression]
        elif fill_behavior == "hold_last":
            roman = slot_romans[-1]
        elif fill_behavior == "rest":
            roman = None
        if not roman:
            slot_chords.append([])
            continue
        pcs = resolve_roman_chord(key, roman, variant_style)
        chord = _pitch_classes_to_midi(pcs, register_min, register_max)
        slot_chords.append(_apply_register(chord, register_min=register_min, register_max=register_max))

    steps_per_bar = _steps_per_bar_for_grid(grid)
    if chords_per_bar == 2.0:
        steps: List[HarmonyStep] = []
        half_step = max(1, steps_per_bar // 2)
        for bar_index in range(duration_bars):
            first = slot_chords[bar_index * 2] if (bar_index * 2) < len(slot_chords) else []
            second = slot_chords[bar_index * 2 + 1] if (bar_index * 2 + 1) < len(slot_chords) else []
            steps.append(HarmonyStep(bar_index=bar_index, step=0, chord=first, pedal=False))
            steps.append(HarmonyStep(bar_index=bar_index, step=half_step, chord=second, pedal=False))
        return HarmonyPlan(steps_per_bar=steps_per_bar, steps=steps)

    chords_by_bar: List[List[int]] = []
    for bar_index in range(duration_bars):
        if chords_per_bar == 0.5:
            slot_index = bar_index // 2
        else:
            slot_index = bar_index
        chord = slot_chords[slot_index] if slot_index < len(slot_chords) else []
        chords_by_bar.append(chord)
    return HarmonyPlan.from_chords(chords_by_bar, steps_per_bar=steps_per_bar)


def _apply_register(pitches: List[int], *, register_min: int, register_max: int) -> List[int]:
    if not pitches:
        return []
    adjusted: List[int] = []
    for pitch in pitches:
        value = pitch
        while value < register_min:
            value += 12
        while value > register_max:
            value -= 12
        adjusted.append(max(0, min(127, value)))
    return adjusted


def _apply_timing_adjustments(
    events: List[Event],
    *,
    grid: str,
    syncopation: str,
    timing_warp: str,
    intensity: float,
) -> List[Event]:
    if not events:
        return events
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len = 4.0 / steps_per_bar
    intensity = max(0.0, min(1.0, float(intensity or 0)))
    for event in events:
        step = int(round(event.tBeat / step_len)) if step_len > 0 else 0
        tbeat = step * step_len
        if syncopation == "offbeat":
            tbeat += step_len * 0.5
        elif syncopation == "anticipation":
            tbeat -= step_len * 0.33
        if timing_warp in {"swing", "shuffle"} and step % 2 == 1:
            warp = step_len * (0.5 if timing_warp == "swing" else 0.75)
            tbeat += warp * intensity
        event.tBeat = max(0.0, min(4.0, tbeat))
    return events


def _parse_custom_notes(raw: object) -> List[int]:
    tokens: List[str] = []
    if raw is None:
        return tokens
    if isinstance(raw, str):
        tokens = [tok for tok in raw.split() if tok]
    elif isinstance(raw, list):
        tokens = [str(tok) for tok in raw if tok is not None]
    values: List[int] = []
    for tok in tokens:
        try:
            values.append(int(tok))
            continue
        except (TypeError, ValueError):
            pass
        try:
            values.append(note_name_to_midi(tok))
            continue
        except Exception:
            # Ignore invalid tokens
            continue
    return values


def _compile_custom_melody_bar(
    node: FlowGraphNode,
    *,
    bar_offset: int,
    diagnostics: List[Diagnostic],
) -> List[Event]:
    params = node.params or {}
    custom = params.get("customMelody") or {}
    grid = str(custom.get("grid") or params.get("rhythmGrid") or "1/16")
    steps_per_bar = _steps_per_bar_for_grid(grid)
    if steps_per_bar <= 0:
        diagnostics.append(
            Diagnostic(level="error", message=f"Thought '{node.id}': invalid custom grid '{grid}'", line=1, col=1)
        )
        return []

    bars = custom.get("bars") or []
    if not isinstance(bars, list) or not bars:
        diagnostics.append(
            Diagnostic(level="warn", message=f"Thought '{node.id}': missing custom melody bars; skipping.", line=1, col=1)
        )
        return []

    entry = bars[bar_offset % len(bars)] if bars else {}
    rhythm = str(entry.get("rhythm") or "")
    if not rhythm:
        diagnostics.append(
            Diagnostic(level="warn", message=f"Thought '{node.id}': empty rhythm for custom melody; skipping.", line=1, col=1)
        )
        return []

    notes = _parse_custom_notes(entry.get("notes"))
    note_index = 0
    step_len = 4.0 / steps_per_bar
    events: List[Event] = []

    for idx, ch in enumerate(rhythm):
        if ch in {".", "-"}:
            continue

        hold_steps = 0
        j = idx + 1
        while j < len(rhythm) and rhythm[j] == "-":
            hold_steps += 1
            j += 1

        duration_beats = (1 + hold_steps) * step_len
        tbeat = idx * step_len

        if note_index >= len(notes):
            diagnostics.append(
                Diagnostic(
                    level="warn",
                    message=f"Thought '{node.id}': insufficient notes for custom melody; truncating.",
                    line=1,
                    col=1,
                )
            )
            break

        pitches = [notes[note_index]]
        note_index += 1

        events.append(
            Event(
                tBeat=tbeat,
                lane="note",
                note=pitches[0],
                pitches=pitches,
                velocity=_intensity_to_velocity(ch) if ch and ch.isdigit() else 96,
                durationBeats=duration_beats,
            )
        )

    return events


def _compute_pattern_bar_count(pat: str, steps_per_bar: int) -> int:
    if len(pat) <= steps_per_bar:
        return 1
    if len(pat) % steps_per_bar != 0:
        return 1
    return min(16, len(pat) // steps_per_bar)


def _slice_bar_segment(pat: str, steps_per_bar: int, bar_offset: int, bar_count: int) -> str:
    if bar_count <= 1:
        if len(pat) < steps_per_bar:
            times = (steps_per_bar + len(pat) - 1) // len(pat)
            return (pat * times)[:steps_per_bar]
        return pat[:steps_per_bar]

    idx = bar_offset % bar_count
    return pat[idx * steps_per_bar : (idx + 1) * steps_per_bar]


def _compile_thought_bar(
    node: FlowGraphNode,
    bar_offset: int,
    bpm: float,
    diagnostics: List[Diagnostic],
    seed: int,
) -> List[Event]:
    params = node.params or {}
    melody_mode = (params.get("melodyMode") or "generated").lower()
    if melody_mode == "custom":
        events = _compile_custom_melody_bar(node, bar_offset=bar_offset, diagnostics=diagnostics)
        for event in events:
            event.sourceNodeId = node.id
            event.preset = params.get("instrumentPreset") or None
        return events

    grid = str(params.get("rhythmGrid") or "1/12")
    if grid not in ALLOWED_GRIDS:
        diagnostics.append(
            Diagnostic(level="error", message=f"Thought '{node.id}': invalid grid '{grid}'", line=1, col=1)
        )
        return []

    duration_bars = max(1, _coerce_number(params.get("durationBars"), 1))
    register_min = _coerce_number(params.get("registerMin"), 48)
    register_max = _coerce_number(params.get("registerMax"), 84)

    pattern_type = params.get("patternType") or "arp-3-up"
    pattern_family = {
        "arp-3-up": ("low-mid-high",),
        "arp-3-down": ("high-mid-low",),
        "arp-3-skip": ("low-high-mid",),
    }.get(pattern_type, ("low-mid-high",))

    if _normalize_harmony_mode(params) == "single":
        chord = _build_chord_pitches(params)
        chord = _apply_register(chord, register_min=register_min, register_max=register_max)
        harmony = HarmonyPlan.from_chords([chord] * duration_bars, steps_per_bar=_steps_per_bar_for_grid(grid))
    else:
        harmony = _resolve_progression_harmony(params, duration_bars, grid)
    texture = TextureRecipe(pattern_family=pattern_family, sustain_policy="hold_until_change")
    phrase = PhrasePlan(density_curve=(1.0,))
    generated = generate_events(
        harmony,
        texture,
        phrase,
        bars=duration_bars,
        grid=grid,
        seed=seed,
        piece_id=node.id,
    )

    bar_start = bar_offset * 4.0
    bar_end = (bar_offset + 1) * 4.0
    events: List[Event] = []
    for event in generated:
        if bar_start <= event.tBeat < bar_end:
            adjusted = Event.model_validate(event.model_dump())
            adjusted.tBeat = event.tBeat - bar_start
            events.append(adjusted)

    syncopation = params.get("syncopation") or "none"
    timing_warp = params.get("timingWarp") or "none"
    intensity = params.get("timingIntensity") or 0
    events = _apply_timing_adjustments(
        events,
        grid=grid,
        syncopation=syncopation,
        timing_warp=timing_warp,
        intensity=float(intensity or 0),
    )

    lane = str(params.get("lane") or "note")
    preset = params.get("instrumentPreset") or None
    for event in events:
        event.lane = lane
        event.preset = preset
        event.sourceNodeId = node.id
    return events


def _thought_total_bars(node: FlowGraphNode) -> int:
    params = node.params or {}
    return max(1, _coerce_number(params.get("durationBars"), 1))


def _build_edge_index(edges: Iterable[FlowGraphEdge]) -> Dict[str, FlowGraphEdge]:
    return {edge.id: edge for edge in edges}


def _build_adjacency(graph: FlowGraph) -> tuple[Dict[str, List[FlowGraphEdge]], Dict[str, List[FlowGraphEdge]]]:
    outgoing: Dict[str, List[FlowGraphEdge]] = {}
    incoming: Dict[str, List[FlowGraphEdge]] = {}
    for edge in graph.edges:
        from_id = edge.from_.nodeId
        to_id = edge.to.nodeId
        outgoing.setdefault(from_id, []).append(edge)
        incoming.setdefault(to_id, []).append(edge)
    return outgoing, incoming


def _token_from_edge(edge: FlowGraphEdge, *, start_id: Optional[str] = None) -> StreamRuntimeToken:
    return StreamRuntimeToken(nodeId=edge.to.nodeId, viaEdgeId=edge.id, viaPortId=edge.to.portId, startId=start_id)


def _required_join_inputs(node: FlowGraphNode, incoming: List[FlowGraphEdge]) -> List[str]:
    if node.ports and node.ports.inputs:
        return [port.id for port in node.ports.inputs if port.id]
    port_ids = [edge.to.portId for edge in incoming if edge.to.portId]
    return list(dict.fromkeys(port_ids))


def _evaluate_switch(
    node: FlowGraphNode,
    outgoing: List[FlowGraphEdge],
    state: StreamRuntimeState,
    req: CompileRequest,
) -> tuple[List[FlowGraphEdge], List[str]]:
    params = node.params or {}
    branches = params.get("branches") or []
    mode = params.get("mode") or "first"
    default_branch = str(params.get("defaultBranch") or "default")
    manual_selection = str(params.get("manualSelection") or "")
    matched_edges: List[FlowGraphEdge] = []
    matched_labels: List[str] = []

    for branch in branches:
        branch_id = str(branch.get("id") or "")
        condition = branch.get("condition") or {"type": "always", "value": True}
        ctype = condition.get("type") or "always"
        ok = False
        if ctype == "always":
            ok = condition.get("value", True) is not False
        elif ctype == "manual":
            ok = manual_selection and manual_selection == str(condition.get("value") or "")
        elif ctype == "counter":
            counter_id = str(condition.get("counterId") or "")
            current = state.counters.get(counter_id, 0)
            op = condition.get("op") or ">="
            value = _coerce_number(condition.get("value"), 0)
            ok = _compare(op, current, value)
        elif ctype == "barIndex":
            op = condition.get("op") or ">="
            value = _coerce_number(condition.get("value"), 0)
            ok = _compare(op, req.barIndex, value)
        elif ctype == "random":
            threshold = condition.get("threshold")
            if threshold is None:
                threshold = condition.get("value")
            try:
                threshold_value = float(threshold)
            except (TypeError, ValueError):
                threshold_value = 0.5
            salt = sum(ord(ch) for ch in node.id + branch_id)
            ok = _seeded_random(req.seed, salt + req.barIndex) < threshold_value

        if ok:
            edges = [edge for edge in outgoing if edge.from_.portId == branch_id]
            matched_edges.extend(edges)
            matched_labels.append(branch_id)
            if mode != "all":
                return matched_edges, matched_labels

    default_edges = [edge for edge in outgoing if edge.from_.portId == default_branch]
    if default_edges:
        return default_edges, [default_branch]
    if outgoing:
        fallback = outgoing[0]
        return [fallback], [fallback.from_.portId or default_branch]
    return [], [default_branch]


def run_stream_runtime(req: CompileRequest) -> CompileResponse:
    diagnostics: List[Diagnostic] = []
    events: List[Event] = []
    debug_trace: List[str] = []

    if not req.flowGraph:
        diagnostics.append(Diagnostic(level="error", message="Missing flowGraph for V9 runtime.", line=1, col=1))
        return CompileResponse(
            ok=False,
            diagnostics=diagnostics,
            barIndex=req.barIndex,
            loopBars=16,
            events=[],
            debugTrace=debug_trace,
            runtimeState=req.runtimeState,
        )

    graph = req.flowGraph
    nodes_by_id = {node.id: node for node in graph.nodes}
    outgoing, incoming = _build_adjacency(graph)
    edge_index = _build_edge_index(graph.edges)
    start_edges_by_id: Dict[str, List[FlowGraphEdge]] = {
        node.id: outgoing.get(node.id, []) for node in nodes_by_id.values() if node.type == "start"
    }

    state = req.runtimeState or StreamRuntimeState()
    next_state = StreamRuntimeState(
        barIndex=req.barIndex,
        activeTokens=[],
        activeThoughts={},
        startQueues={key: list(value) for key, value in state.startQueues.items()},
        startEdgePositions=dict(state.startEdgePositions),
        startActiveChains=dict(state.startActiveChains),
        counters=dict(state.counters),
        joins={key: list(value) for key, value in state.joins.items()},
        lastSwitchRoutes=dict(state.lastSwitchRoutes),
        started=state.started,
    )
    for start_id in start_edges_by_id:
        next_state.startActiveChains.setdefault(start_id, 0)
        next_state.startEdgePositions.setdefault(start_id, 0)
        next_state.startQueues.setdefault(start_id, [])

    current_tokens = list(state.activeTokens)
    next_bar_tokens: List[StreamRuntimeToken] = []

    if not state.started:
        next_state.counters = {}
        next_state.joins = {}
        next_state.lastSwitchRoutes = {}
        next_state.activeThoughts = {}
        next_state.startQueues = {}
        next_state.startEdgePositions = {}
        next_state.startActiveChains = {}
        for node in nodes_by_id.values():
            if node.type == "counter" and node.params.get("resetOnPlay") is False:
                if node.id in state.counters:
                    next_state.counters[node.id] = state.counters[node.id]
        start_filter = set(req.startNodeIds or [])
        for node in nodes_by_id.values():
            if node.type != "start":
                continue
            if start_filter and node.id not in start_filter:
                continue
            outgoing_edges = start_edges_by_id.get(node.id, [])
            if outgoing_edges:
                next_state.startQueues[node.id] = [outgoing_edges[0].id]
                next_state.startEdgePositions[node.id] = 1
            else:
                next_state.startQueues[node.id] = []
                next_state.startEdgePositions[node.id] = 0
            next_state.startActiveChains[node.id] = 0
            current_tokens.append(StreamRuntimeToken(nodeId=node.id))
        next_state.started = True
        debug_trace.append("Start: emitted initial tokens.")

    node_firings = 0
    tokens_created = 0

    def _increment_start_chain(start_id: Optional[str], delta: int) -> None:
        if not start_id:
            return
        current = next_state.startActiveChains.get(start_id, 0)
        updated = current + delta
        if updated < 0:
            updated = 0
        next_state.startActiveChains[start_id] = updated
        if updated == 0:
            _queue_next_start_edge(start_id)

    def _queue_next_start_edge(start_id: str) -> None:
        edges = start_edges_by_id.get(start_id, [])
        pos = next_state.startEdgePositions.get(start_id, 0)
        if pos >= len(edges):
            return
        next_edge = edges[pos]
        next_state.startEdgePositions[start_id] = pos + 1
        enqueue_deferred([next_edge], start_id=start_id)
        debug_trace.append(f"Start {start_id}: queued next edge {next_edge.id} after completion.")

    def enqueue_immediate(edges: List[FlowGraphEdge], *, start_id: Optional[str]) -> None:
        nonlocal tokens_created
        for edge in edges:
            queue.append(_token_from_edge(edge, start_id=start_id))
            _increment_start_chain(start_id, 1)
        tokens_created += len(edges)

    def enqueue_deferred(edges: List[FlowGraphEdge], *, start_id: Optional[str]) -> None:
        nonlocal tokens_created
        for edge in edges:
            next_bar_tokens.append(_token_from_edge(edge, start_id=start_id))
            _increment_start_chain(start_id, 1)
        tokens_created += len(edges)

    def process_token(token: StreamRuntimeToken) -> None:
        nonlocal node_firings, tokens_created
        if node_firings >= MAX_NODE_FIRINGS_PER_BAR or tokens_created >= MAX_TOKENS_PER_BAR:
            diagnostics.append(
                Diagnostic(
                    level="warn",
                    message="Safety cap reached; runtime halted for this bar.",
                    line=1,
                    col=1,
                )
            )
            return
        node = nodes_by_id.get(token.nodeId)
        if not node:
            diagnostics.append(
                Diagnostic(level="warn", message=f"Token references missing node '{token.nodeId}'.", line=1, col=1)
            )
            return

        node_firings += 1

        if node.type == "thought":
            if node.id in activated_thoughts:
                debug_trace.append(f"Thought {node.id}: already active, ignoring extra token.")
                _increment_start_chain(token.startId, -1)
                return
            total_bars = max(1, _thought_total_bars(node))
            events.extend(_compile_thought_bar(node, 0, req.bpm, diagnostics, req.seed))
            if total_bars <= 1:
                edges = outgoing.get(node.id, [])
                enqueue_deferred(edges, start_id=token.startId)
                debug_trace.append(f"Thought {node.id}: single-bar, emitted {len(edges)} tokens.")
            else:
                next_state.activeThoughts[node.id] = StreamRuntimeThoughtState(
                    remainingBars=total_bars - 1,
                    barOffset=1,
                    viaEdgeId=token.viaEdgeId,
                    startId=token.startId,
                )
                _increment_start_chain(token.startId, 1)
                debug_trace.append(f"Thought {node.id}: started ({total_bars} bars).")
            activated_thoughts.add(node.id)
            _increment_start_chain(token.startId, -1)
            return

        if node.type == "start":
            queue_edges = list(next_state.startQueues.get(node.id, []))
            if not queue_edges:
                debug_trace.append(f"Start {node.id}: no queued edges.")
                return
            next_edge_id = queue_edges.pop(0)
            next_edge = edge_index.get(next_edge_id)
            if next_edge:
                enqueue_immediate([next_edge], start_id=node.id)
                debug_trace.append(f"Start {node.id}: emitted edge {next_edge_id}.")
            next_state.startQueues[node.id] = queue_edges
            return

        if node.type == "counter":
            params = node.params or {}
            start_value = _coerce_number(params.get("start"), 0)
            step = _coerce_number(params.get("step"), 1)
            current = next_state.counters.get(node.id, start_value)
            current += step
            next_state.counters[node.id] = current
            edges = outgoing.get(node.id, [])
            enqueue_immediate(edges, start_id=token.startId)
            debug_trace.append(f"Counter {node.id}: value {current}, emitted {len(edges)} tokens.")
            _increment_start_chain(token.startId, -1)
            return

        if node.type == "switch":
            edges, branches = _evaluate_switch(node, outgoing.get(node.id, []), next_state, req)
            if not edges:
                diagnostics.append(
                    Diagnostic(
                        level="warn",
                        message=f"Switch '{node.id}' has no matching branch and no default edge.",
                        line=1,
                        col=1,
                    )
                )
            enqueue_immediate(edges, start_id=token.startId)
            if branches:
                next_state.lastSwitchRoutes[node.id] = branches[-1]
            debug_trace.append(f"Switch {node.id}: branch {', '.join(branches)}, emitted {len(edges)} tokens.")
            _increment_start_chain(token.startId, -1)
            return

        if node.type == "join":
            required_inputs = _required_join_inputs(node, incoming.get(node.id, []))
            arrived = set(next_state.joins.get(node.id, []))
            if token.viaPortId:
                arrived.add(token.viaPortId)
            if required_inputs and all(req_id in arrived for req_id in required_inputs):
                edges = outgoing.get(node.id, [])
                enqueue_immediate(edges, start_id=token.startId)
                next_state.joins[node.id] = []
                debug_trace.append(f"Join {node.id}: released, emitted {len(edges)} tokens.")
            else:
                next_state.joins[node.id] = list(arrived)
                debug_trace.append(
                    f"Join {node.id}: waiting ({len(arrived)}/{len(required_inputs)}) [{', '.join(sorted(arrived))}]."
                )
            _increment_start_chain(token.startId, -1)
            return

        debug_trace.append(f"Node {node.id}: unsupported type '{node.type}'.")
        _increment_start_chain(token.startId, -1)

    activated_thoughts = set()

    for node_id, thought_state in state.activeThoughts.items():
        node = nodes_by_id.get(node_id)
        if not node or node.type != "thought":
            continue
        events.extend(_compile_thought_bar(node, thought_state.barOffset, req.bpm, diagnostics, req.seed))
        activated_thoughts.add(node_id)
        remaining = thought_state.remainingBars - 1
        next_offset = thought_state.barOffset + 1
        if remaining <= 0:
            edges = outgoing.get(node_id, [])
            enqueue_deferred(edges, start_id=thought_state.startId)
            _increment_start_chain(thought_state.startId, -1)
            debug_trace.append(f"Thought {node_id}: completed, emitted {len(edges)} tokens.")
        else:
            next_state.activeThoughts[node_id] = StreamRuntimeThoughtState(
                remainingBars=remaining,
                barOffset=next_offset,
                viaEdgeId=thought_state.viaEdgeId,
                startId=thought_state.startId,
            )

    queue = list(current_tokens)
    for token in queue:
        process_token(token)

    next_state.activeTokens = next_bar_tokens
    for node in nodes_by_id.values():
        if node.type == "join" and node.id not in next_state.joins:
            next_state.joins[node.id] = []

    ok = not any(d.level == "error" for d in diagnostics)
    return CompileResponse(
        ok=ok,
        diagnostics=diagnostics,
        barIndex=req.barIndex,
        loopBars=16,
        events=events,
        debugTrace=debug_trace,
        runtimeState=next_state,
    )
