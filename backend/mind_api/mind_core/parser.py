"""
Parser for the MIND language v0.1.

This module implements a very small grammar for a single function call
``beat(...)`` used to sequence rhythmic patterns. The accepted signature:

    beat(<lane>, "<pattern>", grid="1/4|1/8|1/12|1/16|1/24", bars="1-16", preset="<id>")

Only a single call is permitted in each node. Parsing is forgiving about
whitespace and argument order. If a script cannot be parsed the returned
``diagnostics`` list will contain at least one entry.

Pattern rules (v0.4.5+):
- '.' = rest
- '0'..'9' = hit / note-on token
- '-' = sustain/tie marker (extends the previous hit by one grid step)
- spaces and '|' are allowed for readability (the compiler ignores them)

Multi-bar patterns (v0.4.6+ intent):
- A pattern MAY represent multiple bars when, after removing spaces and '|',
  its length is an exact multiple of steps_per_bar and <= 16 bars.
- Shorter-than-one-bar patterns are still allowed (the compiler may repeat/truncate).

Triplet-friendly grids (v0.4.7+):
- grid="1/12" => 12 steps per bar (eighth-triplet resolution; 3 steps per beat)
- grid="1/24" => 24 steps per bar (sixteenth-triplet resolution; 6 steps per beat)
"""

from __future__ import annotations

import re
from typing import Dict, Tuple, Optional, List

from ..models import ParsedAST, Diagnostic
from .notes import parse_notes_spec, parse_sequence_spec


_BEAT_CALL_RE = re.compile(
    r"beat\s*\(\s*([^,\s]+)\s*,\s*\"([^\"]*)\"(.*)\)",
    re.IGNORECASE | re.DOTALL,
)

# Recognise keyword arguments in the beat() call.
_KWARG_RE = re.compile(
    r"(grid|bars|preset|notes|poly|sequence)\s*=\s*\"([^\"]*)\"",
    re.IGNORECASE,
)


def _steps_per_bar_for_grid(grid: str) -> Optional[int]:
    """
    Convert grid string to steps-per-bar for a 4/4 bar (4 beats).

    - 1/4  => 4  steps/bar (quarters)
    - 1/8  => 8  steps/bar (eighths)
    - 1/12 => 12 steps/bar (eighth-note triplet resolution; 3 per beat)
    - 1/16 => 16 steps/bar (sixteenths)
    - 1/24 => 24 steps/bar (sixteenth-note triplet resolution; 6 per beat)
    """
    if grid == "1/4":
        return 4
    if grid == "1/8":
        return 8
    if grid == "1/12":
        return 12
    if grid == "1/16":
        return 16
    if grid == "1/24":
        return 24
    return None


def _normalize_pattern(pattern: str) -> str:
    """Remove readability characters so we can validate length cleanly."""
    return "".join(c for c in pattern if c not in {" ", "|"})


