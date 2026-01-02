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

from ..models import Diagnostic, ParsedAST, EquationAST


# beat(note, "9..9..", grid="1/16", bars="1-16", preset="gm:0:0", notes="C4:E4:G4", poly="mono", sequence="C4 E4", motions="...")
_BEAT_CALL_RE = re.compile(
    r"""^\s*beat\s*\(\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*,\s*"(.*?)"\s*(?:,\s*(.*?))?\)\s*$""",
    re.DOTALL,
)

# equation(name="...", lane="note", grid="1/12", bars="1-16", preset="...", key="C# minor", harmony="...", motions="...")
_EQUATION_CALL_RE = re.compile(
    r"""^\s*equation\s*\(\s*(.*?)\s*\)\s*$""",
    re.DOTALL,
)

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


def _parse_equation(text: str) -> Tuple[Optional[EquationAST], List[Diagnostic]]:
    diags: List[Diagnostic] = []

    m = _EQUATION_CALL_RE.match(text)
    if not m:
        diags.append(Diagnostic(level="error", message="Invalid equation() syntax", line=1, col=1))
        return None, diags

    inner = m.group(1) or ""
    kwargs = _parse_kwargs(inner)

    name = kwargs.get("name")
    lane = kwargs.get("lane") or "note"
    grid = kwargs.get("grid") or "1/12"
    bars = kwargs.get("bars") or "1-16"
    preset = kwargs.get("preset")

    key = kwargs.get("key") or "C major"
    harmony = kwargs.get("harmony") or "1-16:I"
    motions = kwargs.get("motions") or "sustain(chord)"

    if grid not in _ALLOWED_GRIDS:
        diags.append(Diagnostic(level="error", message=f"Invalid grid '{grid}'", line=1, col=1))
        return None, diags

    bars_err = _validate_bar_range(bars)
    if bars_err:
        diags.append(Diagnostic(level="error", message=bars_err, line=1, col=1))
        return None, diags

    return (
        EquationAST(
            name=name,
            lane=lane,
            grid=grid,
            bars=bars,
            preset=preset,
            key=key,
            harmony=harmony,
            motions=motions,
        ),
        diags,
    )


def parse_text(text: str) -> Tuple[Optional[ParsedAST | EquationAST], List[Diagnostic]]:
    """
    Parse a single node script string into an AST model.

    Returns:
      (ast, diagnostics)
    """
    diagnostics: List[Diagnostic] = []

    if not text or not text.strip():
        diagnostics.append(Diagnostic(level="error", message="Empty script", line=1, col=1))
        return None, diagnostics

    # Try equation(...) first (used by render blocks)
    if text.lstrip().startswith("equation"):
        eq_ast, eq_diags = _parse_equation(text)
        if eq_diags:
            return None, eq_diags
        return eq_ast, []

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
