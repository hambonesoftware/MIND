# Runtime and Timing

MIND compiles events in **beats**, not seconds. Each event contains:

- `tBeat`: offset within the bar (0–4 in 4/4)
- `durationBeats`: duration in beats
- `lane`: target lane (`kick`, `snare`, `hat`, `note`)
- `pitches`: MIDI pitches for chords or single notes

## Bar loop

- The transport runs a 16‑bar loop.
- The compiler is called once per bar.
- Pending edits latch at bar boundaries.

## Render chain timing

Render transforms operate on already-compiled events:

1. Compile child events (theory node).
2. Apply strum transform (stagger chord onsets).
3. Apply percussion transform (mask → drum hits).
4. Sort deterministically by `(tBeat, pitch, lane)`.

## Debugging

Enable `debug` in the compile request to get a textual summary of traversal
and event counts in the compile response (`debugText`).