def parse_text(text: str) -> Tuple[Optional[ParsedAST], List[Diagnostic]]:
    """Parse a node script into a structured AST.

    :param text: Raw script provided by the user.
    :returns: A tuple of ``ParsedAST`` (or ``None`` if parsing failed)
              and a list of diagnostic messages.
    """
    diagnostics: List[Diagnostic] = []

    script = text.strip()
    if not script:
        diagnostics.append(Diagnostic(level="error", message="Empty script", line=1, col=1))
        return None, diagnostics

    # Match the top level beat call
    m = _BEAT_CALL_RE.match(script)
    if not m:
        diagnostics.append(
            Diagnostic(level="error", message="Unable to parse. Expected beat(...) call.", line=1, col=1)
        )
        return None, diagnostics

    lane = m.group(1).strip().lower()
    pattern = m.group(2)
    kwarg_str = m.group(3)

    kwargs: Dict[str, str] = {}
    for kw, value in _KWARG_RE.findall(kwarg_str):
        kwargs[kw.lower()] = value

    grid = (kwargs.get("grid") or "1/4").strip()
    bars = (kwargs.get("bars") or "1-16").strip()
    preset = kwargs.get("preset")

    # Optional chord notes specification
    notes_str = kwargs.get("notes")

    # Optional polyphony policy
    poly_str = kwargs.get("poly")

    # Optional melodic stepping sequence
    sequence_str = kwargs.get("sequence")

    # Validate lane
    if lane not in {"kick", "snare", "hat", "note"}:
        diagnostics.append(Diagnostic(level="error", message=f"Unsupported lane '{lane}'", line=1, col=1))

    # Validate grid
    allowed_grids = {"1/4", "1/8", "1/12", "1/16", "1/24"}
    if grid not in allowed_grids:
        diagnostics.append(
            Diagnostic(
                level="error",
                message=f"Unsupported grid '{grid}'. Supported: {', '.join(sorted(allowed_grids))}",
                line=1,
                col=1,
            )
        )

    # Validate bars
    bar_match = re.match(r"(\d+)\s*-\s*(\d+)$", bars)
    if not bar_match:
        diagnostics.append(Diagnostic(level="error", message=f"Invalid bars format '{bars}'", line=1, col=1))
    else:
        start = int(bar_match.group(1))
        end = int(bar_match.group(2))
        if not (1 <= start <= 16 and 1 <= end <= 16 and start <= end):
            diagnostics.append(
                Diagnostic(level="error", message="Bars must be within 1-16 range and start<=end", line=1, col=1)
            )

    # Validate pattern non-empty
    if pattern is None or pattern == "":
        diagnostics.append(Diagnostic(level="error", message="Pattern cannot be empty", line=1, col=1))
    else:
        # Validate pattern characters
        # Allowed: '.', digits, '-', whitespace, '|'
        if not re.fullmatch(r"[\.\d\-\s|]+", pattern):
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message="Pattern may only contain '.', digits, '-', spaces and '|'",
                    line=1,
                    col=1,
                )
            )

        # Validate multi-bar pattern length (when grid is valid)
        steps_per_bar = _steps_per_bar_for_grid(grid)
        if steps_per_bar is not None:
            norm_pat = _normalize_pattern(pattern)
            if len(norm_pat) == 0:
                diagnostics.append(Diagnostic(level="error", message="Pattern cannot be empty", line=1, col=1))
            else:
                # If pattern is longer than one bar, require whole-bar multiples up to 16 bars.
                if len(norm_pat) > steps_per_bar:
                    if len(norm_pat) % steps_per_bar != 0:
                        diagnostics.append(
                            Diagnostic(
                                level="error",
                                message=(
                                    "Multi-bar pattern length must be a whole number of bars. "
                                    f"After removing spaces and '|', length {len(norm_pat)} is not a multiple of {steps_per_bar} "
                                    f"(grid {grid})."
                                ),
                                line=1,
                                col=1,
                            )
                        )
                    else:
                        bar_count = len(norm_pat) // steps_per_bar
                        if bar_count > 16:
                            diagnostics.append(
                                Diagnostic(
                                    level="error",
                                    message=(
                                        "Multi-bar pattern may be at most 16 bars. "
                                        f"Got {bar_count} bars (length {len(norm_pat)} at grid {grid})."
                                    ),
                                    line=1,
                                    col=1,
                                )
                            )

    # Validate notes specification if present
    if notes_str:
        try:
            parse_notes_spec(notes_str)
        except Exception as exc:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Invalid notes specification '{notes_str}': {exc}",
                    line=1,
                    col=1,
                )
            )

    # Validate poly specification if present
    if poly_str:
        poly_lower = poly_str.strip().lower()
        if poly_lower not in {"mono", "poly", "choke"}:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Invalid poly specification '{poly_str}'. Expected mono, poly or choke",
                    line=1,
                    col=1,
                )
            )

    # Validate sequence specification if present
    if sequence_str:
        try:
            parse_sequence_spec(sequence_str)
        except Exception as exc:
            diagnostics.append(
                Diagnostic(
                    level="error",
                    message=f"Invalid sequence specification '{sequence_str}': {exc}",
                    line=1,
                    col=1,
                )
            )

    ast: Optional[ParsedAST] = None
    if not diagnostics:
        ast = ParsedAST(
            lane=lane,
            pattern=pattern,
            grid=grid,
            bars=bars,
            preset=preset,
            notes=notes_str,
            poly=(poly_str.strip().lower() if poly_str else None),
            sequence=sequence_str,
        )

    return ast, diagnostics
