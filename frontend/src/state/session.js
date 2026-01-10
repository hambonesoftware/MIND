const DEFAULT_SESSION_STATE = Object.freeze({
  userId: null,
  workspaceId: null,
});

export function createSessionState(overrides = {}) {
  return { ...DEFAULT_SESSION_STATE, ...overrides };
}
