# MIND Language v0.1

MIND scripts accept a single top-level call. Today there are two forms:

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

## `equation(...)`

```
equation(
  lane="note",
  grid="1/12",
  bars="1-16",
  preset="gm:0:0",
  key="C# minor",
  harmony="1-2:i;3-4:V;5-14:VI;15-16:i",
  motions="sustain(chord); arpeggiate(grid=1/12, pattern=low-mid-high-mid)"
)
```

`equation(...)` is intent-only: it describes a harmony plan and motion
instructions. The solver turns it into events during compilation.
