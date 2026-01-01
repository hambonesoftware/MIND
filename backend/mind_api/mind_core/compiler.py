"""
Compiler for the MIND language v0.1.

Given a deterministic seed, bar index and a list of latched nodes, the
compiler produces a list of events for the current bar. Each node
script is parsed and, if the bar falls within the node's active bar
range, its pattern is expanded into discrete step events. The result
is sorted by ``tBeat``.

Pattern rules (v0.4.5+):
- '.' = rest
- '0'..'9' = hit / note-on token (intensity -> velocity)
- '-' = sustain/tie marker (extends the previous hit by one grid step)
- spaces and '|' are ignored for readability

Multi-bar pattern support (v0.4.6+):
- A pattern MAY represent multiple bars when, after removing spaces and '|',
  its length is an exact multiple of steps_per_bar and <= 16 bars.
- The compiler slices out the current bar's segment based on (current_bar - start_bar)
  so bar 1 of the node uses segment 0.

Triplet-friendly grids (v0.4.7+):
- grid="1/12" => 12 steps per bar (3 per beat; good for eighth-note triplets and quarter-note triplets)
- grid="1/24" => 24 steps per bar (6 per beat; good for sixteenth-note triplets)

Sustain behavior:
- For lane == 'note': duration is extended by counting consecutive '-' steps
  immediately following a hit within the current bar segment.
  Example on 1/16 grid: '9---' = 1/4 note.
- For drum lanes: '-' is treated like a rest (no event, no extension).
"""

from __future__ import annotations

from typing import Dict, List, Optional, Set

from ..models import CompileRequest, CompileResponse, Event, Diagnostic, NodeInput
from .post.chain import apply_render_chain
from .solver import solve_equation_bar
from .parser import parse_text
from .notes import parse_notes_spec, parse_sequence_spec


# Mapping from lane identifiers to default MIDI note numbers
LANE_TO_MIDI_NOTE = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
    "note": 60,  # default pitch for melodic lane if unspecified
}


def _intensity_to_velocity(char: str) -> int:
    """Map a digit character to a MIDI velocity (1–127).

    We scale the 0–9 range into roughly 15–127 using a linear mapping.
    Zero intensity still produces a soft hit.
    """
    try:
        value = int(char)
    except ValueError:
        return 0
    # Scale 0–9 -> 15–127
    return max(1, min(127, 15 + value * 12))


def _is_hit_char(ch: str) -> bool:
    """True if this pattern character represents a note-on/hit."""
    return ch.isdigit()


def _count_sustain_steps(bar_pat: str, start_idx: int) -> int:
    """Count consecutive sustain markers ('-') after a hit at start_idx (bar-local)."""
    n = 0
    j = start_idx + 1
    while j < len(bar_pat) and bar_pat[j] == "-":
        n += 1
        j += 1
    return n


def _normalize_pattern(raw_pat: str) -> str:
    """Remove readability characters (spaces and '|') from the pattern."""
    return "".join(c for c in raw_pat if c not in {" ", "|"})


def _steps_per_bar_for_grid(grid: str) -> int:
    """Return number of discrete steps per 4/4 bar for the given grid."""
    mapping = {
        "1/4": 4,
        "1/8": 8,
        "1/12": 12,  # triplet-friendly
        "1/16": 16,
        "1/24": 24,  # triplet-friendly (finer)
    }
    # Parser should have validated grid, but be defensive.
    return mapping.get(grid, 4)


def _compute_pattern_bar_count(pat: str, steps_per_bar: int) -> int:
    """Determine how many bars are represented by the pattern.

    Returns:
      - 1 for single-bar patterns (including patterns that will be repeated/truncated to 1 bar)
      - N (2..16) for multi-bar patterns that are exact multiples of steps_per_bar
    """
    if steps_per_bar <= 0:
        return 1
    if len(pat) <= steps_per_bar:
        return 1
    if len(pat) % steps_per_bar != 0:
        # Not a clean multi-bar pattern; treat as single bar (back-compat).
        return 1
    bars = len(pat) // steps_per_bar
    if bars < 1:
        return 1
    if bars > 16:
        return 16
    return bars


