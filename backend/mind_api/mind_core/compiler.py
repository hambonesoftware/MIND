"""
Compiler for the MIND language v0.1.
"""

from __future__ import annotations

from typing import Dict, List, Optional, Set

from ..models import CompileRequest, CompileResponse, Event, Diagnostic, NodeInput, RenderSpec
from .post.chain import apply_render_chain
from .solver import solve_equation_bar
from .parser import parse_text
from .notes import parse_notes_spec, parse_sequence_spec


LANE_TO_MIDI_NOTE = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
    "note": 60,
}

MAX_GRAPH_DEPTH = 256


def _intensity_to_velocity(char: str) -> int:
    try:
        value = int(char)
    except ValueError:
        return 0
    return max(1, min(127, 15 + value * 12))


def _is_hit_char(ch: str) -> bool:
    return ch.isdigit()


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


def _hits_by_segment(pat: str, steps_per_bar: int, bar_count: int) -> List[int]:
    return [
        sum(1 for c in pat[i * steps_per_bar : (i + 1) * steps_per_bar] if _is_hit_char(c))
        for i in range(bar_count)
    ]


def _compute_base_hit_index(bar_offset: int, bar_count: int, hits_per_seg: List[int]) -> int:
    if bar_count <= 1:
        return hits_per_seg[0] * bar_offset
    full = bar_offset // bar_count
    rem = bar_offset % bar_count
    return full * sum(hits_per_seg) + sum(hits_per_seg[:rem])


def _compile_theory_node(
    node: NodeInput,
    bar_idx: int,
    bpm: float,
    diagnostics: List[Diagnostic],
    debug_lines: Optional[List[str]] = None,
) -> List[Event]:

    node_text = (node.text or "").strip()
    ast, parse_diags = parse_text(node_text)
    if parse_diags:
        for d in parse_diags:
            diagnostics.append(
                Diagnostic(level=d.level, message=f"Node {node.id}: {d.message}", line=d.line, col=d.col)
            )
        return []

    # --- EQUATION NODES ---
    if getattr(ast, "kind", "beat") == "equation":
        bar_range = ast.bars or "1-16"
        start_bar, end_bar = map(int, bar_range.split("-"))
        if not (start_bar <= bar_idx + 1 <= end_bar):
            return []
        return solve_equation_bar(ast, bar_idx, bpm)

    # --- BEAT NODES ---
    bar_range = ast.bars or "1-16"
    start_bar, end_bar = map(int, bar_range.split("-"))
    if not (start_bar <= bar_idx + 1 <= end_bar):
        return []

    grid = ast.grid or "1/4"
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len_beats = 4.0 / steps_per_bar

    pat_norm = _normalize_pattern(ast.pattern or "")
    if not pat_norm:
        return []

    bar_count = _compute_pattern_bar_count(pat_norm, steps_per_bar)
    bar_offset = (bar_idx + 1) - start_bar
    bar_pat = _slice_bar_segment(pat_norm, steps_per_bar, bar_offset, bar_count)

    # Pre-parse notes chord (if provided)
    chord_pitches: Optional[List[int]] = None
    if ast.notes:
        try:
            chord_pitches = parse_notes_spec(ast.notes)
        except Exception as exc:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Node {node.id}: Invalid notes specification '{ast.notes}': {exc}",
                    line=1,
                    col=1,
                )
            )
            return []

    # Pre-parse sequence (if provided)
    seq_values: List[int] = []
    use_sequence = False
    if ast.sequence:
        try:
            seq_values = parse_sequence_spec(ast.sequence)
            use_sequence = True if seq_values else False
        except Exception as exc:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Node {node.id}: Invalid sequence specification '{ast.sequence}': {exc}",
                    line=1,
                    col=1,
                )
            )
            return []

    base_hit_idx = 0
    if use_sequence:
        hits = _hits_by_segment(pat_norm, steps_per_bar, bar_count)
        base_hit_idx = _compute_base_hit_index(bar_offset, bar_count, hits)

    events: List[Event] = []
    local_hit = 0

    for idx, ch in enumerate(bar_pat):
        if not _is_hit_char(ch):
            continue

        velocity = _intensity_to_velocity(ch)
        tbeat = (idx / steps_per_bar) * 4.0

        if use_sequence:
            pitch = seq_values[(base_hit_idx + local_hit) % len(seq_values)]
            local_hit += 1
            pitches = [pitch]
        elif chord_pitches is not None and len(chord_pitches) > 0:
            pitches = chord_pitches
        else:
            pitches = [LANE_TO_MIDI_NOTE.get(ast.lane, 60)]

        sustain = _count_sustain_steps(bar_pat, idx)
        duration = max(0.05, step_len_beats * (1 + sustain) * 0.95)

        events.append(
            Event(
                tBeat=tbeat,
                lane=ast.lane,
                note=pitches[0],
                pitches=pitches,
                velocity=velocity,
                durationBeats=duration,
                preset=ast.preset,
            )
        )

    return events


