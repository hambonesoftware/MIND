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

function normalizeState(state) {
  return {
    nodes: Array.isArray(state?.nodes) ? state.nodes : [],
    edges: Array.isArray(state?.edges) ? state.edges : [],
    selection: state?.selection || DEFAULT_SELECTION,
    viewport: state?.viewport || DEFAULT_VIEWPORT,
  };
}

function serializeState(state) {
  return JSON.stringify({
    version: STORAGE_VERSION,
    graph: {
      nodes: state.nodes,
      edges: state.edges,
      selection: state.selection,
      viewport: state.viewport,
    },
  });
}

function deserializeState(serialized) {
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
    const graph = parsed.graph || parsed.data?.graph || parsed.data || null;
    if (!graph) {
      return null;
    }
    return normalizeState(graph);
  } catch (error) {
    return null;
  }
}

function extractProjectGraph(serialized) {
  if (!serialized) {
    return null;
  }
  try {
    const parsed = JSON.parse(serialized);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const graph = parsed.graph || parsed.data?.graph || null;
    if (!graph) {
      return null;
    }
    return { parsed, graph: normalizeState(graph) };
  } catch (error) {
    return null;
  }
}

function ensurePorts(ports) {
  if (ports && typeof ports === 'object') {
    return {
      inputs: Array.isArray(ports.inputs) ? ports.inputs : [],
      outputs: Array.isArray(ports.outputs) ? ports.outputs : [],
    };
  }
  return { inputs: [], outputs: [] };
}

function createNode(type, overrides = {}) {
  return {
    id: overrides.id || generateId(type.toLowerCase()),
    type,
    params: { ...(overrides.params || {}) },
    ui: { x: 0, y: 0, ...(overrides.ui || {}) },
    ports: ensurePorts(overrides.ports),
  };
}

function createEdge({ id, from, to } = {}) {
  return {
    id: id || generateId('edge'),
    from: { nodeId: from?.nodeId, portId: from?.portId || null },
    to: { nodeId: to?.nodeId, portId: to?.portId || null },
  };
}

function createGraphStore({
  storageKey = 'mind.graph',
  projectKey = 'mind.project',
} = {}) {
  let state = clone(DEFAULT_STATE);
  let past = [];
  let future = [];
  const listeners = new Set();

  const notify = () => {
    listeners.forEach(listener => listener(state));
  };

  const saveToStorage = () => {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    localStorage.setItem(storageKey, serializeState(state));
    if (projectKey) {
      const projectState = extractProjectGraph(localStorage.getItem(projectKey));
      if (projectState) {
        localStorage.setItem(projectKey, JSON.stringify({
          ...projectState.parsed,
          graph: {
            nodes: state.nodes,
            edges: state.edges,
            selection: state.selection,
            viewport: state.viewport,
          },
        }));
      }
    }
    return true;
  };

  const loadFromStorage = () => {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const stored = deserializeState(localStorage.getItem(storageKey));
    if (stored) {
      state = clone({ ...DEFAULT_STATE, ...stored });
      notify();
      return clone(state);
    }
    if (projectKey) {
      const project = extractProjectGraph(localStorage.getItem(projectKey));
      if (project) {
        state = clone({ ...DEFAULT_STATE, ...project.graph });
        notify();
        return clone(state);
      }
    }
    return null;
  };

  const applyState = (nextState, { recordHistory = true, persist = true } = {}) => {
    if (recordHistory) {
      past = [...past, clone(state)];
      future = [];
    }
    state = clone(normalizeState(nextState));
    if (persist) {
      saveToStorage();
    }
    notify();
  };

  const setGraph = (nextGraph, options) => {
    applyState({
      ...state,
      ...normalizeState(nextGraph),
    }, options);
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
        const patch = typeof updater === 'function' ? updater(node) : updater;
        return {
          ...node,
          ...patch,
          params: { ...node.params, ...(patch?.params || {}) },
          ui: { ...node.ui, ...(patch?.ui || {}) },
          ports: patch?.ports ? ensurePorts(patch.ports) : node.ports,
        };
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

  const select = (selection) => {
    applyState({
      ...state,
      selection: {
        nodes: selection?.nodes || [],
        edges: selection?.edges || [],
      },
    }, { recordHistory: false });
  };

  const pan = (delta) => {
    const dx = typeof delta === 'object' ? delta.x || 0 : delta || 0;
    const dy = typeof delta === 'object' ? delta.y || 0 : 0;
    applyState({
      ...state,
      viewport: {
        ...state.viewport,
        x: state.viewport.x + dx,
        y: state.viewport.y + dy,
      },
    }, { recordHistory: false });
  };

  const zoom = (value, { mode = 'set' } = {}) => {
    const nextZoom = mode === 'delta'
      ? state.viewport.zoom * value
      : value;
    applyState({
      ...state,
      viewport: {
        ...state.viewport,
        zoom: Math.max(0.1, nextZoom),
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
    saveToStorage();
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
    saveToStorage();
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
    loadFromStorage,
    saveToStorage,
    setGraph,
    addNode,
    updateNode,
    removeNode,
    addEdge,
    removeEdge,
    select,
    pan,
    zoom,
    undo,
    redo,
    canUndo: () => past.length > 0,
    canRedo: () => future.length > 0,
  };
}

export {
  DEFAULT_STATE,
  DEFAULT_SELECTION,
  DEFAULT_VIEWPORT,
  createNode,
  createEdge,
  createGraphStore,
};
