export function buildCompilePayload({
  seed,
  bpm,
  barIndex,
  laneNodes = [],
  noteNodes = [],
  legacyNodes = [],
  edges = [],
  startNodeIds = [],
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
  const uniqueStartNodeIds = Array.from(new Set(startNodeIds)).filter(Boolean);
  return {
    seed,
    bpm,
    barIndex,
    nodes,
    edges,
    startNodeIds: uniqueStartNodeIds,
  };
}
