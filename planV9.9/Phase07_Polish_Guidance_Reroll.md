# Phase 07 — Guidance Polish + Reroll UX

## Owner agents
Primary: agent_frontend, agent_docs  
Support: agent_music_vocab, agent_qa, agent_orchestrator

## Objective
Make Beginner mode feel magical and self-explanatory:
- “What you’re hearing” micro-explainer
- Reroll changes only reroll field
- Clear rebuild feedback + empty states

---

## Additions
- What you’re hearing:
  - Role intention
  - Voice behavior
  - Pattern family description
  - Energy/Complexity summary
- Rebuild toast: “Updated: Pattern + Energy”
- Reroll button: updates reroll only; deterministic
- Optional locks: lock harmony / lock pattern / lock voice / lock motif (advanced)

---

## Testing
- Reroll changes only reroll in code
- Explainer updates with knobs
- New user can create 3 distinct thoughts fast

---

## Success checklist
- [ ] Reroll deterministic and settings-preserving
- [ ] Guidance reduces confusion
- [ ] Rebuild feedback is clear
