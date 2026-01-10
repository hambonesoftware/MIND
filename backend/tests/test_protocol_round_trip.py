import json
from pathlib import Path

from mind_api.mind_core import protocol


def test_protocol_round_trip_preserves_unknown_fields() -> None:
    repo_root = Path(__file__).resolve().parents[2]
    example_path = repo_root / "docs" / "mind-protocol" / "examples" / "protocol_tiny.json"
    data = json.loads(example_path.read_text(encoding="utf-8"))

    root = protocol.load_protocol_root(data)
    dumped = protocol.dump_protocol_root(root)

    assert dumped["protocolVersion"] == data["protocolVersion"]
    assert dumped["graphVersion"] == data["graphVersion"]
    assert dumped["resolverVersion"] == data["resolverVersion"]
    assert dumped["extensions"] == data["extensions"]
    assert dumped["extraRoot"] == data["extraRoot"]
    assert dumped["nodes"] == data["nodes"]
    assert dumped["edges"] == data["edges"]
