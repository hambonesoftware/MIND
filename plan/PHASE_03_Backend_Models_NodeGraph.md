# PHASE_03 — Backend models: support Render/Theory node inputs + render specs

Agent reference (assumed to exist):
- `agents/phase_03_backend_models_rendernode.md`

## Goal
Update FastAPI request/response models so `/api/compile` accepts a node graph:
- `NodeInput.kind` discriminates theory vs render
- Render nodes include `childId` and `render` settings
- Maintain backward compatibility: existing payloads still validate

## Scope
Models only. No compiler behavior change yet (Phase 04).

## Files to change / create (backend)
### Modify
- `backend/mind_api/models.py`

### Optional (recommended)
- `backend/mind_api/routes.py` (if strict validation assumes old fields)

## Implementation steps
### 1) Update NodeInput
Currently `NodeInput` is likely `{id, text, enabled, ...}`.
Change it to accept:
- `kind: Literal["theory","render"] = "theory"`
- `text: Optional[str] = None`
- `childId: Optional[str] = None`
- `render: Optional[RenderSpec] = None`
- Keep `enabled` and `lane` fields (if you have them)

Validation rules (Pydantic validators):
- If `kind=="theory"`:
  - require `text` non-empty
- If `kind=="render"`:
  - require `childId` non-empty
  - require `render` not None (or allow empty render for identity wrapper)

### 2) Add RenderSpec models
Define structured models:
- `StrumSpec`:
  - `enabled: bool`
  - `grid: str` (default to child grid if not set)
  - `directionByStep: str` (ex "DUDUDUDU")
  - `spreadMs: int`
- `PercSpec`:
  - `enabled: bool`
  - `grid: str`
  - `kick: str`
  - `snare: str`
  - `hat: str`

- `RenderSpec`:
  - `strum: Optional[StrumSpec]`
  - `perc: Optional[PercSpec]`

### 3) Backward compatibility
If older clients send nodes without `kind`:
- default `kind="theory"`
If older clients send `text` always:
- allow it and ignore for render nodes

### 4) Add debug toggles (recommended)
In `CompileRequest`:
- `debug: bool = False`
In `CompileResponse`:
- `debugText: Optional[str]`
- `debugLattice: Optional[dict]`

This is invaluable for proving render transforms and later equation solving.

## Success checklist
- [ ] Existing compile payload validates unchanged
- [ ] New payload with render/theory nodes validates
- [ ] Invalid render node (missing childId) yields a clear validation error
- [ ] Invalid theory node (missing text) yields a clear validation error
- [ ] Debug fields are optional and do not break existing clients

## Unit testing / verification
Add pytest now (recommended).

### Create (backend)
- `backend/tests/test_models_nodeinput.py`

### Test cases
- Theory node without kind (legacy) validates
- Render node validates with childId + render spec
- Render node missing childId fails
- Theory node missing text fails

Run:
- From repo root: `python -m pytest -q`

If you don’t yet have pytest in requirements:
- Add `pytest` to `requirements.txt` or create `backend/requirements-dev.txt`.
