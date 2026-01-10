import { buildPortsForNode } from '../../state/nodeRegistry.js';

const DEFAULT_UI = { x: 0, y: 0 };

const buildFlowPort = (id, label, direction = 'in') => ({
  id,
  label,
  type: 'flow',
  required: direction === 'in',
});

export function buildPreviewGraph({ thoughtId = 'preview-thought', params = {}, ui } = {}) {
  const startId = `preview-start-${thoughtId}`;
  const endId = `preview-end-${thoughtId}`;
  const thoughtPorts = buildPortsForNode('thought', params);
  const startPorts = buildPortsForNode('start', { label: 'Start' });
  const endPorts = {
    inputs: [buildFlowPort('in', 'In')],
    outputs: [],
  };

  return {
    graphVersion: 9,
    nodes: [
      {
        id: startId,
        type: 'start',
        params: { label: 'Start' },
        ui: { ...DEFAULT_UI },
        ports: startPorts,
      },
      {
        id: thoughtId,
        type: 'thought',
        params,
        ui: ui || { ...DEFAULT_UI },
        ports: thoughtPorts,
      },
      {
        id: endId,
        type: 'end',
        params: { label: 'End' },
        ui: { ...DEFAULT_UI },
        ports: endPorts,
      },
    ],
    edges: [
      {
        id: `preview-edge-${thoughtId}`,
        from: { nodeId: startId, portId: 'out' },
        to: { nodeId: thoughtId, portId: 'in' },
      },
      {
        id: `preview-edge-${thoughtId}-end`,
        from: { nodeId: thoughtId, portId: 'out' },
        to: { nodeId: endId, portId: 'in' },
      },
    ],
  };
}
