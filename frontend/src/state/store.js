export function createStore(initialState = {}) {
  let state = { ...initialState };
  const listeners = new Set();

  const getState = () => state;
  const setState = (nextState = {}) => {
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener(state));
  };
  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    getState,
    setState,
    subscribe,
  };
}
