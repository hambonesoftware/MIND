export function buildCompilePayload({
  seed,
  bpm,
  barIndex,
  laneNodes = [],
  noteNodes = [],
  legacyNodes = [],
  useNodeGraph = false,
}) {
  if (!useNodeGraph) {
    return {
      seed,
      bpm,
      barIndex,
      nodes: legacyNodes,
    };
  }

  const nodes = [...laneNodes, ...noteNodes].sort((a, b) => a.id.localeCompare(b.id));
  return {
    seed,
    bpm,
    barIndex,
    nodes,
  };
}
