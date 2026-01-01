from __future__ import annotations

import re
from typing import Dict, List, Optional, Tuple

from ..models import Diagnostic, EquationAST

_EQUATION_CALL_RE = re.compile(
    r"equation\s*\(\s*(.*)\)\s*$",
    re.IGNORECASE | re.DOTALL,
)

_KWARG_RE = re.compile(
    r"(\w+)\s*=\s*\"([^\"]*)\"",
    re.IGNORECASE,
)

_ALLOWED_KEYS = {"lane", "grid", "bars", "preset", "key", "harmony", "motions"}
_REQUIRED_KEYS = {"lane", "grid", "bars", "key"}
_ALLOWED_GRIDS = {"1/4", "1/8", "1/12", "1/16", "1/24"}


def parse_equation_text(text: str) -> Tuple[Optional[EquationAST], List[Diagnostic]]:
    diagnostics: List[Diagnostic] = []

    script = text.strip()
    if not script:
        diagnostics.append(Diagnostic(level="error", message="Empty script", line=1, col=1))
        return None, diagnostics

    match = _EQUATION_CALL_RE.match(script)
    if not match:
        diagnostics.append(
            Diagnostic(level="error", message="Unable to parse. Expected equation(...) call.", line=1, col=1)
        )
        return None, diagnostics

    body = match.group(1)
    kwargs: Dict[str, str] = {}
    for key, value in _KWARG_RE.findall(body):
        kwargs[key.lower()] = value

    for key in kwargs:
        if key not in _ALLOWED_KEYS:
            diagnostics.append(
                Diagnostic(level="error", message=f"Unknown argument '{key}'", line=1, col=1)
            )

    missing = [key for key in sorted(_REQUIRED_KEYS) if key not in kwargs or not kwargs[key].strip()]
    if missing:
        diagnostics.append(
            Diagnostic(
                level="error",
                message=f"Missing required argument(s): {', '.join(missing)}",
                line=1,
                col=1,
            )
        )

    if diagnostics:
        return None, diagnostics

    bars = kwargs["bars"].strip()
    bar_match = re.match(r"(\d+)\s*-\s*(\d+)$", bars)
    if not bar_match:
        diagnostics.append(
            Diagnostic(level="error", message=f"Invalid bars format '{bars}'", line=1, col=1)
        )
        return None, diagnostics
    start = int(bar_match.group(1))
    end = int(bar_match.group(2))
    if not (1 <= start <= 16 and 1 <= end <= 16 and start <= end):
        diagnostics.append(
            Diagnostic(level="error", message="Bars must be within 1-16 range and start<=end", line=1, col=1)
        )
        return None, diagnostics

    grid = kwargs["grid"].strip()
    if grid not in _ALLOWED_GRIDS:
        diagnostics.append(
            Diagnostic(
                level="error",
                message=f"Unsupported grid '{grid}'. Supported: {', '.join(sorted(_ALLOWED_GRIDS))}",
                line=1,
                col=1,
            )
        )
        return None, diagnostics

    return (
        EquationAST(
            lane=kwargs["lane"].strip(),
            grid=grid,
            bars=bars,
            key=kwargs["key"].strip(),
            preset=(kwargs.get("preset") or None),
            harmony=(kwargs.get("harmony") or None),
            motions=(kwargs.get("motions") or None),
        ),
        diagnostics,
    )