def _coerce_render_spec(value: object) -> RenderSpec:
    """
    Defensive: older frontends may send render as a raw dict.
    New models want RenderSpec so apply_render_chain can do render.strum / render.perc.
    """
    if isinstance(value, RenderSpec):
        return value
    if isinstance(value, dict):
        return RenderSpec.model_validate(value)
    return RenderSpec()


def compile_request(req: CompileRequest) -> CompileResponse:
    diagnostics: List[Diagnostic] = []
    events: List[Event] = []

    nodes = {n.id: n for n in req.nodes if n.enabled}
    graph_edges: List[tuple[str, str]] = []
    if req.edges:
        graph_edges = [(edge.from_.nodeId, edge.to.nodeId) for edge in req.edges]
    else:
        graph_edges = [
            (node.id, node.childId)
            for node in nodes.values()
            if node.kind == "render" and node.childId
        ]
    outgoing: Dict[str, List[str]] = {node_id: [] for node_id in nodes}
    incoming: Dict[str, List[str]] = {node_id: [] for node_id in nodes}
    for from_id, to_id in graph_edges:
        if from_id not in nodes:
            diagnostics.append(Diagnostic(level="error", message=f"Edge references missing node '{from_id}'", line=1, col=1))
            continue
        if to_id not in nodes:
            diagnostics.append(Diagnostic(level="error", message=f"Edge references missing node '{to_id}'", line=1, col=1))
            continue
        outgoing[from_id].append(to_id)
        incoming[to_id].append(from_id)

    def add_type_mismatch(message: str) -> None:
        diagnostics.append(Diagnostic(level="error", message=message, line=1, col=1))

    for from_id, to_ids in outgoing.items():
        node = nodes[from_id]
        if node.kind == "theory" and to_ids:
            add_type_mismatch(f"Theory node '{from_id}' cannot have child edges.")
        if node.kind == "render" and len(to_ids) > 1:
            add_type_mismatch(f"Render node '{from_id}' has multiple child edges.")
        for to_id in to_ids:
            target = nodes.get(to_id)
            if target and target.kind == "start":
                add_type_mismatch(f"Start node '{to_id}' cannot accept incoming edges.")

    for node_id, node in nodes.items():
        if node.kind == "render" and not outgoing.get(node_id):
            diagnostics.append(Diagnostic(level="error", message=f"Render node '{node_id}' is missing a child edge.", line=1, col=1))

    entry_nodes: List[str] = []
    if req.startNodeIds:
        for node_id in req.startNodeIds:
            if node_id not in nodes:
                diagnostics.append(
                    Diagnostic(level="error", message=f"Start node '{node_id}' is missing from graph.", line=1, col=1)
                )
                continue
            entry_nodes.append(node_id)
    else:
        entry_nodes = [node_id for node_id, node in nodes.items() if node.kind == "start"]
        if not entry_nodes:
            entry_nodes = [node_id for node_id in nodes if not incoming.get(node_id)]

    compiled: Dict[str, List[Event]] = {}
    visiting: Set[str] = set()

    def compile_node(node_id: str, depth: int = 0) -> List[Event]:
        if node_id in compiled:
            return compiled[node_id]
        if depth > MAX_GRAPH_DEPTH:
            diagnostics.append(
                Diagnostic(level="error", message=f"Loop guard tripped at '{node_id}' (depth {depth}).", line=1, col=1)
            )
            return []
        if node_id in visiting:
            diagnostics.append(Diagnostic(level="error", message=f"Cycle detected at {node_id}", line=1, col=1))
            return []

        if node_id not in nodes:
            diagnostics.append(Diagnostic(level="error", message=f"Missing node '{node_id}'", line=1, col=1))
            return []

        visiting.add(node_id)
        node = nodes[node_id]
        children = outgoing.get(node_id, [])

        if node.kind == "start":
            aggregated: List[Event] = []
            for child_id in children:
                aggregated.extend(compile_node(child_id, depth + 1))
            compiled[node_id] = aggregated
        elif node.kind == "render":
            child_id = children[0] if children else None
            if not child_id:
                diagnostics.append(
                    Diagnostic(level="error", message=f"Render node '{node.id}' is missing a child edge.", line=1, col=1)
                )
                compiled[node_id] = []
            else:
                child = compile_node(child_id, depth + 1)
                render_spec = _coerce_render_spec(node.render)
                compiled[node_id] = apply_render_chain(child, render_spec, req)
        else:
            compiled[node_id] = _compile_theory_node(node, req.barIndex, req.bpm, diagnostics)

        visiting.remove(node_id)
        return compiled[node_id]

    for node_id in entry_nodes:
        events.extend(compile_node(node_id))

    events.sort(key=lambda e: (e.tBeat, e.lane))
    return CompileResponse(
        ok=not any(d.level == "error" for d in diagnostics),
        diagnostics=diagnostics,
        barIndex=req.barIndex,
        loopBars=16,
        events=events,
    )
