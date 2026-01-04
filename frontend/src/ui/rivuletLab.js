import { compileSession } from '../api/client.js';
import { buildPortsForNode } from '../state/nodeRegistry.js';

const GRID_STEPS = {
  '1/4': 4,
  '1/8': 8,
  '1/12': 12,
  '1/16': 16,
  '1/24': 24,
};

const SOUND_FONTS = [
  { value: '/assets/soundfonts/General-GS.sf2', label: 'General GS' },
];

async function fetchPresets() {
  try {
    const response = await fetch('/api/presets');
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    return Array.isArray(data?.presets) ? data.presets : [];
  } catch {
    return [];
  }
}

function getAudioTime(audioEngine) {
  if (typeof audioEngine.getCurrentTime === 'function') {
    return audioEngine.getCurrentTime();
  }
  if (typeof audioEngine.currentTime === 'number') {
    return audioEngine.currentTime;
  }
  return 0;
}

function buildPreviewGraph(thoughtNode, overrides) {
  const startId = `preview-start-${thoughtNode.id}`;
  const thoughtId = thoughtNode.id;
  const params = { ...thoughtNode.params, ...overrides };
  const thoughtPorts = buildPortsForNode('thought', params);
  return {
    graphVersion: 9,
    nodes: [
      {
        id: startId,
        type: 'start',
        params: { label: 'Start' },
        ui: { x: 0, y: 0 },
        ports: {
          inputs: [],
          outputs: [{ id: 'out', label: 'Out', type: 'flow' }],
        },
      },
      {
        id: thoughtId,
        type: 'thought',
        params,
        ui: thoughtNode.ui || { x: 0, y: 0 },
        ports: thoughtPorts,
      },
    ],
    edges: [
      {
        id: `preview-edge-${thoughtId}`,
        from: { nodeId: startId, portId: 'out' },
        to: { nodeId: thoughtId, portId: 'in' },
      },
    ],
  };
}

function buildStepStrip(grid, events) {
  const steps = GRID_STEPS[grid] || 12;
  const strip = document.createElement('div');
  strip.className = 'rivulet-step-strip';
  const stepLen = 4 / steps;
  for (let i = 0; i < steps; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'rivulet-step-cell';
    const hit = events.some(ev => Math.abs(ev.tBeat - i * stepLen) < 0.01);
    if (hit) {
      cell.classList.add('rivulet-step-hit');
    }
    strip.appendChild(cell);
  }
  return strip;
}

function compareEvents(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((ev, idx) => {
    const other = b[idx];
    return (
      ev.tBeat === other.tBeat &&
      JSON.stringify(ev.pitches || []) === JSON.stringify(other.pitches || [])
    );
  });
}

