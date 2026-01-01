from __future__ import annotations

from typing import Dict, Tuple


def parse_motion_call(text: str) -> Tuple[str, Dict[str, str]]:
    stripped = text.strip()
    if "(" not in stripped:
        return stripped, {}

    name, remainder = stripped.split("(", 1)
    name = name.strip()
    args = remainder.rsplit(")", 1)[0]
    kwargs: Dict[str, str] = {}
    for chunk in args.split(","):
        token = chunk.strip()
        if not token or "=" not in token:
            continue
        key, value = token.split("=", 1)
        kwargs[key.strip()] = value.strip()
    return name, kwargs
