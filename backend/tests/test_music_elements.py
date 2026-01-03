from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.music_elements import (  # noqa: E402
    HarmonyPlan,
    PhrasePlan,
    TextureRecipe,
    generate_events,
)


def test_texture_generation_is_deterministic():
    harmony = HarmonyPlan.from_chords([[60, 64, 67]], steps_per_bar=12)
    phrase = PhrasePlan(density_curve=(0.75,))
    texture = TextureRecipe(pattern_family=("low-mid-high", "high-mid-low"))

    events_a = generate_events(
        harmony, texture, phrase, bars=1, grid="1/12", seed=42, piece_id="demo"
    )
    events_b = generate_events(
        harmony, texture, phrase, bars=1, grid="1/12", seed=42, piece_id="demo"
    )

    signature_a = [(e.tBeat, e.pitches, e.durationBeats) for e in events_a]
    signature_b = [(e.tBeat, e.pitches, e.durationBeats) for e in events_b]
    assert signature_a == signature_b


def test_density_curve_controls_event_count():
    harmony = HarmonyPlan.from_chords([[60, 64, 67], [62, 65, 69]], steps_per_bar=12)
    phrase = PhrasePlan(density_curve=(0.25, 1.0))
    texture = TextureRecipe(pattern_family=("low-mid-high",))

    events = generate_events(
        harmony, texture, phrase, bars=2, grid="1/12", seed=7, piece_id="demo"
    )
    bar0 = [event for event in events if 0 <= event.tBeat < 4]
    bar1 = [event for event in events if 4 <= event.tBeat < 8]

    assert len(bar1) > len(bar0)


def test_sustain_policy_emits_longer_durations():
    harmony = HarmonyPlan.from_chords(
        [[60, 64, 67]],
        steps_per_bar=12,
        change_steps=[[0, 6]],
    )
    phrase = PhrasePlan(density_curve=(1.0,))
    texture = TextureRecipe(pattern_family=("low-mid-high",), sustain_policy="hold_until_change")

    events = generate_events(
        harmony, texture, phrase, bars=1, grid="1/12", seed=1, piece_id="demo"
    )
    assert any(event.durationBeats > 1.0 for event in events)