export function createRivuletLab({ store, audioEngine } = {}) {
  const container = document.createElement('section');
  container.className = 'rivulet-lab';

  const header = document.createElement('div');
  header.className = 'rivulet-header';
  const title = document.createElement('div');
  title.className = 'rivulet-title';
  title.textContent = 'Rivulet Lab Preview';
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'rivulet-toggle';
  toggle.textContent = 'Collapse';
  header.appendChild(title);
  header.appendChild(toggle);
  container.appendChild(header);

  const body = document.createElement('div');
  body.className = 'rivulet-body';
  container.appendChild(body);

  const infoRow = document.createElement('div');
  infoRow.className = 'rivulet-info';
  const selectedChip = document.createElement('span');
  selectedChip.className = 'rivulet-chip';
  selectedChip.textContent = 'No Thought selected';
  const statusBadge = document.createElement('span');
  statusBadge.className = 'rivulet-badge';
  statusBadge.textContent = 'Draft';
  const publishButton = document.createElement('button');
  publishButton.type = 'button';
  publishButton.className = 'rivulet-publish';
  publishButton.textContent = 'Publish';
  infoRow.appendChild(selectedChip);
  infoRow.appendChild(statusBadge);
  infoRow.appendChild(publishButton);
  body.appendChild(infoRow);

  const controls = document.createElement('div');
  controls.className = 'rivulet-controls';
  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.textContent = 'Play';
  const stopButton = document.createElement('button');
  stopButton.type = 'button';
  stopButton.textContent = 'Stop';
  const loopLabel = document.createElement('label');
  loopLabel.className = 'rivulet-inline';
  const loopInput = document.createElement('input');
  loopInput.type = 'checkbox';
  loopInput.checked = true;
  loopLabel.appendChild(loopInput);
  loopLabel.appendChild(document.createTextNode('Loop'));
  controls.appendChild(playButton);
  controls.appendChild(stopButton);
  controls.appendChild(loopLabel);
  body.appendChild(controls);

  const overrides = document.createElement('div');
  overrides.className = 'rivulet-overrides';
  body.appendChild(overrides);

  const buildField = (label, type, value) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'rivulet-field';
    const titleEl = document.createElement('span');
    titleEl.textContent = label;
    const input = document.createElement('input');
    input.type = type;
    input.value = value ?? '';
    wrapper.appendChild(titleEl);
    wrapper.appendChild(input);
    overrides.appendChild(wrapper);
    return input;
  };

  const buildSelect = (label, options) => {
    const wrapper = document.createElement('label');
    wrapper.className = 'rivulet-field';
    const titleEl = document.createElement('span');
    titleEl.textContent = label;
    const select = document.createElement('select');
    options.forEach((opt) => {
      const option = document.createElement('option');
      option.value = opt.value;
      option.textContent = opt.label ?? opt.value;
      select.appendChild(option);
    });
    wrapper.appendChild(titleEl);
    wrapper.appendChild(select);
    overrides.appendChild(wrapper);
    return select;
  };

  const bpmInput = buildField('Tempo', 'number', 120);
  const barsInput = buildField('Bars', 'number', 1);
  const seedInput = buildField('Seed', 'number', 0);
  const keyInput = buildField('Key', 'text', 'C# minor');
  const chordInput = buildField('Chord Root', 'text', 'C#');
  const registerMinInput = buildField('Register Min', 'number', 48);
  const registerMaxInput = buildField('Register Max', 'number', 84);
  const soundfontSelect = buildSelect('SoundFont', SOUND_FONTS);
  const presetSelect = buildSelect('Preset', []);

  const visualization = document.createElement('div');
  visualization.className = 'rivulet-visual';
  body.appendChild(visualization);

  const checks = document.createElement('div');
  checks.className = 'rivulet-checks';
  body.appendChild(checks);

  let isCollapsed = false;
  let selectedThought = null;
  let previewTimer = null;
  let previewRuntimeState = null;
  let presetList = [];

  const updateChecks = (items) => {
    checks.innerHTML = '';
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = `rivulet-check rivulet-check-${item.level}`;
      row.textContent = `${item.label}: ${item.message}`;
      checks.appendChild(row);
    });
  };

  const applySelection = (node) => {
    selectedThought = node;
    if (!node) {
      selectedChip.textContent = 'No Thought selected';
      statusBadge.textContent = '--';
      return;
    }
    selectedChip.textContent = `${node.params?.label || 'Thought'} (${node.id})`;
    const status = node.params?.thoughtStatus || 'draft';
    statusBadge.textContent = status === 'published' ? `Published v${node.params?.thoughtVersion || 1}` : 'Draft';
    keyInput.value = node.params?.key || 'C# minor';
    chordInput.value = node.params?.chordRoot || 'C#';
    registerMinInput.value = node.params?.registerMin ?? 48;
    registerMaxInput.value = node.params?.registerMax ?? 84;
    soundfontSelect.value = node.params?.instrumentSoundfont || SOUND_FONTS[0].value;
    if (node.params?.instrumentPreset) {
      presetSelect.value = node.params.instrumentPreset;
    }
  };

  const buildOverrides = () => {
    if (!selectedThought) {
      return {};
    }
    return {
      durationBars: Number(barsInput.value) || selectedThought.params?.durationBars || 1,
      key: keyInput.value || selectedThought.params?.key,
      chordRoot: chordInput.value || selectedThought.params?.chordRoot,
      rhythmGrid: selectedThought.params?.rhythmGrid,
      registerMin: Number(registerMinInput.value) || selectedThought.params?.registerMin,
      registerMax: Number(registerMaxInput.value) || selectedThought.params?.registerMax,
      instrumentSoundfont: soundfontSelect.value,
      instrumentPreset: presetSelect.value || selectedThought.params?.instrumentPreset,
    };
  };

  const runPreviewCycle = async () => {
    if (!selectedThought) {
      return { events: [], diagnostics: [] };
    }
    const bars = Math.max(1, Number(barsInput.value) || 1);
    const bpm = Math.max(30, Number(bpmInput.value) || 120);
    const seed = Number(seedInput.value) || 0;
    const beatDur = 60 / bpm;
    const overridesValue = buildOverrides();
    let runtimeState = previewRuntimeState;
    const scheduled = [];
    const startTime = getAudioTime(audioEngine);
    for (let barIndex = 0; barIndex < bars; barIndex += 1) {
      const flowGraph = buildPreviewGraph(selectedThought, overridesValue);
      const req = {
        seed,
        bpm,
        barIndex,
        flowGraph,
        runtimeState,
      };
      const res = await compileSession(req);
      runtimeState = res.runtimeState || runtimeState;
      const events = Array.isArray(res.events) ? res.events : [];
      const baseBeat = barIndex * 4;
      events.forEach((ev) => {
        if (typeof ev.tBeat !== 'number') {
          return;
        }
        scheduled.push({
          ...ev,
          audioTime: startTime + (baseBeat + ev.tBeat) * beatDur,
        });
      });
      if (barIndex === 0) {
        visualization.innerHTML = '';
        visualization.appendChild(
          buildStepStrip(overridesValue.rhythmGrid || selectedThought.params?.rhythmGrid || '1/12', events),
        );
      }
    }
    previewRuntimeState = runtimeState;
    if (scheduled.length > 0) {
      audioEngine.schedule(scheduled, 0);
    }
    return { events: scheduled, diagnostics: [] };
  };

  const runChecks = async () => {
    if (!selectedThought) {
      updateChecks([{ label: 'Selection', level: 'warn', message: 'No Thought selected' }]);
      return;
    }
    const overridesValue = buildOverrides();
    const flowGraph = buildPreviewGraph(selectedThought, overridesValue);
    const req = {
      seed: Number(seedInput.value) || 0,
      bpm: Number(bpmInput.value) || 120,
      barIndex: 0,
      flowGraph,
      runtimeState: null,
    };
    const first = await compileSession(req);
    const second = await compileSession(req);
    const events = Array.isArray(first.events) ? first.events : [];
    const deterministic = compareEvents(events, Array.isArray(second.events) ? second.events : []);
    const registerMin = Number(selectedThought.params?.registerMin ?? 0);
    const registerMax = Number(selectedThought.params?.registerMax ?? 127);
    const inRange = events.every((ev) => (ev.pitches || []).every(p => p >= registerMin && p <= registerMax));
    const eventSpam = events.length > 32;
    const stuckNotes = events.some(ev => ev.durationBeats > 4);
    updateChecks([
      { label: 'Determinism', level: deterministic ? 'pass' : 'warn', message: deterministic ? 'Stable output' : 'Output varies' },
      { label: 'Register', level: inRange ? 'pass' : 'warn', message: inRange ? 'In range' : 'Out of range notes' },
      { label: 'Event count', level: eventSpam ? 'warn' : 'pass', message: `${events.length} events` },
      { label: 'Stuck notes', level: stuckNotes ? 'warn' : 'pass', message: stuckNotes ? 'Long durations detected' : 'No stuck notes' },
    ]);
  };

  const startPreview = async () => {
    if (!selectedThought || !audioEngine) {
      return;
    }
    audioEngine.start();
    const schedule = async () => {
      await runPreviewCycle();
      if (loopInput.checked && previewTimer) {
        const bars = Math.max(1, Number(barsInput.value) || 1);
        const bpm = Math.max(30, Number(bpmInput.value) || 120);
        const durationMs = (bars * 4 * 60 * 1000) / bpm;
        previewTimer = window.setTimeout(schedule, durationMs);
      }
    };
    if (previewTimer) {
      window.clearTimeout(previewTimer);
    }
    previewTimer = window.setTimeout(schedule, 0);
    await runChecks();
  };

  const stopPreview = () => {
    if (previewTimer) {
      window.clearTimeout(previewTimer);
      previewTimer = null;
    }
    previewRuntimeState = null;
  };

  playButton.addEventListener('click', startPreview);
  stopButton.addEventListener('click', stopPreview);
  toggle.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    body.style.display = isCollapsed ? 'none' : 'flex';
    toggle.textContent = isCollapsed ? 'Expand' : 'Collapse';
  });

  publishButton.addEventListener('click', () => {
    if (!selectedThought) {
      return;
    }
    const version = Number(selectedThought.params?.thoughtVersion || 0) + 1;
    store.updateNode(selectedThought.id, {
      params: {
        ...selectedThought.params,
        thoughtStatus: 'published',
        thoughtVersion: version,
      },
    });
  });

  const handleState = (state) => {
    const selection = state.selection || { nodes: [] };
    if (selection.nodes.length > 0) {
      const node = state.nodes.find(item => item.id === selection.nodes[0]);
      if (node?.type === 'thought') {
        applySelection(node);
        return;
      }
    }
    applySelection(null);
  };

  store.subscribe(handleState);
  handleState(store.getState());

  fetchPresets().then((presets) => {
    presetList = presets;
    presetSelect.innerHTML = '';
    presetList.forEach((preset) => {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.name;
      presetSelect.appendChild(option);
    });
  });

  return { element: container, destroy: () => stopPreview() };
}
