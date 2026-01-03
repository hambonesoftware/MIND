const PORT_TYPES = {
  EVENTS: 'events',
  CONTROL: 'control',
  AUDIO_OUT: 'audioOut',
  THEORY: 'theory',
};

const nodeRegistry = {
  Start: {
    label: 'Start',
    category: 'Flow',
    inputs: [],
    outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.EVENTS }],
    paramSchema: {},
    defaults: {
      label: 'Start',
    },
  },
  Beat: {
    label: 'Beat',
    category: 'Rhythm',
    inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.EVENTS, required: false }],
    outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.EVENTS }],
    paramSchema: {
      pattern: { type: 'string' },
      grid: { type: 'string' },
    },
    defaults: {
      pattern: 'x...x...',
      grid: '1/4',
    },
  },
  Transform: {
    label: 'Transform',
    category: 'Control',
    inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.EVENTS, required: true }],
    outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.EVENTS }],
    paramSchema: {
      mode: { type: 'string' },
      amount: { type: 'number' },
    },
    defaults: {
      mode: 'arpeggiate',
      amount: 1,
    },
  },
  Gate: {
    label: 'Gate',
    category: 'Control',
    inputs: [
      { id: 'signal', label: 'Signal', type: PORT_TYPES.EVENTS, required: true },
      { id: 'gate', label: 'Gate', type: PORT_TYPES.CONTROL, required: false },
    ],
    outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.EVENTS }],
    paramSchema: {
      threshold: { type: 'number' },
    },
    defaults: {
      threshold: 0.5,
    },
  },
  Counter: {
    label: 'Counter',
    category: 'Control',
    inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.EVENTS, required: true }],
    outputs: [{ id: 'count', label: 'Count', type: PORT_TYPES.CONTROL }],
    paramSchema: {
      start: { type: 'number' },
      step: { type: 'number' },
    },
    defaults: {
      start: 0,
      step: 1,
    },
  },
  Switch: {
    label: 'Switch',
    category: 'Control',
    inputs: [
      { id: 'a', label: 'A', type: PORT_TYPES.CONTROL, required: true },
      { id: 'b', label: 'B', type: PORT_TYPES.CONTROL, required: true },
      { id: 'select', label: 'Select', type: PORT_TYPES.CONTROL, required: true },
    ],
    outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.CONTROL }],
    paramSchema: {
      defaultIndex: { type: 'number' },
    },
    defaults: {
      defaultIndex: 0,
    },
  },
  Render: {
    label: 'Render',
    category: 'Output',
    inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.EVENTS, required: true }],
    outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.AUDIO_OUT }],
    paramSchema: {
      output: { type: 'string' },
    },
    defaults: {
      output: 'main',
    },
  },
};

function clone(value) {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function generateId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function listNodeTypes() {
  return Object.keys(nodeRegistry);
}

function getNodeDefinition(type) {
  return nodeRegistry[type] ? clone(nodeRegistry[type]) : null;
}

function getPortDefinition(nodeType, portId, direction) {
  const definition = nodeRegistry[nodeType];
  if (!definition) {
    return null;
  }
  const ports = direction === 'outputs' ? definition.outputs : definition.inputs;
  return ports.find((port) => port.id === portId) || null;
}

function createNode(type, overrides = {}) {
  const definition = nodeRegistry[type];
  if (!definition) {
    throw new Error(`Unknown node type: ${type}`);
  }
  const params = { ...definition.defaults, ...overrides.params };
  const ui = { x: 0, y: 0, ...overrides.ui };
  return {
    id: overrides.id || generateId(type.toLowerCase()),
    type,
    params,
    ui,
    ports: {
      inputs: clone(definition.inputs),
      outputs: clone(definition.outputs),
    },
  };
}

function validateConnection({ fromType, fromPortId, toType, toPortId }) {
  const fromPort = getPortDefinition(fromType, fromPortId, 'outputs');
  if (!fromPort) {
    return { ok: false, reason: 'Unknown source port.' };
  }
  const toPort = getPortDefinition(toType, toPortId, 'inputs');
  if (!toPort) {
    return { ok: false, reason: 'Unknown target port.' };
  }
  if (fromPort.type !== toPort.type) {
    return {
      ok: false,
      reason: `Port types do not match (${fromPort.type} -> ${toPort.type}).`,
    };
  }
  return { ok: true };
}

function validateRequiredInputs(nodes, edges) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const edgesByTarget = new Map();
  for (const edge of edges) {
    const target = edge.to?.nodeId;
    if (!target) {
      continue;
    }
    if (!edgesByTarget.has(target)) {
      edgesByTarget.set(target, []);
    }
    edgesByTarget.get(target).push(edge);
  }
  const missing = [];
  for (const node of nodes) {
    const definition = nodeRegistry[node.type];
    if (!definition) {
      continue;
    }
    const requiredInputs = definition.inputs.filter(port => port.required);
    for (const input of requiredInputs) {
      const connected = (edgesByTarget.get(node.id) || []).some(edge => edge.to?.portId === input.id);
      if (!connected) {
        missing.push({ nodeId: node.id, portId: input.id, nodeType: node.type });
      }
    }
  }
  return {
    ok: missing.length === 0,
    missing,
    nodeMap,
  };
}

export {
  PORT_TYPES,
  nodeRegistry,
  listNodeTypes,
  getNodeDefinition,
  getPortDefinition,
  createNode,
  validateConnection,
  validateRequiredInputs,
};
