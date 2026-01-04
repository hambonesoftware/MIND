import {
  createNode,
  buildPortsForNode,
  validateConnection,
  validateRequiredInputs,
} from './nodeRegistry.js';

const STORAGE_VERSION = 9;
const GRAPH_VERSION = 9;
const DEFAULT_SELECTION = { nodes: [], edges: [] };
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const DEFAULT_STATE = {
  graphVersion: GRAPH_VERSION,
  nodes: [],
  edges: [],
  selection: DEFAULT_SELECTION,
  viewport: DEFAULT_VIEWPORT,
  runtime: {
    state: null,
    debugTrace: [],
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

function serializeGraphState(state) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    graphVersion: GRAPH_VERSION,
    data: {
      graphVersion: GRAPH_VERSION,
      nodes: state.nodes,
      edges: state.edges,
      selection: state.selection,
      viewport: state.viewport,
    },
  });
}

function normalizeGraphState(data) {
  return {
    graphVersion: data.graphVersion || GRAPH_VERSION,
    nodes: Array.isArray(data.nodes) ? data.nodes : [],
    edges: Array.isArray(data.edges) ? data.edges : [],
    selection: data.selection || DEFAULT_SELECTION,
    viewport: data.viewport || DEFAULT_VIEWPORT,
    runtime: {
      state: null,
      debugTrace: [],
    },
  };
}

function buildThoughtParams(node) {
  return {
    label: node.params?.label || node.type || 'Thought',
    durationBars: node.params?.durationBars ?? 1,
    key: node.params?.key || 'C# minor',
    chordRoot: node.params?.chordRoot || 'C#',
    chordQuality: node.params?.chordQuality || 'minor',
    chordNotes: node.params?.chordNotes || '',
    harmonyMode: node.params?.harmonyMode || 'single',
    progressionPresetId: node.params?.progressionPresetId || '',
    progressionVariantId: node.params?.progressionVariantId || '',
    progressionLength: node.params?.progressionLength || 'preset',
    chordsPerBar: node.params?.chordsPerBar || '1',
    fillBehavior: node.params?.fillBehavior || 'repeat',
    progressionCustom: node.params?.progressionCustom || '',
    progressionCustomVariantStyle: node.params?.progressionCustomVariantStyle || 'triads',
    patternType: node.params?.patternType || 'arp-3-up',
    rhythmGrid: node.params?.rhythmGrid || '1/12',
    syncopation: node.params?.syncopation || 'none',
    timingWarp: node.params?.timingWarp || 'none',
    timingIntensity: node.params?.timingIntensity ?? 0,
    registerMin: node.params?.registerMin ?? 48,
    registerMax: node.params?.registerMax ?? 84,
    instrumentSoundfont: node.params?.instrumentSoundfont || '/assets/soundfonts/General-GS.sf2',
    instrumentPreset: node.params?.instrumentPreset || 'gm:0:0',
    thoughtStatus: node.params?.thoughtStatus || 'draft',
    thoughtVersion: node.params?.thoughtVersion ?? 1,
    legacyParams: node.params || {},
  };
}

