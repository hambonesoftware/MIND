# Licensing and Credits

This project is a pedagogical implementation of the MIND Studio sequencer.
It builds upon open–source frameworks and assets to provide a minimal yet
functional environment for experimenting with the MIND language.  The
following sections document the provenance of third‑party materials and
the licenses under which they are distributed.

## Backend and Frameworks

The backend server is implemented using [FastAPI](https://fastapi.tiangolo.com/),
which is licensed under the **MIT License**, and [Uvicorn](https://www.uvicorn.org/),
licensed under the **BSD License**.  These packages are installed via
`requirements.txt` and subject to their respective licenses.  The data
model uses [Pydantic](https://docs.pydantic.dev/), licensed under the
**MIT License**.

## Frontend Libraries

The frontend is written in plain JavaScript and does not depend on
external frameworks.  The CSS styling is custom and may be reused
under the terms of the repository license.

## Sound assets

Version 0.3 ships with the full **GeneralUser GS** soundfont.  The file
`assets/soundfonts/GeneralUser-GS.sf2` is copied from the official
distribution provided by **S. Christian Collins**.  The soundfont is
used by the browser‑based synthesiser to render General MIDI
instruments on the fly.  It is distributed under the **Creative
Commons Attribution 3.0 Unported** licence, which permits
redistribution and adaptation provided proper attribution is given.
See the [GeneralUser GS page](https://schristiancollins.com/generaluser.php)
for full licence text and acknowledgements.  In the context of MIND
the soundfont is loaded locally and never transmitted over the
network.

For browsers that do not support the WebAssembly‑based synthesiser or
if the soundfont cannot be loaded for any reason, the application
includes a small set of fallback WAV samples under
`assets/instruments/`.  These samples (kick, snare, hi‑hat and piano)
are procedurally generated and distributed under the same licence as
the rest of this repository.

## Credits

- **MIND language**: The syntax and semantics of the MIND language were
  devised by the original authors of this repository.  The compiler
  and parser included here are simplified for instructional purposes.
– **GeneralUser GS** – A General MIDI/GS compatible soundfont by
  **S. Christian Collins**.  The complete `GeneralUser‑GS.sf2` is
  bundled with this project as of v0.3.  Please consult the
  [licence and credits page](https://schristiancollins.com/generaluser.php)
  for details.
