export function createNodeCard({ id = '', lane = '' } = {}) {
  return {
    id,
    lane,
    updatePlayhead: () => {},
    latch: () => {},
    toNodeInput: () => ({ id, lane }),
  };
}
