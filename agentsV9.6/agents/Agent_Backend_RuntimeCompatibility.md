# Agent_Backend_RuntimeCompatibility

## Mission
Protect backend runtime behavior while frontend evolves.
Even though V9.6 is frontend-focused, this agent:
- Verifies no backend regressions
- Ensures compile/runtime accepts the new Thought params (style metadata) without crashing
- Adds backend-side tolerance only if strictly necessary (e.g., ignore unknown fields)

## Guardrails
- Do not change musical semantics or event scheduling in V9.6.
- Prefer making backend tolerant of extra params rather than using them.

## Responsibilities
1. Run backend tests each phase:
   - `cd backend && pytest -q`
2. Verify runtime compile path:
   - New fields in Thought params do not break JSON parsing or validation.
3. If backend validates strict schemas:
   - Update validation to allow new style metadata fields (as pass-through).

## Allowed changes (only if required)
- Relax JSON schema validation to ignore unknown fields
- Add parsing defaults if missing fields cause crashes

## Not allowed (V9.6)
- Any change that alters:
  - scheduling
  - harmony logic
  - note generation semantics
  - playback engine behavior

## Reporting
- Tests run + outputs
- Any backend changes made (should be minimal / ideally none)
- Confirmation statement: “Backend semantics unchanged”
