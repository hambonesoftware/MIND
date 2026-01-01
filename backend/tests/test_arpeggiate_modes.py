import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from mind_api.mind_core.lattice import Lattice  # noqa: E402
from mind_api.mind_core.motions.arpeggiate import apply_arpeggiate  # noqa: E402


def test_arpeggiate_register_mode_default():
    lattice = Lattice(steps_per_bar=2)
    apply_arpeggiate(
        lattice,
        chord_by_register=[[48], [60], [72]],
        pattern="low-high",
    )
    assert [onset.pitches[0] for onset in lattice.onsets] == [48, 72]


def test_arpeggiate_tones_mode_with_order():
    lattice = Lattice(steps_per_bar=3)
    apply_arpeggiate(
        lattice,
        chord_by_register=[[48, 52, 55], [60, 64, 67], [72, 76, 79]],
        pattern="low-mid-high",
        mode="tones",
        order="5-1-3",
        start=0,
    )
    assert [onset.pitches[0] for onset in lattice.onsets] == [67, 60, 64]


def test_arpeggiate_tones_mode_with_start_offset():
    lattice = Lattice(steps_per_bar=3)
    apply_arpeggiate(
        lattice,
        chord_by_register=[[48, 52, 55], [60, 64, 67], [72, 76, 79]],
        pattern="low-mid-high",
        mode="tones",
        order="5-1-3",
        start=1,
    )
    assert [onset.pitches[0] for onset in lattice.onsets] == [60, 64, 67]
