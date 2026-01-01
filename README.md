# MIND (Musical Interface Node Design)

This repository contains a minimal yet functional implementation of the
MIND Studio (v0.3).  It consists of a FastAPI backend that exposes
simple parsing and compilation endpoints and serves a browser based
frontend for editing and playing rhythmic patterns.  Version 0.3.1
introduces chord support in the melodic lane and an integrated
audio engine with support for the bundled **General GS** SoundFont.
The application attempts to load
``assets/soundfonts/General-GS.sf2`` using a WebAssembly–based
soundfont engine and falls back to a small set of sample recordings
when necessary.  Progress and status of the audio engine are visible
in the transport bar at the top of the page.

## Run locally

You need Python 3.11 or later.  Install the dependencies from
`requirements.txt` and then run the application using the provided
``run.py`` entry point from the project root:

```bash
pip install -r requirements.txt
python run.py
```

This starts the backend on [http://localhost:8000](http://localhost:8000) and also serves the
frontend.  There is no separate frontend dev server; FastAPI serves
the static files directly.  During development you can still use the
shell scripts under `scripts/` for hot‑reloading behaviour if
desired.

Open the URL in a modern browser (Chrome/Edge/Safari).  Press **Play**
to begin the bar clock.  You can edit the scripts in each node; when
you stop typing the node enters **Pending** state and latches at the
next bar boundary.  Use the **Latch** button to immediately latch
all pending edits while stopped.  The playhead moves across the bar
visualisation and pulses show where hits occur.

## Demo workspaces

The melodic lane supports **Theory** and **Render** blocks. Theory blocks
contain scripts (including `equation(...)`), while render blocks wrap a
single theory block and apply gesture transforms (strum/percussion).

Use **Load Demo Workspace** in the transport bar to load:

- **Moonlight** (equation + arpeggiate motion)
- **Wonderwall (Oasis)** (sustain + strum + percussion)
- **Wonderwall (Ryan)** (sustain + arpeggiate motion)

After loading a demo, press **Play** to hear the result.

This version bundles the **General GS** soundfont under
``assets/soundfonts/General-GS.sf2``.  A simple WebAssembly‑based
engine streams and caches this file on first load.  If the soundfont
cannot be loaded (for example, in browsers without `ReadableStream`
support) the engine gracefully falls back to a handful of short WAV
samples.  You can experiment with alternative soundfonts by placing
another `.sf2` file in `assets/soundfonts` (and updating the code if
needed) and dropping any required `.wasm` modules into
`assets/wasm`.

## MIND language quickstart

Scripts consist of a single call to the `beat` function:

```
beat(<lane>, "<pattern>", grid="<division>", bars="<start-end>", preset="<id>")
```

- **lane** – one of `kick`, `snare`, `hat` or `note`.
- **pattern** – string of dots (`.`) and digits `0–9`; digits trigger hits with intensity and dots are rests.  Optional spaces and `|` characters are ignored.
- **grid** – subdivision of the bar: `1/4`, `1/8` or `1/16` (default `1/4`).
- **bars** – active bar range in the 16‑bar loop (e.g. `1-4`).
- **preset** – a preset ID from `/api/presets`.
 - **notes** – *(melodic lane only, v0.3.1+)* a colon‑separated list of
   pitches.  Each token may be a MIDI number (0–127) or a note name
   consisting of a letter `A–G`, optional accidental (`#`/`b`) and
   octave (e.g. `C4`, `D#3`, `Bb2`).  When omitted the melodic lane
   defaults to `C4` and drum lanes ignore this argument.
 - **poly** – *(v0.3.2)* polyphony policy for the node.  Accepts one of:
   `mono`, `poly` or `choke`.  The default `poly` allows overlapping
   events.  `mono` shortens each event so it ends before the next hit on
   the same lane, preventing overlapping notes.  `choke` behaves like
   `mono` for the hi‑hat lane (hats cut hats) but leaves other lanes
   unaffected.
 - **sequence** – *(melodic lane only, v0.3.2)* a whitespace‑separated
   list of pitches (note names or MIDI numbers) that enables melodic
   stepping.  Each hit advances deterministically through the sequence.
   For example `sequence="C4 D4 E4 G4"` or `sequence="60 62 64 67"`.
   When `sequence` is provided each hit outputs a single pitch from
   the sequence; the `notes` argument is ignored.

For example, a simple kick pattern hitting on the first beat of every
bar:

```
beat(kick, "9...", grid="1/4", bars="1-16", preset="gm_kick")
```

Adjust the pattern and grid to create more complex rhythms.  The
compiler truncates or repeats the pattern to match the number of
steps required by the grid.

To specify chords on the melodic lane provide a `notes` argument.  The
following example plays a C‑major triad (C4–E4–G4) on every quarter
note:

```
beat(note, "9...", grid="1/4", bars="1-16", notes="C4:E4:G4", preset="gm_piano")
```

### Equation scripts

```
equation(lane="note", grid="1/12", bars="1-16", preset="gm:0:0", key="C# minor",
         harmony="1-2:i;3-4:V;5-14:VI;15-16:i",
         motions="sustain(chord); arpeggiate(grid=1/12, pattern=low-mid-high-mid)")
```

Equation nodes describe intent and are solved into events during compilation.