def _slice_bar_segment(pat: str, steps_per_bar: int, bar_offset: int, bar_count: int) -> str:
    """Return the bar-local pattern segment for this bar_offset.

    bar_offset is 0-based within the node's active range (start_bar..end_bar).
    """
    if bar_count <= 1:
        # Single-bar: ensure exactly one bar worth of steps by repeating/truncating.
        if len(pat) == 0:
            return ""
        if len(pat) < steps_per_bar:
            times = (steps_per_bar + len(pat) - 1) // len(pat)
            return (pat * times)[:steps_per_bar]
        return pat[:steps_per_bar]

    # Multi-bar: pick the correct bar segment and ensure it's exactly steps_per_bar
    seg_index = bar_offset % bar_count
    start = seg_index * steps_per_bar
    end = start + steps_per_bar
    return pat[start:end]


def _hits_by_segment(pat: str, steps_per_bar: int, bar_count: int) -> List[int]:
    """Count digit hits per bar segment for a multi-bar pattern."""
    hits: List[int] = []
    for i in range(bar_count):
        start = i * steps_per_bar
        end = start + steps_per_bar
        seg = pat[start:end]
        hits.append(sum(1 for ch in seg if _is_hit_char(ch)))
    return hits


def _compute_base_hit_index(
    bar_offset: int,
    bar_count: int,
    hits_per_seg: List[int],
) -> int:
    """Compute how many hits occur before this bar (within node's active range).

    bar_offset: 0-based bar index within node active range.
    bar_count: number of pattern segments (1..16)
    hits_per_seg: list of length bar_count
    """
    if bar_offset <= 0:
        return 0
    if bar_count <= 1:
        # hits_per_seg[0] is hits_per_bar
        return hits_per_seg[0] * bar_offset

    total_per_cycle = sum(hits_per_seg)
    full_cycles = bar_offset // bar_count
    rem = bar_offset % bar_count

    base = full_cycles * total_per_cycle
    if rem > 0:
        base += sum(hits_per_seg[:rem])
    return base


