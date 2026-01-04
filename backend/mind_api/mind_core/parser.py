"""
Parser for the beat() language.

Accepted script form:

beat(lane, "pattern", grid="1/16", bars="1-16", preset="gm:0:0", notes="C4:E4:G4", poly="mono", sequence="C4 E4 G4", motions="...")

Notes:
- lane is an identifier like note/kick/snare/hat
- pattern is a quoted string
- kwargs are optional; unknown kwargs are ignored (but we parse the common ones)
"""

from __future__ import annotations

import re
from typing import List, Optional, Tuple

from ..models import Diagnostic, ParsedAST


# beat(note, "9..9..", grid="1/16", bars="1-16", preset="gm:0:0", notes="C4:E4:G4", poly="mono", sequence="C4 E4", motions="...")
_BEAT_CALL_RE = re.compile(
    r"""^\s*beat\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*"(.*?)"\s*(?:,\s*(.*?))?\)\s*$""",
    re.DOTALL,
)

# detect deprecated equation calls
_EQUATION_PREFIX_RE = re.compile(r"\bequation\s*\(", re.DOTALL)

# key="value" style kwargs, with either "..." or bare tokens (bare used for things like 1/16)
_KWARG_RE = re.compile(
    r"""([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:"([^"]*)"|([^\s,]+))\s*(?:,|$)"""
)

_ALLOWED_GRIDS = {"1/4", "1/8", "1/12", "1/16", "1/24"}


def _parse_kwargs(kwarg_str: str) -> dict:
    kwargs = {}
    if not kwarg_str:
        return kwargs
    for m in _KWARG_RE.finditer(kwarg_str):
        key = m.group(1)
        val = m.group(2) if m.group(2) is not None else m.group(3)
        kwargs[key] = val
    return kwargs


def _validate_bar_range(bars: str) -> Optional[str]:
    try:
        a, b = bars.split("-")
        a_i = int(a.strip())
        b_i = int(b.strip())
        if a_i < 1 or b_i < 1 or a_i > b_i:
            return "bars must be in form 'start-end' with 1 <= start <= end"
        return None
    except Exception:
        return "bars must be in form 'start-end' (e.g. '1-16')"


def parse_text(text: str) -> Tuple[Optional[ParsedAST], List[Diagnostic]]:
    """
    Parse a single node script string into an AST model.

    Returns:
      (ast, diagnostics)
    """
    diagnostics: List[Diagnostic] = []

    if not text or not text.strip():
        diagnostics.append(Diagnostic(level="error", message="Empty script", line=1, col=1))
        return None, diagnostics

    if _EQUATION_PREFIX_RE.search(text):
        message = (
            "equation"
            "(...) is no longer supported in MINDV9. Use FlowGraph v9 or beat(...)."
        )
        raise ValueError(message)

    # beat(...)
    m = _BEAT_CALL_RE.match(text)
    if not m:
        diagnostics.append(Diagnostic(level="error", message="Invalid beat() syntax", line=1, col=1))
        return None, diagnostics

    lane = m.group(1)
    pattern = m.group(2) or ""
    kwarg_str = m.group(3) or ""
    kwargs = _parse_kwargs(kwarg_str)

    grid = (kwargs.get("grid") or "1/4").strip()
    bars = (kwargs.get("bars") or "1-16").strip()
    preset = kwargs.get("preset")
    notes_str = kwargs.get("notes")
    poly_str = kwargs.get("poly")
    sequence_str = kwargs.get("sequence")
    motions_str = kwargs.get("motions")

    if grid not in _ALLOWED_GRIDS:
        diagnostics.append(
            Diagnostic(level="error", message=f"Invalid grid '{grid}' (allowed: {sorted(_ALLOWED_GRIDS)})", line=1, col=1)
        )
        return None, diagnostics

    bars_err = _validate_bar_range(bars)
    if bars_err:
        diagnostics.append(Diagnostic(level="error", message=bars_err, line=1, col=1))
        return None, diagnostics

    ast = ParsedAST(
        lane=lane,
        pattern=pattern,
        grid=grid,
        bars=bars,
        preset=preset,
        notes=notes_str,
        poly=poly_str,
        sequence=sequence_str,
        motions=motions_str,
    )
    return ast, []
