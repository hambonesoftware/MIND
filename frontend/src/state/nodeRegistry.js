const PORT_TYPES = {
  FLOW: 'flow',
  EVENTS: 'events',
};

const nodeRegistry = {
  start: {
    label: 'Start',
    category: 'Logic Thoughts',
    paramSchema: {
      label: { type: 'string' },
    },
    defaults: {
      label: 'Start',
    },
    ports: {
      inputs: [],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.FLOW }],
    },
  },
  thought: {
    label: 'Thought',
    category: 'Musical Thoughts',
    paramSchema: {
      label: { type: 'string' },
      durationBars: { type: 'number' },
      key: { type: 'string' },
      chordRoot: { type: 'string' },
      chordQuality: { type: 'string' },
      chordNotes: { type: 'string' },
      patternType: { type: 'string' },
      rhythmGrid: { type: 'string' },
      syncopation: { type: 'string' },
      timingWarp: { type: 'string' },
      timingIntensity: { type: 'number' },
      registerMin: { type: 'number' },
      registerMax: { type: 'number' },
      instrumentSoundfont: { type: 'string' },
      instrumentPreset: { type: 'string' },
      thoughtStatus: { type: 'string' },
      thoughtVersion: { type: 'number' },
    },
    defaults: {
      label: 'Thought',
      durationBars: 1,
      key: 'C# minor',
      chordRoot: 'C#',
      chordQuality: 'minor',
      chordNotes: '',
      patternType: 'arp-3-up',
      rhythmGrid: '1/12',
      syncopation: 'none',
      timingWarp: 'none',
      timingIntensity: 0.0,
      registerMin: 48,
      registerMax: 84,
      instrumentSoundfont: '/assets/soundfonts/General-GS.sf2',
      instrumentPreset: 'gm:0:0',
      thoughtStatus: 'draft',
      thoughtVersion: 1,
    },
    ports: {
      inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.FLOW, required: true }],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.FLOW }],
    },
  },
  counter: {
    label: 'Counter',
    category: 'Logic Thoughts',
    paramSchema: {
      label: { type: 'string' },
      start: { type: 'number' },
      step: { type: 'number' },
    },
    defaults: {
      label: 'Counter',
      start: 0,
      step: 1,
      resetOnPlay: true,
    },
    ports: {
      inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.FLOW, required: true }],
      outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.FLOW }],
    },
  },
  switch: {
    label: 'Switch',
    category: 'Logic Thoughts',
    paramSchema: {
      label: { type: 'string' },
      mode: { type: 'string' },
      defaultBranch: { type: 'string' },
      manualSelection: { type: 'string' },
    },
    defaults: {
      label: 'Switch',
      mode: 'first',
      defaultBranch: 'default',
      manualSelection: '',
      branches: [
        {
          id: 'branch-1',
          label: 'Branch 1',
          condition: { type: 'always', value: true },
        },
        {
          id: 'branch-2',
          label: 'Branch 2',
          condition: { type: 'always', value: false },
        },
      ],
    },
    portBuilder: (params) => {
      const branches = Array.isArray(params.branches) ? params.branches : [];
      const outputs = branches.map((branch) => ({
        id: branch.id,
        label: branch.label || branch.id,
        type: PORT_TYPES.FLOW,
      }));
      outputs.push({ id: 'default', label: 'Default', type: PORT_TYPES.FLOW });
      return {
        inputs: [{ id: 'in', label: 'In', type: PORT_TYPES.FLOW, required: true }],
        outputs,
      };
    },
  },
  join: {
    label: 'Join',
    category: 'Logic Thoughts',
    paramSchema: {
      label: { type: 'string' },
      inputCount: { type: 'number' },
      quantize: { type: 'string' },
    },
    defaults: {
      label: 'Join',
      inputCount: 2,
      quantize: 'next-bar',
    },
    portBuilder: (params) => {
      const inputCount = Math.max(1, Math.floor(params.inputCount ?? 2));
      const inputs = [];
      for (let idx = 1; idx <= inputCount; idx += 1) {
        inputs.push({
          id: `in-${idx}`,
          label: `In ${idx}`,
          type: PORT_TYPES.FLOW,
          required: true,
        });
      }
      return {
        inputs,
        outputs: [{ id: 'out', label: 'Out', type: PORT_TYPES.FLOW }],
      };
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

function buildPortsForNode(type, params = {}) {
  const definition = nodeRegistry[type];
  if (!definition) {
    return { inputs: [], outputs: [] };
  }
  if (typeof definition.portBuilder === 'function') {
    return definition.portBuilder(params || {});
  }
  return clone(definition.ports || { inputs: [], outputs: [] });
}

function getPortDefinition(nodeType, portId, direction, params = {}) {
  const ports = buildPortsForNode(nodeType, params);
  const list = direction === 'outputs' ? ports.outputs : ports.inputs;
  return list.find((port) => port.id === portId) || null;
}

function createNode(type, overrides = {}) {
  const definition = nodeRegistry[type];
  if (!definition) {
    throw new Error(`Unknown node type: ${type}`);
  }
  const params = { ...definition.defaults, ...overrides.params };
  const ui = { x: 0, y: 0, ...overrides.ui };
  const ports = overrides.ports || buildPortsForNode(type, params);
  return {
    id: overrides.id || generateId(type.toLowerCase()),
    type,
    params,
    ui,
    ports: {
      inputs: clone(ports.inputs || []),
      outputs: clone(ports.outputs || []),
    },
  };
}

function validateConnection({ fromType, fromPortId, toType, toPortId, fromParams, toParams }) {
  if (!fromPortId || !toPortId) {
    return { ok: false, reason: 'Missing port id for connection.' };
  }
  const fromPort = getPortDefinition(fromType, fromPortId, 'outputs', fromParams);
  if (!fromPort) {
    return { ok: false, reason: 'Unknown source port.' };
  }
  const toPort = getPortDefinition(toType, toPortId, 'inputs', toParams);
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
    const ports = buildPortsForNode(node.type, node.params);
    const requiredInputs = (ports.inputs || []).filter(port => port.required);
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
  buildPortsForNode,
  getPortDefinition,
  createNode,
  validateConnection,
  validateRequiredInputs,
};
