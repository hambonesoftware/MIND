# AGENT PHASE 08 — Acceptance Demos (Moonlight + Loop + Join)

Plan reference: `phases/PHASE_08_ACCEPTANCE_DEMOS.md`

## Goal
Create canonical demo Streams that prove V9 semantics: sequencing, parallel fan-out, OR merges, explicit AND joins, loop escape via counter+switch, and instrument selection.

## Primary touch-points (MINDV8.0)
Frontend:
- Demo project files (saved graphs) stored in `assets/docs/` or `docs/demos/`
Backend:
- runtime stable enough to play demos

## Step-by-step actions
1) Create demo Stream: `moonlight_loop_v9.json`
   - Start → Moonlight_Opening_Arp Thought → Counter → Switch(loop/exit)
2) Create demo Stream: `parallel_join_v9.json`
   - Start fan-out to two Thoughts → Join → next Thought
3) Ensure each demo includes explicit SoundFont + preset (or inherits from Stream defaults).
4) Add a “How to run demos” doc and verify demo loads & plays.

## Evidence to capture
- Saved demo graph JSON files committed
- Screenshot(s): each demo loaded on canvas
- Console logs: SoundFont loaded and playback runs without errors

## Completion checklist (must be explicit)
- [ ] Moonlight loop demo plays and exits deterministically
- [ ] Parallel branch demo plays in parallel then joins
- [ ] Each demo uses instrument preset from sf2/sf3
- [ ] Demo instructions exist and are accurate


## Notes / Decisions (append as you work)
- 