function migrateV8GraphState(data) {
  const typeMap = {
    Start: 'start',
    Beat: 'thought',
    Transform: 'thought',
    Gate: 'thought',
    Counter: 'counter',
    Switch: 'switch',
    Render: 'thought',
  };

  const nodes = (data.nodes || []).map((node) => {
    const type = typeMap[node.type] || 'thought';
    let params = node.params || {};
    if (type === 'thought') {
      params = buildThoughtParams(node);
    } else if (type === 'counter') {
      params = {
        label: node.params?.label || 'Counter',
        start: node.params?.start ?? 0,
        step: node.params?.step ?? 1,
      };
    } else if (type === 'switch') {
      params = {
        label: node.params?.label || 'Switch',
        defaultBranch: 'default',
        branchCount: 2,
      };
    } else if (type === 'start') {
      params = { label: node.params?.label || 'Start' };
    }
    return createNode(type, {
      id: node.id,
      params,
      ui: node.ui || { x: 0, y: 0 },
    });
  });

  const nodeMap = new Map(nodes.map(node => [node.id, node]));

  const edges = (data.edges || []).map((edge) => {
    const fromNode = nodeMap.get(edge.from?.nodeId);
    const toNode = nodeMap.get(edge.to?.nodeId);
    const fromPortId = edge.from?.portId || fromNode?.ports?.outputs?.[0]?.id || null;
    const toPortId = edge.to?.portId || toNode?.ports?.inputs?.[0]?.id || null;
    return {
      id: edge.id || generateId('edge'),
      from: { nodeId: edge.from?.nodeId, portId: fromPortId },
      to: { nodeId: edge.to?.nodeId, portId: toPortId },
    };
  });

  return normalizeGraphState({
    graphVersion: GRAPH_VERSION,
    nodes,
    edges,
    selection: data.selection || DEFAULT_SELECTION,
    viewport: data.viewport || DEFAULT_VIEWPORT,
  });
}

function deserializeGraphState(serialized) {
  if (!serialized) {
    return null;
  }
  try {
    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    if (parsed.version === STORAGE_VERSION || parsed.graphVersion === GRAPH_VERSION) {
      const data = parsed.data || parsed.graph || parsed;
      return normalizeGraphState(data);
    }
    if (parsed.version === 1) {
      return migrateV8GraphState(parsed.data || {});
    }
    return null;
  } catch (error) {
    return null;
  }
}

function validateEdge(edge, nodes) {
  const fromNode = nodes.find(node => node.id === edge.from?.nodeId);
  const toNode = nodes.find(node => node.id === edge.to?.nodeId);
  if (!fromNode || !toNode) {
    return { ok: false, reason: 'Missing node for edge.' };
  }
  if (!edge.from?.portId || !edge.to?.portId) {
    return { ok: false, reason: 'Edge is missing port information.' };
  }
  return validateConnection({
    fromType: fromNode.type,
    fromPortId: edge.from?.portId,
    toType: toNode.type,
    toPortId: edge.to?.portId,
    fromParams: fromNode.params,
    toParams: toNode.params,
  });
}

function validateGraph(state) {
  const issues = [];
  const hasStart = state.nodes.some(node => node.type === 'start');
  if (!hasStart) {
    issues.push({ type: 'start', reason: 'Missing Start node.' });
  }
  for (const edge of state.edges) {
    const result = validateEdge(edge, state.nodes);
    if (!result.ok) {
      issues.push({ type: 'edge', edgeId: edge.id, reason: result.reason });
    }
  }
  const required = validateRequiredInputs(state.nodes, state.edges);
  if (!required.ok) {
    for (const missing of required.missing) {
      issues.push({
        type: 'required-input',
        nodeId: missing.nodeId,
        portId: missing.portId,
        reason: 'Missing required input.',
      });
    }
  }
  for (const node of state.nodes) {
    if (node.type === 'switch') {
      const branchPorts = (node.ports?.outputs || []).filter(port => port.id !== 'default');
      if (branchPorts.length === 0) {
        issues.push({
          type: 'switch',
          nodeId: node.id,
          reason: 'Switch node has no branches.',
        });
      }
    }
  }
  return { ok: issues.length === 0, issues };
}

function createEdge({ from, to, id } = {}) {
  return {
    id: id || generateId('edge'),
    from: { nodeId: from.nodeId, portId: from.portId },
    to: { nodeId: to.nodeId, portId: to.portId },
  };
}

