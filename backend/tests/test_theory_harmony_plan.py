import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.theory.harmony_plan import HarmonyPlan  # noqa: E402


def test_harmony_plan_bar_mapping():
    plan = HarmonyPlan.parse("1-2:i;3-4:V")
    assert plan.get_symbol(1) == "i"
    assert plan.get_symbol(2) == "i"
    assert plan.get_symbol(3) == "V"
    assert plan.get_segment_start(3) == 3
    assert plan.get_segment_length(3) == 2
