# Agent — QA, Refactor, and Release Gates

## Mission
Ensure final release gates are enforced:
- file length <= 1000 lines
- audits clean
- no regressions

## Key tool
- `scripts/audit_file_lengths.mjs`

## Guidance
- Start refactoring large files earlier (Phase06) so Phase08 is not a cliff.
- Preferred refactor pattern:
  - `ui/inspector/*`
  - `ui/thoughtWizard/steps/*`
  - `audio/thoughtPreview/*`

## Verification
Run all Phase08 commands.
