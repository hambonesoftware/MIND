import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.theory.harmony_plan import HarmonyPlan  # noqa: E402


def test_harmony_plan_bar_ranges_still_work():
    plan = HarmonyPlan.parse("1-2:i;3-4:V")
    assert plan.get_symbol(1) == "i"
    assert plan.get_symbol(2) == "i"
    assert plan.get_symbol(3) == "V"
    assert plan.get_symbol(4) == "V"


def test_harmony_plan_beat_ranges_lookup():
    plan = HarmonyPlan.parse("1.2-1.3:V")
    steps_per_bar = 16
    assert plan.get_symbol_at_step(1, step=0, steps_per_bar=steps_per_bar) == "i"
    assert plan.get_symbol_at_step(1, step=4, steps_per_bar=steps_per_bar) == "V"
    assert plan.get_symbol_at_step(1, step=8, steps_per_bar=steps_per_bar) == "V"
    assert plan.get_symbol_at_step(1, step=12, steps_per_bar=steps_per_bar) == "i"
