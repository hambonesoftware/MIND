# V9.5 Test Matrix

## Platforms
- Chrome Desktop (Windows)
- Chrome Mobile (Android)

## Smoke Tests
1) Page load: no repeating AudioContext warnings
2) Play: audio starts on first click
3) Stop/Play loop: repeat 5x, no dead audio
4) Transport: no `windowStartBeat is not defined`
5) Fan-out: Thought out connects to 2 thoughts; both run concurrently
6) Custom Melody: create thought, set Custom, edit rhythm, enter notes, hear melody
7) Glow: playing thought glows; fan-out → both glow
8) Moonlight template: insert, play, edit melody bar, confirm audible

## Notes / Results
(Record results here with date/time and any console snippets.)