function createFlowGraphStore({ storageKey = 'mind.flowGraph' } = {}) {
  let state = clone(DEFAULT_STATE);
  let past = [];
  let future = [];
  const listeners = new Set();

  const notify = () => {
    listeners.forEach(listener => listener(state));
  };

  const persist = () => {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(storageKey, serializeGraphState(state));
  };

  const restore = () => {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return deserializeGraphState(localStorage.getItem(storageKey));
  };

  const applyState = (nextState, { recordHistory = true } = {}) => {
    if (recordHistory) {
      past = [...past, clone(state)];
      future = [];
    }
    state = clone(nextState);
    persist();
    notify();
  };

  const setState = (updater, options) => {
    const nextState = typeof updater === 'function' ? updater(clone(state)) : updater;
    applyState(nextState, options);
  };

  const load = () => {
    const restored = restore();
    if (restored) {
      state = clone({ ...DEFAULT_STATE, ...restored });
      persist();
      notify();
    }
    return state;
  };

  const addNode = (type, overrides = {}) => {
    const node = createNode(type, overrides);
    applyState({
      ...state,
      nodes: [...state.nodes, node],
    });
    return node;
  };

  const updateNode = (nodeId, updater) => {
    applyState({
      ...state,
      nodes: state.nodes.map(node => {
        if (node.id !== nodeId) {
          return node;
        }
        const updated = typeof updater === 'function' ? updater(node) : updater;
        const nextParams = { ...node.params, ...(updated.params || {}) };
        const nextNode = { ...node, ...updated, params: nextParams };
        if (updated.params && node.type) {
          const ports = buildPortsForNode(node.type, nextParams);
          nextNode.ports = {
            inputs: ports.inputs || [],
            outputs: ports.outputs || [],
          };
        }
        return nextNode;
      }),
    });
  };

  const removeNode = (nodeId) => {
    const nextEdges = state.edges.filter(edge => edge.from?.nodeId !== nodeId && edge.to?.nodeId !== nodeId);
    applyState({
      ...state,
      nodes: state.nodes.filter(node => node.id !== nodeId),
      edges: nextEdges,
      selection: {
        nodes: state.selection.nodes.filter(id => id !== nodeId),
        edges: state.selection.edges.filter(id => nextEdges.find(edge => edge.id === id)),
      },
    });
  };

  const addEdge = (edgeInput) => {
    const edge = createEdge(edgeInput);
    const validation = validateEdge(edge, state.nodes);
    if (!validation.ok) {
      throw new Error(validation.reason);
    }
    applyState({
      ...state,
      edges: [...state.edges, edge],
    });
    return edge;
  };

  const removeEdge = (edgeId) => {
    applyState({
      ...state,
      edges: state.edges.filter(edge => edge.id !== edgeId),
      selection: {
        ...state.selection,
        edges: state.selection.edges.filter(id => id !== edgeId),
      },
    });
  };

  const setSelection = (selection) => {
    applyState({
      ...state,
      selection: {
        nodes: selection.nodes || [],
        edges: selection.edges || [],
      },
    }, { recordHistory: false });
  };

  const setViewport = (viewport) => {
    applyState({
      ...state,
      viewport: { ...state.viewport, ...viewport },
    }, { recordHistory: false });
  };

  const setRuntimeState = ({ runtimeState, debugTrace } = {}) => {
    applyState({
      ...state,
      runtime: {
        state: runtimeState || null,
        debugTrace: Array.isArray(debugTrace) ? debugTrace : [],
      },
    }, { recordHistory: false });
  };

  const undo = () => {
    if (past.length === 0) {
      return false;
    }
    future = [clone(state), ...future];
    state = past[past.length - 1];
    past = past.slice(0, -1);
    persist();
    notify();
    return true;
  };

  const redo = () => {
    if (future.length === 0) {
      return false;
    }
    past = [...past, clone(state)];
    state = future[0];
    future = future.slice(1);
    persist();
    notify();
    return true;
  };

  const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getState = () => clone(state);

  return {
    getState,
    subscribe,
    setState,
    load,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    setSelection,
    setViewport,
    setRuntimeState,
    undo,
    redo,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
  };
}

export {
  DEFAULT_STATE,
  serializeGraphState,
  deserializeGraphState,
  validateGraph,
  validateEdge,
  createEdge,
  createFlowGraphStore,
};
