# Phase 04 — Column E (Specific Risk) generation for Medium+ only

## Owner agents
- Primary: **agent_backend**
- Support: agent_qa, agent_frontend, agent_orchestrator

## Objective
Populate Column E ONLY when the risk level (F) is Medium or higher.

This phase is where “why is it risky?” becomes consistent and actionable for downstream review.

## Policy (required)
- If F is Low: **E must be blank**
- If F is Medium/High/Critical: **E must be non-empty**
- If generation fails: set E to a configurable fallback string, e.g.:
  - `"REVIEW REQUIRED: risk rationale generation failed"`
  and mark the row as `needsReview=true` in the UI payload.

## Generation strategies (choose one primary, but support future expansion)

### Option A (recommended): Retrieval-first, template fallback
1) Use a retrieval index built from training examples (D, E, F, G):
   - Find top-K most similar specs (by D text)
   - If matches exist with similar F/G, reuse/adapt E
2) If no strong match:
   - Use department-specific templates and fill variables from spec text
3) Always keep E short, specific, and actionable.

### Option B: Rule-only (fastest, lowest quality)
- Use a small ruleset per department + risk level.

### Option C: LLM (only if your app already ships an LLM component)
- Prompt using D + predicted F/G; output one sentence.
- Must be optional/offline and clearly labeled.

## Required structure of E (recommended contract)
Column E should:
- Start with the primary hazard/failure mode
- Mention impact (safety, schedule, cost, rework, compliance)
- Be 1–2 sentences max
- Avoid vague language (“could be risky”) unless tied to a concrete failure mode

## Components to touch
- A new service: `risk_description_service.py`
- The classify pipeline to call E generation after F/G are predicted
- Any retrieval/index storage if used

### Discovery queries
- `risk description`
- `rationale`
- `tfidf`
- `embedding`
- `similarity`

## Tests (must be added)
1) `test_E_blank_when_F_low()`  
2) `test_E_nonempty_when_F_medium_or_higher()`  
3) `test_E_fallback_and_needsReview_when_generator_fails()`  
4) If using retrieval: `test_retrieval_prefers_matching_FG_examples()`  

## Success checklist
- [ ] E is generated only for Medium+ rows
- [ ] Low risk rows always have E blank
- [ ] Failure mode is handled with fallback + needsReview flag
- [ ] Tests pass
