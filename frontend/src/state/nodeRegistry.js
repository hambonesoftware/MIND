const PORT_TYPES = {
  TRIGGER: 'trigger',
  SIGNAL: 'signal',
  NUMBER: 'number',
  BOOL: 'bool',
};

const NODE_REGISTRY = {
  Start: {
    label: 'Start',
    category: 'Flow',
    ports: {
      inputs: [],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.TRIGGER }],
    },
    defaultParams: {
      label: 'Start',
    },
  },
  Beat: {
    label: 'Beat',
    category: 'Rhythm',
    ports: {
      inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.TRIGGER, required: false }],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.TRIGGER }],
    },
    defaultParams: {
      pattern: 'x...x...',
      grid: '1/4',
    },
  },
  Transform: {
    label: 'Transform',
    category: 'Control',
    ports: {
      inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.SIGNAL, required: true }],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.SIGNAL }],
    },
    defaultParams: {
      operation: 'scale',
      amount: 1,
    },
  },
  Gate: {
    label: 'Gate',
    category: 'Control',
    ports: {
      inputs: [
        { id: 'signal', label: 'Signal', type: PORT_TYPES.TRIGGER, required: true },
        { id: 'gate', label: 'Gate', type: PORT_TYPES.BOOL, required: false },
      ],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.TRIGGER }],
    },
    defaultParams: {
      threshold: 0.5,
    },
  },
  Counter: {
    label: 'Counter',
    category: 'Control',
    ports: {
      inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.TRIGGER, required: true }],
      outputs: [{ id: 'count', label: 'Count', type: PORT_TYPES.NUMBER }],
    },
    defaultParams: {
      start: 0,
      step: 1,
    },
  },
  Switch: {
    label: 'Switch',
    category: 'Control',
    ports: {
      inputs: [
        { id: 'a', label: 'A', type: PORT_TYPES.SIGNAL, required: true },
        { id: 'b', label: 'B', type: PORT_TYPES.SIGNAL, required: true },
        { id: 'select', label: 'Select', type: PORT_TYPES.NUMBER, required: true },
      ],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.SIGNAL }],
    },
    defaultParams: {
      defaultIndex: 0,
    },
  },
  Render: {
    label: 'Render',
    category: 'Output',
    ports: {
      inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.SIGNAL, required: true }],
      outputs: [],
    },
    defaultParams: {
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
  return Object.keys(NODE_REGISTRY);
}

function getNodeDefinition(type) {
  return NODE_REGISTRY[type] ? clone(NODE_REGISTRY[type]) : null;
}

function getPortDefinition(nodeType, portId, direction) {
  const definition = NODE_REGISTRY[nodeType];
  if (!definition) {
    return null;
  }
  const ports = direction === 'outputs' ? definition.ports.outputs : definition.ports.inputs;
  return ports.find((port) => port.id === portId) || null;
}

function createNode(type, overrides = {}) {
  const definition = NODE_REGISTRY[type];
  if (!definition) {
    throw new Error(`Unknown node type: ${type}`);
  }
  const params = { ...definition.defaultParams, ...overrides.params };
  const ui = { x: 0, y: 0, ...overrides.ui };
  return {
    id: overrides.id || generateId(type.toLowerCase()),
    type,
    params,
    ui,
    ports: clone(definition.ports),
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
    return { ok: false, reason: 'Port types do not match.' };
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
    const definition = NODE_REGISTRY[node.type];
    if (!definition) {
      continue;
    }
    const requiredInputs = definition.ports.inputs.filter(port => port.required);
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
  NODE_REGISTRY,
  listNodeTypes,
  getNodeDefinition,
  getPortDefinition,
  createNode,
  validateConnection,
  validateRequiredInputs,
};
