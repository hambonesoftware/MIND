let currentFocusScope = '';

export const focusScope = {
  get() {
    return currentFocusScope;
  },
  set(nextScope) {
    currentFocusScope = nextScope;
  },
};

export const buildFocusKey = (keyBase) => {
  if (!keyBase) {
    return '';
  }
  const scope = focusScope.get();
  return scope ? `${scope}:${keyBase}` : keyBase;
};
