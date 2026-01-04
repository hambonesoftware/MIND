# MIND Language v0.1

MIND scripts accept a single top-level call. Today the supported form is:

## `beat(...)`

```
beat(<lane>, "<pattern>", grid="<division>", bars="<start-end>", preset="<id>",
     notes="<chord>", poly="<mono|poly|choke>", sequence="<melodic sequence>")
```

- **lane**: `kick`, `snare`, `hat`, or `note`
- **pattern**: digits `0–9` for hits, `.` for rests, `-` for sustain
- **grid**: `1/4`, `1/8`, `1/12`, `1/16`, `1/24`
- **bars**: active range (e.g., `1-4`)
- **preset**: optional preset identifier
- **notes**: chord tones for the melodic lane (e.g., `C4:E4:G4`)
- **poly**: polyphony policy
- **sequence**: deterministic melodic stepping sequence

Example:

```
beat(note, "9...", grid="1/4", bars="1-16", preset="gm_piano", notes="C4:E4:G4")
```

## `equation` (removed)

`equation` was removed in MIND V9. Use FlowGraph v9 for runtime graphs or
`beat(...)` for legacy scripting.
