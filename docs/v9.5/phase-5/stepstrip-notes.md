# Step Strip & Rhythm Helpers

- **Interactions:** click toggles note on/off, double-click toggles a hold only when a prior note is active, and right-click clears to rest. Holds are auto-cleared if no valid note precedes them.
- **Normalization:** rhythm strings are clamped to the grid length; invalid characters are dropped and notes are synced so counts match note-on steps.
- **Presets:** 
  - Preset A seeds a “three-beat + extension + tail” shape sized to the active grid.
  - Preset B seeds four beat-aligned notes with short sustains.
- **Clipboard:** Copy/Paste use a shared clipboard across thoughts; “Copy previous” duplicates the immediate prior bar for quick chaining.
- **Notes editor:** Inputs appear only for note-on positions and stay aligned as the rhythm changes.
