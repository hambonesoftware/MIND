"""backend/mind_api/mind_core/immutables.py

Canonical key strings and version constants used across backend.
Keep this in sync with frontend/src/music/immutables.js.
"""

PROTOCOL_VERSION = "1.0"
GRAPH_VERSION = "9.11"
RESOLVER_VERSION = "9.11.0"

THOUGHT_INTENT_KEYS = {
    "ROOT": "intent",
    "GOAL": "goal",
    "ROLE": "role",
    "STYLE_ID": "styleId",
    "MOOD_ID": "moodId",
    "MOTION_ID": "motionId",
    "DENSITY": "density",
    "HARMONY_BEHAVIOR": "harmonyBehavior",
    "SOUND_COLOR": "soundColor",
    "SEED": "seed",
    "LOCKS": "locks",
}

THOUGHT_COMPILED_KEYS = {
    "ROOT": "compiled",
    "RESOLVER_VERSION": "resolverVersion",
    "NOTE_PATTERN_ID": "notePatternId",
    "RHYTHM_GRID": "rhythmGrid",
    "SYNCOPATION": "syncopation",
    "TIMING_WARP": "timingWarp",
    "TIMING_INTENSITY": "timingIntensity",
    "INSTRUMENT_PRESET": "instrumentPreset",
    "REGISTER_MIN": "registerMin",
    "REGISTER_MAX": "registerMax",
    "PRESET_CODE": "presetCode",
    "ARTIFACT": "artifact",
}

def dump_immutables():
    return {
        "PROTOCOL_VERSION": PROTOCOL_VERSION,
        "GRAPH_VERSION": GRAPH_VERSION,
        "RESOLVER_VERSION": RESOLVER_VERSION,
        "THOUGHT_INTENT_KEYS": THOUGHT_INTENT_KEYS,
        "THOUGHT_COMPILED_KEYS": THOUGHT_COMPILED_KEYS,
    }

if __name__ == "__main__":
    import json
    print(json.dumps(dump_immutables(), sort_keys=True))
