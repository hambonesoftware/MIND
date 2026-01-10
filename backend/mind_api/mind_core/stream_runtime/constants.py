"""Constants for the stream runtime."""

LANE_TO_MIDI_NOTE = {
    "kick": 36,
    "snare": 38,
    "hat": 42,
    "note": 60,
}

ALLOWED_GRIDS = {"1/4", "1/8", "1/12", "1/16", "1/24"}

MAX_NODE_FIRINGS_PER_BAR = 256
MAX_TOKENS_PER_BAR = 512
DEFAULT_PATTERN_FAMILY = ("low-mid-high",)
PATTERN_TYPE_BY_NOTE_ID = {
    "simple_arpeggio": "arp-3-up",
    "descending_arpeggio": "arp-3-down",
    "skipping_arpeggio": "arp-3-skip",
    "sustain_drone": "arp-3-down",
    "offbeat_plucks": "arp-3-up",
    "swing_response": "arp-3-down",
    "latin_clave": "arp-3-up",
    "folk_roll": "arp-3-up",
    "airy_arp": "arp-3-up",
    "grit_riff": "arp-3-skip",
    "walking_bass": "arp-3-down",
    "montuno_pattern": "arp-3-up",
    "travis_pick": "arp-3-down",
    "alberti_bass": "arp-3-up",
    "ostinato_pulse": "arp-3-up",
    "step_arp_octave": "arp-3-up",
}
