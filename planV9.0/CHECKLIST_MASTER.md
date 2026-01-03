# Master Completion Checklist — MINDV9.0

Use this to verify overall upgrade completion.

## A. App boots + baseline regression
- [ ] `python run.py` starts without errors
- [ ] Frontend loads (no blank screen)
- [ ] Existing V8 demo project (if any) still loads (migration allowed)
- [ ] Audio engine initializes and SoundFont loads (dev console shows load)

## B. V9 graph semantics implemented
- [ ] Stream is the canvas + runtime (no separate MindFlow entity required to author/play)
- [ ] Fan-out activates parallel downstream nodes
- [ ] Merge is OR by default (loops do not deadlock)
- [ ] AND behavior exists via explicit Join/Barrier node
- [ ] Cycles are allowed (no “cycle detected” hard error in normal use)

## C. Logic Thoughts
- [ ] Start node works as entry marker
- [ ] Counter increments on enter (0→1 on first hit), resets on Play
- [ ] Switch supports branch table UI, First Match mode, Default branch, and Counter-based conditions
- [ ] Join shows waiting status and fires after all inputs complete

## D. Musical Thoughts
- [ ] Thought inspector supports: key, chord root/inherit, pattern type, rhythm, syncopation, timing warp, register, duration
- [ ] Thought includes **instrument selection** from sf2/sf3 SoundFont presets
- [ ] Thought can be auditioned without embedding in a full graph (via Rivulet)

## E. Rivulet Lab Preview
- [ ] Docked above canvas; supports play/stop/loop for the selected Thought
- [ ] Harness overrides: tempo, key/chord, bars, register, seed, soundfont+instrument
- [ ] Mini visualization + readiness checks (range, in-key, stuck notes, event spam, determinism)
- [ ] Publish flow: Draft → Published + version tag

## F. Diagnostics + Debuggability
- [ ] Per-bar debug trace exists (token movements + branch decisions)
- [ ] UI highlights active nodes/edges during playback
- [ ] Safety caps prevent infinite-loop crash (max firings/tokens per bar)

## G. Acceptance demos
- [ ] Moonlight Opening Arp Thought built from dropdowns:
      Triplet 1/12 rhythm + 3-step low→mid→high arpeggio + piano preset
- [ ] Loop N times then exit demo graph works deterministically
- [ ] Parallel branch + Join sync demo works deterministically

