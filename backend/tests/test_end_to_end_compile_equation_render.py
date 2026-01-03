import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.compiler import compile_request  # noqa: E402
from mind_api.models import (  # noqa: E402
    CompileRequest,
    NodeInput,
    PercSpec,
    RenderSpec,
    StrumSpec,
)


def test_compile_equation_render_end_to_end():
    equation_text = (
        'equation(lane="note", grid="1/12", bars="1-16", key="C minor", '
        'harmony="1-4:i", motions="sustain(chord); arpeggiate(grid=1/12, pattern=low-mid-high-mid)")'
    )
    start_node = NodeInput(id="start", kind="start")
    theory_node = NodeInput(id="eq-1", kind="theory", text=equation_text, enabled=True)
    base_req = CompileRequest(
        seed=1,
        bpm=120.0,
        barIndex=0,
        nodes=[start_node, theory_node],
        edges=[
            {"from": {"nodeId": "start"}, "to": {"nodeId": "eq-1"}},
        ],
    )
    base_resp = compile_request(base_req)

    render_node = NodeInput(
        id="render-1",
        kind="render",
        childId="eq-1",
        render=RenderSpec(
            strum=StrumSpec(enabled=True, spreadMs=60, directionByStep="D"),
            perc=PercSpec(enabled=True, grid="1/8", hat="x......."),
        ),
        enabled=True,
    )
    render_req = CompileRequest(
        seed=1,
        bpm=120.0,
        barIndex=0,
        nodes=[start_node, theory_node, render_node],
        edges=[
            {"from": {"nodeId": "start"}, "to": {"nodeId": "render-1"}},
            {"from": {"nodeId": "render-1"}, "to": {"nodeId": "eq-1"}},
        ],
    )
    render_resp = compile_request(render_req)

    assert base_resp.ok is True
    assert render_resp.ok is True
    assert base_resp.events
    assert len(render_resp.events) > len(base_resp.events)
    assert any(event.lane == "hat" for event in render_resp.events)
