import assert from 'node:assert/strict';
import { buildPreviewGraph } from '../buildPreviewGraph.js';

function findNode(nodes, type) {
  return nodes.find(node => node.type === type);
}

export function runBuildPreviewGraphTest() {
  const params = { durationBars: 4, label: 'Test Thought' };
  const graph = buildPreviewGraph({ thoughtId: 'thought-1', params });

  assert.equal(graph.graphVersion, 9);
  assert.ok(Array.isArray(graph.nodes));
  assert.ok(Array.isArray(graph.edges));

  const startNode = findNode(graph.nodes, 'start');
  const thoughtNode = findNode(graph.nodes, 'thought');
  const endNode = findNode(graph.nodes, 'end');

  assert.ok(startNode, 'Start node missing');
  assert.ok(thoughtNode, 'Thought node missing');
  assert.ok(endNode, 'End node missing');

  assert.equal(thoughtNode.id, 'thought-1');
  assert.equal(thoughtNode.params.durationBars, 4);

  const edgeStartToThought = graph.edges.find(
    edge => edge.from?.nodeId === startNode.id && edge.to?.nodeId === thoughtNode.id,
  );
  const edgeThoughtToEnd = graph.edges.find(
    edge => edge.from?.nodeId === thoughtNode.id && edge.to?.nodeId === endNode.id,
  );

  assert.ok(edgeStartToThought, 'Expected Start -> Thought edge');
  assert.ok(edgeThoughtToEnd, 'Expected Thought -> End edge');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runBuildPreviewGraphTest();
  console.log('test_buildPreviewGraph: ok');
}
