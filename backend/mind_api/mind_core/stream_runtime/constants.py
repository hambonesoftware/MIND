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