def _compile_theory_node(
    node: NodeInput,
    bar_idx: int,
    bpm: float,
    diagnostics: List[Diagnostic],
    debug_lines: Optional[List[str]] = None,
) -> List[Event]:
    """Compile a single theory node into events for the current bar."""
    if not node.text:
        diagnostics.append(
            Diagnostic(
                level="error",
                message=f"Node {node.id}: missing text for theory node",
                line=1,
                col=1,
            )
        )
        return []

    ast, parse_diags = parse_text(node.text)
    if parse_diags:
        # Forward parser diagnostics; mark them but continue with other nodes
        for diag in parse_diags:
            diagnostics.append(
                Diagnostic(
                    level=diag.level,
                    message=f"Node {node.id}: {diag.message}",
                    line=diag.line,
                    col=diag.col,
                )
            )
        return []

    assert ast is not None  # satisfied when no diagnostics
    if getattr(ast, "kind", "beat") == "equation":
        bar_range = ast.bars or "1-16"
        start_bar, end_bar = [int(x.strip()) for x in bar_range.split("-")]
        current_bar_number = bar_idx + 1
        if not (start_bar <= current_bar_number <= end_bar):
            return []
        events = solve_equation_bar(ast, bar_idx, bpm)
        if debug_lines is not None:
            debug_lines.append(
                f"theory {node.id} kind=equation events={len(events)}"
            )
        return events

    # Determine whether this node should fire on the current bar
    # Bars are 1-indexed in the script but 0-indexed in the API
    bar_range = ast.bars or "1-16"
    start_bar, end_bar = [int(x.strip()) for x in bar_range.split("-")]
    current_bar_number = bar_idx + 1
    if not (start_bar <= current_bar_number <= end_bar):
        return []

    # Determine grid resolution (now supports 1/12 and 1/24)
    grid = (ast.grid or "1/4").strip()
    steps_per_bar = _steps_per_bar_for_grid(grid)
    step_len_beats = 4.0 / steps_per_bar  # bar spans 4 beats

    # Normalize pattern (strip spaces and pipes)
    raw_pat = ast.pattern or ""
    pat_norm = _normalize_pattern(raw_pat)
    if len(pat_norm) == 0:
        return []

    # Determine how many bars the pattern represents
    pat_bar_count = _compute_pattern_bar_count(pat_norm, steps_per_bar)

    # bar_offset is 0-based within the node's active range
    bar_offset = current_bar_number - start_bar
    if bar_offset < 0:
        bar_offset = 0

    # Slice the current bar's segment (or repeat/truncate for 1-bar patterns)
    bar_pat = _slice_bar_segment(pat_norm, steps_per_bar, bar_offset, pat_bar_count)
    if len(bar_pat) == 0:
        return []

    # Prepare sequence if provided. Validate here and add diagnostic on error
    seq_values: List[int] = []
    use_sequence = False
    if getattr(ast, "sequence", None):
        try:
            seq_values = parse_sequence_spec(ast.sequence or "")
            use_sequence = True if seq_values else False
        except Exception as exc:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Node {node.id}: invalid sequence '{ast.sequence}': {exc}",
                    line=1,
                    col=1,
                )
            )
            return []

    # Compute base hit index for this bar (variable per-bar hit counts supported)
    base_hit_idx = 0
    if use_sequence:
        if pat_bar_count <= 1:
            hits_per_bar = sum(1 for ch in bar_pat if _is_hit_char(ch))
            base_hit_idx = hits_per_bar * bar_offset
        else:
            hits_per_seg = _hits_by_segment(pat_norm, steps_per_bar, pat_bar_count)
            base_hit_idx = _compute_base_hit_index(bar_offset, pat_bar_count, hits_per_seg)

    # Collect events for this node
    node_events: List[Event] = []
    local_hit_counter = 0  # counts hits (digits) within current bar

    for idx, char in enumerate(bar_pat):
        if char == ".":
            continue

        # Sustain markers do not create events.
        if char == "-":
            continue

        # Only digits 0-9 are valid note-on/hit tokens
        if not _is_hit_char(char):
            continue

        velocity = _intensity_to_velocity(char)
        if velocity <= 0:
            continue

        tbeat = (idx / steps_per_bar) * 4.0  # bar spans 4 beats

        # Determine pitches for this event
        pitches: List[int] = []
        if use_sequence:
            seq_len = len(seq_values)
            if seq_len > 0:
                pitch_index = base_hit_idx + local_hit_counter
                chosen = seq_values[pitch_index % seq_len]
                pitches = [chosen]
            else:
                local_hit_counter += 1
                continue
            local_hit_counter += 1
        elif getattr(ast, "notes", None):
            try:
                pitches = parse_notes_spec(ast.notes or "")
            except Exception as exc:
                diagnostics.append(
                    Diagnostic(
                        level="error",
                        message=f"Node {node.id}: invalid notes '{ast.notes}': {exc}",
                        line=1,
                        col=1,
                    )
                )
                continue
        else:
            default_note = LANE_TO_MIDI_NOTE.get(ast.lane, 60)
            pitches = [default_note]

        if not pitches:
            continue

        # Determine duration
        if ast.lane == "note":
            sustain_steps = _count_sustain_steps(bar_pat, idx)
            raw_duration = step_len_beats * (1 + sustain_steps)

            # Small release so it doesn't click right at the grid edge
            duration_beats = raw_duration * 0.95
            if duration_beats < 0.05:
                duration_beats = 0.05
        else:
            duration_beats = 0.1

        node_events.append(
            Event(
                tBeat=tbeat,
                lane=ast.lane,
                note=pitches[0] if pitches else None,
                pitches=pitches,
                velocity=velocity,
                durationBeats=duration_beats,
                preset=ast.preset,
            )
        )

    # Apply polyphony policy to node events before adding to global list
    poly_mode = (ast.poly or "poly").lower()

    if node_events and poly_mode in {"mono", "choke"}:
        apply_mono = False
        if poly_mode == "mono":
            apply_mono = True
        elif poly_mode == "choke" and ast.lane == "hat":
            apply_mono = True

        if apply_mono:
            # Ensure stable ordering by time (should already be, but be explicit)
            node_events.sort(key=lambda e: e.tBeat)
            for i, ev in enumerate(node_events):
                if i + 1 < len(node_events):
                    next_t = node_events[i + 1].tBeat
                else:
                    next_t = 4.0  # end of bar

                available = (next_t - ev.tBeat) * 0.95
                min_dur = 0.05
                new_dur = min(ev.durationBeats, max(min_dur, available))
                ev.durationBeats = new_dur

    if debug_lines is not None:
        debug_lines.append(f"theory {node.id} kind=beat events={len(node_events)}")
    return node_events


