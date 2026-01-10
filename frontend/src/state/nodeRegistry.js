// frontend/src/state/nodeRegistry.js

import { RESOLVER_VERSION } from '../music/immutables.js';

const PORT_TYPES = {
  FLOW: 'flow',
  EVENTS: 'events',
};

const DEFAULT_STYLE_ID = 'classical_film';
const DEFAULT_STYLE_SEED = 1;
const DEFAULT_STYLE_OPTION_MODES = {
  harmony: 'auto',
  pattern: 'auto',
  feel: 'auto',
  instrument: 'auto',
  register: 'auto',
};
const LEGACY_STYLE_OPTION_MODES = {
  harmony: 'override',
  pattern: 'override',
  feel: 'override',
  instrument: 'override',
  register: 'override',
};
const STYLE_METADATA_DEFAULTS = {
  styleId: DEFAULT_STYLE_ID,
  styleSeed: DEFAULT_STYLE_SEED,
  moodMode: 'auto',
  moodId: 'none',
  styleOptionModes: DEFAULT_STYLE_OPTION_MODES,
  styleOptionLocks: {},
  styleOptionOverrides: {},
  dropdownViewPrefs: {},
};
const STYLE_METADATA_LEGACY_DEFAULTS = {
  styleId: 'legacy',
  styleSeed: 0,
  moodMode: 'override',
  moodId: 'none',
  styleOptionModes: LEGACY_STYLE_OPTION_MODES,
  styleOptionLocks: {},
  styleOptionOverrides: {},
  dropdownViewPrefs: {},
};
const THOUGHT_INTENT_DEFAULTS = {
  goal: 'driving_groove',
  role: 'harmony',
  styleId: DEFAULT_STYLE_ID,
  moodId: STYLE_METADATA_DEFAULTS.moodId,
  motionId: 'flowing',
  density: 0.5,
  harmonyBehavior: 'auto',
  soundColor: 'auto',
  seed: DEFAULT_STYLE_SEED,
  locks: {},
};
const THOUGHT_COMPILED_DEFAULTS = {
  resolverVersion: RESOLVER_VERSION,
  notePatternId: '',
  rhythmGrid: '1/12',
  syncopation: 'none',
  timingWarp: 'none',
  timingIntensity: 0,
  instrumentPreset: 'gm:0:0',
  registerMin: 48,
  registerMax: 84,
  presetCode: '',
  artifact: {},
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
      harmonyMode: { type: 'string' },
      progressionPresetId: { type: 'string' },
      progressionVariantId: { type: 'string' },
      progressionLength: { type: 'string' },
      chordsPerBar: { type: 'string' },
      fillBehavior: { type: 'string' },
      progressionCustom: { type: 'string' },
      progressionCustomVariantStyle: { type: 'string' },
      notePatternId: { type: 'string' },
      // Legacy: patternType remains for backward compatibility (Phase 1 migration only).
      patternType: { type: 'string' },
      rhythmGrid: { type: 'string' },
      syncopation: { type: 'string' },
      timingWarp: { type: 'string' },
      timingIntensity: { type: 'number' },
      registerMin: { type: 'number' },
      registerMax: { type: 'number' },
      instrumentSoundfont: { type: 'string' },
      instrumentPreset: { type: 'string' },
      melodyMode: { type: 'string' },
      customMelody: { type: 'object' },
      presetCode: { type: 'string' },
      compiledPresetCode: { type: 'string' },
      compiledArtifact: { type: 'object' },
      intent: { type: 'object' },
      compiled: { type: 'object' },
      beginner: { type: 'object' },
      advanced: { type: 'object' },
      thoughtStatus: { type: 'string' },
      thoughtVersion: { type: 'number' },
      styleId: { type: 'string' },
      styleSeed: { type: 'number' },
      moodMode: { type: 'string' },
      moodId: { type: 'string' },
      styleOptionModes: { type: 'object' },
      styleOptionLocks: { type: 'object' },
      styleOptionOverrides: { type: 'object' },
      dropdownViewPrefs: { type: 'object' },
      styleResolvedSignature: { type: 'string' },
      style: { type: 'object' },
      harmony: { type: 'object' },
      pattern: { type: 'object' },
      feel: { type: 'object' },
      voice: { type: 'object' },
      resolved: { type: 'object' },
    },
    defaults: {
      label: 'Thought',
      durationBars: 1,
      key: 'C# minor',
      chordRoot: 'C#',
      chordQuality: 'minor',
      chordNotes: '',
      harmonyMode: 'single',
      progressionPresetId: '',
      progressionVariantId: '',
      progressionLength: 'preset',
      chordsPerBar: '1',
      fillBehavior: 'repeat',
      progressionCustom: '',
      progressionCustomVariantStyle: 'triads',
      notePatternId: '',
      rhythmGrid: '1/12',
      syncopation: 'none',
      timingWarp: 'none',
      timingIntensity: 0.0,
      registerMin: 48,
      registerMax: 84,
      instrumentSoundfont: '/assets/soundfonts/General-GS.sf2',
      instrumentPreset: 'gm:0:0',
      melodyMode: 'generated',
      customMelody: {
        grid: '1/16',
        bars: [],
      },
      presetCode: 'MIND|PS2|GV1|role=verse;voice=auto;style=pop;inst=auto;pat=auto;mood=warm;energy=medium;complexity=normal;variation=similar;len=8;reg=mid;reroll=0;style_sub=auto;style_era=auto;style_feel=auto;avoid_arps=auto;avoid_leaps=auto;avoid_busy=auto;avoid_chromatic=auto;voice_art=auto;voice_tone=auto;voice_human=auto;voice_poly=auto;voice_layer=auto;pattern_mask=auto;pattern_density=auto;pattern_accents=auto;pattern_contour=auto;pattern_repeat=auto;mood_tension=auto;mood_bright=auto;mood_resolve=auto;energy_dyn=auto;energy_drive=auto;energy_attack=auto;energy_peaks=auto;complexity_harmony=auto;complexity_melody=auto;complexity_rhythm=auto;complexity_orn=auto;variation_strategy=auto;variation_similarity=auto;variation_window=auto;variation_seedmode=auto;length_phrase=auto;length_cadence=auto;register_width=auto;register_move=auto',
      compiledPresetCode: 'MIND|PS2|GV1|role=verse;voice=auto;style=pop;inst=auto;pat=auto;mood=warm;energy=medium;complexity=normal;variation=similar;len=8;reg=mid;reroll=0;style_sub=auto;style_era=auto;style_feel=auto;avoid_arps=auto;avoid_leaps=auto;avoid_busy=auto;avoid_chromatic=auto;voice_art=auto;voice_tone=auto;voice_human=auto;voice_poly=auto;voice_layer=auto;pattern_mask=auto;pattern_density=auto;pattern_accents=auto;pattern_contour=auto;pattern_repeat=auto;mood_tension=auto;mood_bright=auto;mood_resolve=auto;energy_dyn=auto;energy_drive=auto;energy_attack=auto;energy_peaks=auto;complexity_harmony=auto;complexity_melody=auto;complexity_rhythm=auto;complexity_orn=auto;variation_strategy=auto;variation_similarity=auto;variation_window=auto;variation_seedmode=auto;length_phrase=auto;length_cadence=auto;register_width=auto;register_move=auto',
      compiledArtifact: {
        presetCode: 'MIND|PS2|GV1|role=verse;voice=auto;style=pop;inst=auto;pat=auto;mood=warm;energy=medium;complexity=normal;variation=similar;len=8;reg=mid;reroll=0;style_sub=auto;style_era=auto;style_feel=auto;avoid_arps=auto;avoid_leaps=auto;avoid_busy=auto;avoid_chromatic=auto;voice_art=auto;voice_tone=auto;voice_human=auto;voice_poly=auto;voice_layer=auto;pattern_mask=auto;pattern_density=auto;pattern_accents=auto;pattern_contour=auto;pattern_repeat=auto;mood_tension=auto;mood_bright=auto;mood_resolve=auto;energy_dyn=auto;energy_drive=auto;energy_attack=auto;energy_peaks=auto;complexity_harmony=auto;complexity_melody=auto;complexity_rhythm=auto;complexity_orn=auto;variation_strategy=auto;variation_similarity=auto;variation_window=auto;variation_seedmode=auto;length_phrase=auto;length_cadence=auto;register_width=auto;register_move=auto',
        generatorVersion: 'GV1',
        seed: 0,
      },
      intent: THOUGHT_INTENT_DEFAULTS,
      compiled: THOUGHT_COMPILED_DEFAULTS,
      beginner: {
        role: 'verse',
        voice: 'auto',
        style: 'pop',
        inst: 'auto',
        pat: 'auto',
        mood: 'warm',
        energy: 'medium',
        complexity: 'normal',
        variation: 'similar',
        len: '8',
        reg: 'mid',
        reroll: 0,
      },
      advanced: {
        style: {
          subtype: 'auto',
          era: 'auto',
          feelBias: 'auto',
          avoidArps: 'auto',
          avoidLeaps: 'auto',
          avoidBusy: 'auto',
          avoidChromatic: 'auto',
        },
        voice: {
          articulation: 'auto',
          tone: 'auto',
          humanization: 'auto',
          polyMode: 'auto',
          layering: 'auto',
        },
        pattern: {
          rhythmMask: 'auto',
          density: 'auto',
          accents: 'auto',
          contour: 'auto',
          repetition: 'auto',
        },
        mood: {
          tension: 'auto',
          brightness: 'auto',
          resolution: 'auto',
        },
        energy: {
          dynamics: 'auto',
          drive: 'auto',
          attack: 'auto',
          peaks: 'auto',
        },
        complexity: {
          harmony: 'auto',
          melody: 'auto',
          rhythm: 'auto',
          ornamentation: 'auto',
        },
        variation: {
          strategy: 'auto',
          similarity: 'auto',
          antiRepeat: 'auto',
          seedMode: 'auto',
        },
        length: {
          phrase: 'auto',
          cadence: 'auto',
        },
        register: {
          width: 'auto',
          movement: 'auto',
        },
      },
      thoughtStatus: 'draft',
      thoughtVersion: 1,
      styleId: DEFAULT_STYLE_ID,
      styleSeed: DEFAULT_STYLE_SEED,
      moodMode: 'auto',
      moodId: 'none',
      styleOptionModes: DEFAULT_STYLE_OPTION_MODES,
      styleOptionLocks: {},
      styleOptionOverrides: {},
      dropdownViewPrefs: {},
      styleResolvedSignature: '',
      style: {
        id: DEFAULT_STYLE_ID,
        seed: DEFAULT_STYLE_SEED,
        mood: { mode: 'auto', id: 'none' },
        resolution: {
          modes: DEFAULT_STYLE_OPTION_MODES,
          locks: {},
          overrides: {},
        },
        ui: { dropdownViewPrefs: {} },
      },
      harmony: {
        mode: 'single',
        single: {
          root: 'C#',
          quality: 'minor',
          notesOverride: '',
        },
        preset: {
          id: '',
          variantId: '',
          chordsPerBar: '1',
          fill: 'repeat',
          length: 'preset',
        },
        custom: {
          roman: '',
          variantStyle: 'triads',
          chordsPerBar: '1',
          fill: 'repeat',
          length: 'preset',
        },
      },
      pattern: {
        mode: 'generated',
        generated: {
          id: '',
        },
        custom: {
          grid: '1/16',
          bars: [],
        },
      },
      feel: {
        mode: 'manual',
        presetId: '',
        manual: {
          grid: '1/12',
          syncopation: 'none',
          warp: 'none',
          intensity: 0,
        },
      },
      voice: {
        soundfont: '/assets/soundfonts/General-GS.sf2',
        preset: 'gm:0:0',
        register: {
          min: 48,
          max: 84,
        },
      },
      resolved: {},
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

/**
 * structuredClone() cannot clone functions. Some node definitions include
 * functions (e.g., portBuilder on switch/join). If we structuredClone those
 * definitions, Chrome will throw DataCloneError.
 *
 * This clone() tries structuredClone first for speed, then falls back to a
 * safe deep clone that preserves function references.
 */
function isPlainObject(value) {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function safeClonePreserveFunctions(value, seen = new Map()) {
  // Primitives + null
  if (value === null) return value;

  const t = typeof value;

  // Preserve functions by reference
  if (t === 'function') return value;

  // Primitives
  if (t !== 'object') return value;

  // Cycles
  if (seen.has(value)) return seen.get(value);

  // Arrays
  if (Array.isArray(value)) {
    const arr = new Array(value.length);
    seen.set(value, arr);
    for (let i = 0; i < value.length; i += 1) {
      arr[i] = safeClonePreserveFunctions(value[i], seen);
    }
    return arr;
  }

  // Plain objects
  if (isPlainObject(value)) {
    const obj = {};
    seen.set(value, obj);
    for (const key of Object.keys(value)) {
      obj[key] = safeClonePreserveFunctions(value[key], seen);
    }
    return obj;
  }

  // Other objects (Map/Set/Date/class instances) are not expected in the registry.
  // Preserve reference rather than guessing how to clone.
  return value;
}

function clone(value) {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(value);
    } catch (err) {
      // Fall through to safe clone
    }
  }
  return safeClonePreserveFunctions(value);
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
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
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
    const requiredInputs = (ports.inputs || []).filter((port) => port.required);
    for (const input of requiredInputs) {
      const connected = (edgesByTarget.get(node.id) || []).some(
        (edge) => edge.to?.portId === input.id
      );
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
  STYLE_METADATA_DEFAULTS,
  STYLE_METADATA_LEGACY_DEFAULTS,
  listNodeTypes,
  getNodeDefinition,
  buildPortsForNode,
  getPortDefinition,
  createNode,
  validateConnection,
  validateRequiredInputs,
};
