# agent_music_vocab — Pattern Families, Contract Curation, and Style/Mood Intent (V9.10)

## Mission
Curate a pattern contract and selection rules so style + mood produce meaningful musical differences
instead of collapsing into generic arpeggios.

## Primary phases
- Phase01 (pattern contract creation/population)
- Phase04 (style/mood pattern selection biases)
- Phase06 (preset library curation)

## Inputs you rely on
- `docs/contracts/pattern_contract.v1.json` (you author/maintain)
- `frontend/src/music/catalogSnapshot.json` (authoritative style -> pattern membership)
- Existing backend generators (verified by tests like `test_style_patterns_realness.py`)

## Hard requirements
1) Every UI pattern must exist in the contract.
2) Each pattern must map to a real backend generator or an explicit alias.
3) Only ArpTexture family patterns may allow arp fallback.

## Contract authoring guidance (Phase01)

### Minimum viable families (ensure audible distinction)
Lead:
- Hook, Riff, Flowing, CallResponse, FillTransition, ArpTexture (explicit only)

Harmony:
- StabsComping, PadDrone, Pulse, Chops, StrumRoll, ArpTexture (minority)

Bass:
- RootPulse, PedalTone, OctaveBounce, Walking, SyncopBass

Drums:
- Backbeat, FourOnFloor, Breakbeat, HatsGroove, PercFill

FX:
- Swells, Risers, Drops, NoiseGate

### Alias policy
Only alias if:
- the output behavior matches the label closely
- the alias is explicit in `aliasOf`
Avoid “marketing aliases” that turn into arps.

### Capability gates
If a family depends on non-implemented generators, either:
- keep it out of UI exposure until implemented, or
- set `requiresCapability` and ensure capability is false so it cannot be selected

## Style/mood intent mapping (Phase04)
Work with agent_frontend to define:
- role-family preferences (e.g., Bass prefers Walking/Pulse)
- mood tag biases (e.g., Tense prefers staccato/pulse/gate, Dreamy prefers flowing/pad)
- style membership boundaries (Jazz includes walking bass + comping stabs)

Ensure these are testable by:
- providing a small “expected bias” table in docs (see Phase07)
- adding fixture cases to `scripts/test_style_resolver.mjs`

## Preset library (Phase06)
Curate presets to cover:
- each style: at least 3 presets (Lead, Harmony, Bass)
- drums: at least 1 groove per style group
Avoid ArpTexture except where explicitly desired.

## Deliverable checklist
- [ ] Contract file complete and internally consistent
- [ ] Families cover audible variety per role
- [ ] Alias decisions documented and justified
- [ ] Style/mood bias rules produce expected defaults (fixture tested)
- [ ] Preset library provides “golden” references for QA
