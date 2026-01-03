export function buildCompilePayload({
  seed,
  bpm,
  barIndex,
  beatStart,
  beatEnd,
  flowGraph,
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
      beatStart,
      beatEnd,
      flowGraph,
      nodes: legacyNodes,
    };
  }

  const nodes = [...laneNodes, ...noteNodes].sort((a, b) => a.id.localeCompare(b.id));
  const uniqueStartNodeIds = Array.from(new Set(startNodeIds)).filter(Boolean);
  return {
    seed,
    bpm,
    barIndex,
    beatStart,
    beatEnd,
    flowGraph,
    nodes,
    edges,
    startNodeIds: uniqueStartNodeIds,
  };
}
