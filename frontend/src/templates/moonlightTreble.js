import { getStepsPerBar, normalizeBar, normalizeBars } from '../ui/customMelodyModel.js';

const TREBLE_MELODY_BARS = [
  { rhythm: '............9--.', notes: 'G#4' },
  { rhythm: '9----------.9--.', notes: 'G#4 G#4' },
  { rhythm: '9-------9-------', notes: 'G#4 A4' },
  { rhythm: '9-------9---9---', notes: 'G#4 F#4 B4' },
  { rhythm: '9---............', notes: 'E4' },
  { rhythm: '............9--.', notes: 'G4' },
  { rhythm: '9----------.9--.', notes: 'G4 G4' },
  { rhythm: '9-----------9---', notes: 'G4 F#4' },
  { rhythm: '9-------9---9---', notes: 'F#4 G4 E4' },
  { rhythm: '9---------------', notes: 'F#4' },
  { rhythm: '............9---', notes: 'B4' },
  { rhythm: '9-----------9---', notes: 'C5 Bb4' },
];

function generateUniqueId(base, existingIds) {
  let candidate = base;
  let counter = 2;
  while (existingIds.has(candidate)) {
    candidate = `${base}_${counter}`;
    counter += 1;
  }
  return candidate;
}

function ensureStartNode(store, state) {
  const existing = (state.nodes || []).find(node => node.type === 'start');
  if (existing) {
    return existing;
  }
  return store.addNode('start', { params: { label: 'Start' } });
}

function buildCustomBars(durationBars, grid) {
  const steps = getStepsPerBar(grid);
  const seeded = TREBLE_MELODY_BARS.map(bar => normalizeBar(bar, steps));
  return normalizeBars(seeded, durationBars, steps);
}

function createThought(store, state, baseId, params, ui) {
  const existingIds = new Set((state.nodes || []).map(node => node.id));
  const id = generateUniqueId(baseId, existingIds);
  const node = store.addNode('thought', {
    id,
    params,
    ui: { x: 0, y: 0, ...(ui || {}) },
  });
  return node;
}

function addEdgeIfMissing(store, state, fromNodeId, toNodeId) {
  const exists = (state.edges || []).some(edge => edge.from?.nodeId === fromNodeId && edge.to?.nodeId === toNodeId);
  if (exists) {
    return;
  }
  const fromNode = (state.nodes || []).find(node => node.id === fromNodeId);
  const toNode = (state.nodes || []).find(node => node.id === toNodeId);
  if (!fromNode || !toNode) {
    return;
  }
  const fromPortId = fromNode.ports?.outputs?.[0]?.id || 'out';
  const toPortId = toNode.ports?.inputs?.[0]?.id || 'in';
  try {
    store.addEdge({
      from: { nodeId: fromNodeId, portId: fromPortId },
      to: { nodeId: toNodeId, portId: toPortId },
    });
  } catch (err) {
    // ignore validation errors; template should not crash UI
  }
}

function insertMoonlightTrebleTemplate(store) {
  const state = store.getState();
  const start = ensureStartNode(store, state);
  const intro = createThought(
    store,
    store.getState(),
    'Treble_Intro_Bars1to4',
    {
      label: 'Treble Intro (Bars 1-4)',
      durationBars: 4,
      harmonyMode: 'single',
      chordRoot: 'C#',
      chordQuality: 'minor',
      patternType: 'arp-3-up',
      rhythmGrid: '1/12',
      melodyMode: 'generated',
    },
    { x: 0, y: 0 }
  );

  const triplets = createThought(
    store,
    store.getState(),
    'Treble_Triplets_Bars5to16',
    {
      label: 'Treble Triplets (Bars 5-16)',
      durationBars: 12,
      harmonyMode: 'single',
      chordRoot: 'C#',
      chordQuality: 'minor',
      patternType: 'arp-3-up',
      rhythmGrid: '1/12',
      melodyMode: 'generated',
    },
    { x: 280, y: -60 }
  );

  const melodyGrid = '1/16';
  const melody = createThought(
    store,
    store.getState(),
    'Treble_Melody_Bars5to16',
    {
      label: 'Treble Melody (Bars 5-16)',
      durationBars: 12,
      harmonyMode: 'single',
      chordRoot: 'C#',
      chordQuality: 'minor',
      rhythmGrid: melodyGrid,
      melodyMode: 'custom',
      customMelody: {
        grid: melodyGrid,
        bars: buildCustomBars(12, melodyGrid),
      },
    },
    { x: 280, y: 120 }
  );

  const current = store.getState();
  addEdgeIfMissing(store, current, start.id, intro.id);
  addEdgeIfMissing(store, store.getState(), intro.id, triplets.id);
  addEdgeIfMissing(store, store.getState(), intro.id, melody.id);

  return {
    startId: start.id,
    introId: intro.id,
    tripletsId: triplets.id,
    melodyId: melody.id,
  };
}

export { insertMoonlightTrebleTemplate };
