# AGENT PHASE 05 — Musical Thought V9 + Instrument from sf2/sf3

Plan reference: `phases/PHASE_05_MUSICAL_THOUGHT_AND_INSTRUMENT.md`

## Goal
Implement the V9 Musical Thought authoring model, including the required instrument selection from SoundFont (sf2/sf3). Thoughts generate note events aligned to the Stream master clock.

## Primary touch-points (MINDV8.0)
Frontend:
- `frontend/src/ui/flowInspector.js` (Thought inspector fields)
- `frontend/src/ui/nodeCard.js` (instrument chip display)
- `frontend/src/audio/*` (engine preset selection)
Assets:
- `assets/soundfonts/` (sf2/sf3 files)
Backend:
- runtime event generator for patterns + rhythm + syncopation + timing warp

## Step-by-step actions
1) Add Thought fields per spec:
   - key, chord root/source, pattern type, rhythm, syncopation, timing warp, register, duration
   - **soundfont** and **preset** selection (sf2/sf3)
2) Implement preset picker UI:
   - search + category + list (can be minimal V1 but usable)
   - inherit defaults from Stream where available
3) Ensure engine can load sf2/sf3 and select bank/program:
   - verify SpessaSynth path (sf2/sf3 support)
4) Produce a “Moonlight Opening Arp” Thought:
   - key C# minor, chord C# minor, pattern low→mid→high, rhythm triplet 1/12
   - instrument: piano preset from SF
5) Verify Thought produces stable events and audio output.

## Evidence to capture
- Screenshot: Thought inspector with SoundFont + preset picker
- Console log confirming SoundFont loaded
- Audio preview from the Thought inside a Stream

## Completion checklist (must be explicit)
- [ ] Musical Thought fields exist and persist in graph
- [ ] Instrument selection from sf2/sf3 is required (or inherited) and functional
- [ ] SoundFont load is logged in console
- [ ] Moonlight Opening Arp Thought plays correctly in triplets


## Notes / Decisions (append as you work)
- 
