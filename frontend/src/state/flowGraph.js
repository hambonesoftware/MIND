import {
  createNode,
  getPortDefinition,
  validateConnection,
  validateRequiredInputs,
} from './nodeRegistry.js';

const STORAGE_VERSION = 1;
const DEFAULT_SELECTION = { nodes: [], edges: [] };
const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };
const DEFAULT_STATE = {
  nodes: [],
  edges: [],
  selection: DEFAULT_SELECTION,
  viewport: DEFAULT_VIEWPORT,
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
    data: {
      nodes: state.nodes,
      edges: state.edges,
      selection: state.selection,
      viewport: state.viewport,
    },
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
    if (parsed.version !== STORAGE_VERSION) {
      return null;
    }
    const data = parsed.data || {};
    return {
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      edges: Array.isArray(data.edges) ? data.edges : [],
      selection: data.selection || DEFAULT_SELECTION,
      viewport: data.viewport || DEFAULT_VIEWPORT,
    };
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
  return validateConnection({
    fromType: fromNode.type,
    fromPortId: edge.from?.portId,
    toType: toNode.type,
    toPortId: edge.to?.portId,
  });
}

function validateGraph(state) {
  const issues = [];
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
        return { ...node, ...updated };
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
    undo,
    redo,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
  };
}

function getPort(node, portId, direction) {
  return getPortDefinition(node.type, portId, direction);
}

export {
  DEFAULT_STATE,
  serializeGraphState,
  deserializeGraphState,
  validateGraph,
  validateEdge,
  createEdge,
  createFlowGraphStore,
  getPort,
};