def compile_request(req: CompileRequest) -> CompileResponse:
    """Compile all nodes for the given bar index.

    :param req: CompileRequest containing seed, bpm, barIndex and nodes
    :returns: CompileResponse with events and diagnostics
    """
    diagnostics: List[Diagnostic] = []
    events: List[Event] = []
    debug_lines: List[str] = []
    loop_bars = 16
    bar_idx = req.barIndex

    nodes_by_id: Dict[str, NodeInput] = {
        node.id: node for node in req.nodes if node.enabled
    }
    children: Set[str] = {
        node.childId
        for node in nodes_by_id.values()
        if node.kind == "render" and node.childId
    }
    roots = [node for node in nodes_by_id.values() if node.id not in children]
    if req.debug:
        debug_lines.append(
            f"roots: {', '.join(node.id for node in roots) or '(none)'}"
        )

    visiting: Set[str] = set()
    compiled: Dict[str, List[Event]] = {}

    def compile_node(node_id: str) -> List[Event]:
        if node_id in compiled:
            return list(compiled[node_id])
        if node_id in visiting:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Cycle detected while compiling node {node_id}",
                    line=1,
                    col=1,
                )
            )
            return []
        node = nodes_by_id.get(node_id)
        if node is None:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Missing node reference '{node_id}'",
                    line=1,
                    col=1,
                )
            )
            return []
        visiting.add(node_id)
        if node.kind == "render":
            if not node.childId:
                diagnostics.append(
                    Diagnostic(
                        level="error",
                        message=f"Render node {node.id} missing childId",
                        line=1,
                        col=1,
                    )
                )
                visiting.remove(node_id)
                return []
            child_events = compile_node(node.childId)
            rendered = apply_render_chain(child_events, node.render, req)
            if req.debug:
                debug_lines.append(
                    f"render {node.id} child {node.childId} events {len(child_events)} -> {len(rendered)}"
                )
            compiled[node_id] = list(rendered)
        else:
            compiled[node_id] = _compile_theory_node(
                node,
                bar_idx,
                req.bpm,
                diagnostics,
                debug_lines if req.debug else None,
            )
        visiting.remove(node_id)
        return list(compiled[node_id])

    for root in roots:
        events.extend(compile_node(root.id))

    for node_id in nodes_by_id:
        if node_id not in compiled:
            events.extend(compile_node(node_id))

    events.sort(
        key=lambda e: (
            e.tBeat,
            e.pitches[0] if e.pitches else -1,
            e.lane,
        )
    )
    ok = len([d for d in diagnostics if d.level == "error"]) == 0
    return CompileResponse(
        ok=ok,
        diagnostics=diagnostics,
        barIndex=bar_idx,
        loopBars=loop_bars,
        events=events,
        debugText="\n".join(debug_lines) if req.debug else None,
    )
