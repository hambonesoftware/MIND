import { normalizeMusicThoughtParams } from '../music/normalizeThought.js';
import { resolveMusicThought } from '../music/resolveThought.js';

const normalizeFlowGraph = (flowGraph) => {
  if (!flowGraph || !Array.isArray(flowGraph.nodes)) {
    return flowGraph;
  }
  const nodes = flowGraph.nodes.map((node) => {
    if (node.type !== 'thought') {
      return node;
    }
    const canon = normalizeMusicThoughtParams(node.params || {});
    const { resolved, flat } = resolveMusicThought(canon, { nodeId: node.id });
    return {
      ...node,
      params: {
        ...canon,
        ...flat,
        resolved,
      },
    };
  });
  return {
    ...flowGraph,
    nodes,
  };
};

export function buildCompilePayload({
  seed,
  bpm,
  barIndex,
  beatStart,
  beatEnd,
  flowGraph,
  runtimeState,
  laneNodes = [],
  noteNodes = [],
  legacyNodes = [],
  edges = [],
  startNodeIds = [],
  useNodeGraph = false,
}) {
  const normalizedFlowGraph = normalizeFlowGraph(flowGraph);
  if (!useNodeGraph) {
    return {
      seed,
      bpm,
      barIndex,
      beatStart,
      beatEnd,
      flowGraph: normalizedFlowGraph,
      runtimeState,
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
    flowGraph: normalizedFlowGraph,
    runtimeState,
    nodes,
    edges,
    startNodeIds: uniqueStartNodeIds,
  };
}
