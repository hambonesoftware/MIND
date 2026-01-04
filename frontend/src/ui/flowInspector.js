import { getNodeDefinition } from '../state/nodeRegistry.js';
import {
  buildProgressionPreview,
  getProgressionPresetById,
  getProgressionPresets,
} from '../music/progressions.js';

const SOUND_FONTS = [
  { value: '/assets/soundfonts/General-GS.sf2', label: 'General GS' },
];

let presetCache = null;
let presetCachePromise = null;

async function loadPresets() {
  if (presetCachePromise) {
    return presetCachePromise;
  }
  presetCachePromise = fetch('/api/presets')
    .then(res => (res.ok ? res.json() : Promise.reject(new Error('Preset load failed'))))
    .then(data => {
      presetCache = Array.isArray(data?.presets) ? data.presets : [];
      return presetCache;
    })
    .catch(() => {
      presetCache = [];
      return presetCache;
    });
  return presetCachePromise;
}

function buildField({ label, type, value, onChange, placeholder, helper }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const input = document.createElement('input');
  input.className = 'flow-field-input';
  input.type = type === 'number' ? 'number' : 'text';
  input.value = value ?? '';
  if (placeholder) {
    input.placeholder = placeholder;
  }
  input.addEventListener('input', () => {
    const nextValue = type === 'number'
      ? Number(input.value)
      : input.value;
    onChange(nextValue);
  });
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  if (helper) {
    const help = document.createElement('span');
    help.className = 'flow-field-help';
    help.textContent = helper;
    wrapper.appendChild(help);
  }
  return wrapper;
}

function buildSelect({ label, value, options, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const select = document.createElement('select');
  select.className = 'flow-field-input';
  options.forEach((option) => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label ?? option.value;
    if (option.value === value) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
  select.addEventListener('change', () => {
    onChange(select.value);
  });
  wrapper.appendChild(title);
  wrapper.appendChild(select);
  return wrapper;
}

function buildTextarea({ label, value, onChange, placeholder, helper }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const input = document.createElement('textarea');
  input.className = 'flow-field-input flow-field-textarea';
  input.value = value ?? '';
  if (placeholder) {
    input.placeholder = placeholder;
  }
  input.addEventListener('input', () => {
    onChange(input.value);
  });
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  if (helper) {
    const help = document.createElement('span');
    help.className = 'flow-field-help';
    help.textContent = helper;
    wrapper.appendChild(help);
  }
  return wrapper;
}

function buildCheckbox({ label, checked, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field flow-field-row';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  input.addEventListener('change', () => {
    onChange(input.checked);
  });
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(title);
  return wrapper;
}

export function createFlowInspector({ store } = {}) {
  const panel = document.createElement('section');
  panel.className = 'flow-panel flow-inspector';

  const header = document.createElement('div');
  header.className = 'flow-panel-header';
  header.textContent = 'Inspector';
  panel.appendChild(header);

  const content = document.createElement('div');
  content.className = 'flow-inspector-content';
  panel.appendChild(content);

  const renderEmpty = () => {
    content.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'flow-inspector-empty';
    empty.textContent = 'Select a node or edge to inspect its properties.';
    content.appendChild(empty);
  };

  const renderSwitchEditor = (node, state) => {
    const params = node.params || {};
    const branches = Array.isArray(params.branches) ? params.branches : [];
    const defaultBranch = params.defaultBranch || 'default';
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };

    const form = document.createElement('div');
    form.className = 'flow-inspector-form';
    form.appendChild(buildField({
      label: 'label',
      type: 'string',
      value: params.label,
      onChange: value => updateParams({ label: value }),
    }));
    form.appendChild(buildSelect({
      label: 'mode',
      value: params.mode || 'first',
      options: [
        { value: 'first', label: 'First match' },
        { value: 'all', label: 'All matches' },
      ],
      onChange: value => updateParams({ mode: value }),
    }));
    form.appendChild(buildField({
      label: 'manualSelection',
      type: 'string',
      value: params.manualSelection || '',
      onChange: value => updateParams({ manualSelection: value }),
    }));
    const branchOptions = [
      { value: 'default', label: 'Default' },
      ...branches.map(branch => ({
        value: branch.id,
        label: branch.label || branch.id,
      })),
    ];
    form.appendChild(buildSelect({
      label: 'defaultBranch',
      value: defaultBranch,
      options: branchOptions,
      onChange: value => updateParams({ defaultBranch: value }),
    }));

    const table = document.createElement('div');
    table.className = 'flow-branch-table';
    branches.forEach((branch, index) => {
      const row = document.createElement('div');
      row.className = 'flow-branch-row';
      const rowHeader = document.createElement('div');
      rowHeader.className = 'flow-branch-header';
      rowHeader.textContent = branch.id;
      row.appendChild(rowHeader);

      const labelField = buildField({
        label: 'label',
        type: 'string',
        value: branch.label || '',
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index ? { ...item, label: value } : item
          ));
          updateParams({ branches: nextBranches });
        },
      });
      row.appendChild(labelField);

      const condition = branch.condition || { type: 'always', value: true };
      row.appendChild(buildSelect({
        label: 'condition',
        value: condition.type || 'always',
        options: [
          { value: 'always', label: 'Always' },
          { value: 'counter', label: 'Counter' },
          { value: 'barIndex', label: 'Bar Index' },
          { value: 'manual', label: 'Manual' },
          { value: 'random', label: 'Random' },
        ],
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { type: value, value: condition.value ?? 0 } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));

      if (condition.type === 'counter') {
        row.appendChild(buildField({
          label: 'counterId',
          type: 'string',
          value: condition.counterId || '',
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, counterId: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
        row.appendChild(buildSelect({
          label: 'operator',
          value: condition.op || '>=',
          options: ['==', '!=', '>=', '<=', '>', '<'].map(op => ({ value: op, label: op })),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, op: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
        row.appendChild(buildField({
          label: 'value',
          type: 'number',
          value: condition.value ?? 0,
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'barIndex') {
        row.appendChild(buildSelect({
          label: 'operator',
          value: condition.op || '>=',
          options: ['==', '!=', '>=', '<=', '>', '<'].map(op => ({ value: op, label: op })),
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, op: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
        row.appendChild(buildField({
          label: 'value',
          type: 'number',
          value: condition.value ?? 0,
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'manual') {
        row.appendChild(buildField({
          label: 'value',
          type: 'string',
          value: condition.value || '',
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'random') {
        row.appendChild(buildField({
          label: 'threshold',
          type: 'number',
          value: condition.threshold ?? 0.5,
          onChange: (value) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, threshold: value } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      } else if (condition.type === 'always') {
        row.appendChild(buildCheckbox({
          label: 'value',
          checked: condition.value !== false,
          onChange: (checked) => {
            const nextBranches = branches.map((item, idx) => (
              idx === index
                ? { ...item, condition: { ...condition, value: checked } }
                : item
            ));
            updateParams({ branches: nextBranches });
          },
        }));
      }

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'flow-branch-remove';
      removeButton.textContent = 'Remove';
      removeButton.addEventListener('click', () => {
        const nextBranches = branches.filter((_, idx) => idx !== index);
        const nextDefault = nextBranches.some(b => b.id === defaultBranch) ? defaultBranch : 'default';
        updateParams({ branches: nextBranches, defaultBranch: nextDefault });
      });
      row.appendChild(removeButton);

      table.appendChild(row);
    });

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'flow-branch-add';
    addButton.textContent = 'Add branch';
    addButton.addEventListener('click', () => {
      const index = branches.length + 1;
      const nextBranch = {
        id: `branch-${index}`,
        label: `Branch ${index}`,
        condition: { type: 'always', value: true },
      };
      updateParams({ branches: [...branches, nextBranch] });
    });

    const layout = document.createElement('div');
    layout.className = 'flow-inspector-stack';
    layout.appendChild(form);
    layout.appendChild(table);
    layout.appendChild(addButton);
    return layout;
  };

  const renderCounterEditor = (node) => {
    const params = node.params || {};
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };
    const form = document.createElement('div');
    form.className = 'flow-inspector-form';
    form.appendChild(buildField({
      label: 'label',
      type: 'string',
      value: params.label,
      onChange: value => updateParams({ label: value }),
    }));
    form.appendChild(buildField({
      label: 'start',
      type: 'number',
      value: params.start ?? 0,
      onChange: value => updateParams({ start: value }),
    }));
    form.appendChild(buildField({
      label: 'step',
      type: 'number',
      value: params.step ?? 1,
      onChange: value => updateParams({ step: value }),
    }));
    form.appendChild(buildCheckbox({
      label: 'reset on play',
      checked: params.resetOnPlay !== false,
      onChange: checked => updateParams({ resetOnPlay: checked }),
    }));
    return form;
  };

  const renderJoinEditor = (node, state) => {
    const params = node.params || {};
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };
    const incoming = (state.edges || []).filter(edge => edge.to?.nodeId === node.id);
    const form = document.createElement('div');
    form.className = 'flow-inspector-form';
    form.appendChild(buildField({
      label: 'label',
      type: 'string',
      value: params.label,
      onChange: value => updateParams({ label: value }),
    }));
    form.appendChild(buildSelect({
      label: 'quantize',
      value: params.quantize || 'next-bar',
      options: [
        { value: 'next-bar', label: 'Next bar' },
        { value: 'immediate', label: 'Immediate' },
      ],
      onChange: value => updateParams({ quantize: value }),
    }));
    const summary = document.createElement('div');
    summary.className = 'flow-inspector-meta';
    summary.textContent = `Incoming connections: ${incoming.length}`;
    form.appendChild(summary);
    return form;
  };

  const renderThoughtEditor = (node) => {
    const params = node.params || {};
    const updateParams = (next) => {
      store.updateNode(node.id, {
        params: {
          ...params,
          ...next,
        },
      });
    };

    const form = document.createElement('div');
    form.className = 'flow-inspector-form';
    form.appendChild(buildField({
      label: 'label',
      type: 'string',
      value: params.label,
      onChange: value => updateParams({ label: value }),
    }));
    form.appendChild(buildField({
      label: 'durationBars',
      type: 'number',
      value: params.durationBars ?? 1,
      onChange: value => updateParams({ durationBars: value }),
    }));
    form.appendChild(buildField({
      label: 'key',
      type: 'string',
      value: params.key || 'C# minor',
      onChange: value => updateParams({ key: value }),
    }));
    form.appendChild(buildSelect({
      label: 'harmonyMode',
      value: params.harmonyMode || 'single',
      options: [
        { value: 'single', label: 'Single Chord' },
        { value: 'progression_preset', label: 'Progression (Preset)' },
        { value: 'progression_custom', label: 'Progression (Custom)' },
      ],
      onChange: value => updateParams({ harmonyMode: value }),
    }));

    const harmonyMode = params.harmonyMode || 'single';
    if (harmonyMode === 'single') {
      form.appendChild(buildField({
        label: 'chordRoot',
        type: 'string',
        value: params.chordRoot || '',
        onChange: value => updateParams({ chordRoot: value }),
      }));
      form.appendChild(buildSelect({
        label: 'chordQuality',
        value: params.chordQuality || 'minor',
        options: [
          { value: 'major', label: 'Major' },
          { value: 'minor', label: 'Minor' },
          { value: 'diminished', label: 'Diminished' },
          { value: 'augmented', label: 'Augmented' },
        ],
        onChange: value => updateParams({ chordQuality: value }),
      }));
      form.appendChild(buildField({
        label: 'Chord Notes Override',
        type: 'string',
        value: params.chordNotes || '',
        placeholder: 'C#4:E4:G#4',
        helper: 'Optional. One chord only. Colon-separated notes (with octave) or MIDI numbers (e.g., 61:64:68). Overrides Chord Root/Quality.',
        onChange: value => updateParams({ chordNotes: value }),
      }));
    }

    if (harmonyMode === 'progression_preset') {
      const presets = getProgressionPresets();
      const presetOptions = presets.map(preset => ({ value: preset.id, label: preset.name }));
      const activePreset = getProgressionPresetById(params.progressionPresetId) || presets[0];
      const presetId = params.progressionPresetId || activePreset?.id || '';
      const variantOptions = (activePreset?.variants || []).map(variant => ({
        value: variant.id,
        label: variant.label,
      }));
      form.appendChild(buildSelect({
        label: 'progressionPresetId',
        value: presetId,
        options: presetOptions,
        onChange: value => updateParams({ progressionPresetId: value }),
      }));
      form.appendChild(buildSelect({
        label: 'progressionVariantId',
        value: params.progressionVariantId || activePreset?.variants?.[0]?.id || 'triads',
        options: variantOptions,
        onChange: value => updateParams({ progressionVariantId: value }),
      }));
      form.appendChild(buildSelect({
        label: 'chordsPerBar',
        value: params.chordsPerBar || '1',
        options: [
          { value: '1', label: '1 chord per bar' },
          { value: '2', label: '2 chords per bar' },
          { value: '0.5', label: '1 chord per 2 bars' },
        ],
        onChange: value => updateParams({ chordsPerBar: value }),
      }));
      form.appendChild(buildSelect({
        label: 'fillBehavior',
        value: params.fillBehavior || 'repeat',
        options: [
          { value: 'repeat', label: 'Repeat' },
          { value: 'hold_last', label: 'Hold last' },
          { value: 'rest', label: 'Rest' },
        ],
        onChange: value => updateParams({ fillBehavior: value }),
      }));
      form.appendChild(buildSelect({
        label: 'progressionLength',
        value: params.progressionLength ?? 'preset',
        options: [
          { value: 'preset', label: 'Preset length' },
          { value: '2', label: '2 bars' },
          { value: '4', label: '4 bars' },
          { value: '8', label: '8 bars' },
          { value: '16', label: '16 bars' },
        ],
        onChange: value => updateParams({ progressionLength: value }),
      }));
    }

    if (harmonyMode === 'progression_custom') {
      form.appendChild(buildTextarea({
        label: 'progressionCustom',
        value: params.progressionCustom || '',
        placeholder: 'i VII VI VII',
        helper: 'Enter roman numerals separated by spaces.',
        onChange: value => updateParams({ progressionCustom: value }),
      }));
      form.appendChild(buildSelect({
        label: 'progressionCustomVariantStyle',
        value: params.progressionCustomVariantStyle || 'triads',
        options: [
          { value: 'triads', label: 'Triads' },
          { value: '7ths', label: '7ths' },
          { value: '9ths_soft', label: '9ths (soft)' },
        ],
        onChange: value => updateParams({ progressionCustomVariantStyle: value }),
      }));
      form.appendChild(buildSelect({
        label: 'chordsPerBar',
        value: params.chordsPerBar || '1',
        options: [
          { value: '1', label: '1 chord per bar' },
          { value: '2', label: '2 chords per bar' },
          { value: '0.5', label: '1 chord per 2 bars' },
        ],
        onChange: value => updateParams({ chordsPerBar: value }),
      }));
      form.appendChild(buildSelect({
        label: 'fillBehavior',
        value: params.fillBehavior || 'repeat',
        options: [
          { value: 'repeat', label: 'Repeat' },
          { value: 'hold_last', label: 'Hold last' },
          { value: 'rest', label: 'Rest' },
        ],
        onChange: value => updateParams({ fillBehavior: value }),
      }));
      form.appendChild(buildSelect({
        label: 'progressionLength',
        value: params.progressionLength ?? 'preset',
        options: [
          { value: 'preset', label: 'Custom length' },
          { value: '2', label: '2 bars' },
          { value: '4', label: '4 bars' },
          { value: '8', label: '8 bars' },
          { value: '16', label: '16 bars' },
        ],
        onChange: value => updateParams({ progressionLength: value }),
      }));
    }

    if (harmonyMode !== 'single') {
      const preview = buildProgressionPreview({
        ...params,
        harmonyMode,
        progressionPresetId: params.progressionPresetId || getProgressionPresets()[0]?.id,
      });
      if (preview) {
        form.appendChild(buildProgressionPreviewStrip(preview));
      }
    }
    form.appendChild(buildSelect({
      label: 'patternType',
      value: params.patternType || 'arp-3-up',
      options: [
        { value: 'arp-3-up', label: 'Arpeggio 3 Up' },
        { value: 'arp-3-down', label: 'Arpeggio 3 Down' },
        { value: 'arp-3-skip', label: 'Arpeggio 3 Skip' },
      ],
      onChange: value => updateParams({ patternType: value }),
    }));
    form.appendChild(buildSelect({
      label: 'rhythmGrid',
      value: params.rhythmGrid || '1/12',
      options: [
        { value: '1/4', label: 'Quarter (1/4)' },
        { value: '1/8', label: 'Eighth (1/8)' },
        { value: '1/12', label: 'Triplet (1/12)' },
        { value: '1/16', label: 'Sixteenth (1/16)' },
        { value: '1/24', label: '1/24' },
      ],
      onChange: value => updateParams({ rhythmGrid: value }),
    }));
    form.appendChild(buildSelect({
      label: 'syncopation',
      value: params.syncopation || 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'offbeat', label: 'Offbeat' },
        { value: 'anticipation', label: 'Anticipation' },
      ],
      onChange: value => updateParams({ syncopation: value }),
    }));
    form.appendChild(buildSelect({
      label: 'timingWarp',
      value: params.timingWarp || 'none',
      options: [
        { value: 'none', label: 'None' },
        { value: 'swing', label: 'Swing' },
        { value: 'shuffle', label: 'Shuffle' },
      ],
      onChange: value => updateParams({ timingWarp: value }),
    }));
    form.appendChild(buildField({
      label: 'timingIntensity',
      type: 'number',
      value: params.timingIntensity ?? 0,
      onChange: value => updateParams({ timingIntensity: value }),
    }));
    form.appendChild(buildField({
      label: 'registerMin',
      type: 'number',
      value: params.registerMin ?? 48,
      onChange: value => updateParams({ registerMin: value }),
    }));
    form.appendChild(buildField({
      label: 'registerMax',
      type: 'number',
      value: params.registerMax ?? 84,
      onChange: value => updateParams({ registerMax: value }),
    }));
    form.appendChild(buildSelect({
      label: 'instrumentSoundfont',
      value: params.instrumentSoundfont || SOUND_FONTS[0].value,
      options: SOUND_FONTS,
      onChange: value => updateParams({ instrumentSoundfont: value }),
    }));

    const presets = presetCache || [];
    if (presets.length > 0) {
      form.appendChild(buildSelect({
        label: 'instrumentPreset',
        value: params.instrumentPreset || presets[0].id,
        options: presets.map(preset => ({ value: preset.id, label: preset.name })),
        onChange: value => updateParams({ instrumentPreset: value }),
      }));
    } else {
      form.appendChild(buildField({
        label: 'instrumentPreset',
        type: 'string',
        value: params.instrumentPreset || '',
        onChange: value => updateParams({ instrumentPreset: value }),
      }));
    }

    const moonlightButton = document.createElement('button');
    moonlightButton.type = 'button';
    moonlightButton.className = 'flow-branch-add';
    moonlightButton.textContent = 'Apply Moonlight Opening Arp';
    moonlightButton.addEventListener('click', () => {
      updateParams({
        key: 'C# minor',
        chordRoot: 'C#',
        chordQuality: 'minor',
        patternType: 'arp-3-up',
        rhythmGrid: '1/12',
        syncopation: 'none',
        timingWarp: 'none',
        timingIntensity: 0,
        durationBars: 1,
        instrumentPreset: 'gm_piano',
      });
    });
    form.appendChild(moonlightButton);
    return form;
  };

  const buildProgressionPreviewStrip = (preview) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'flow-progression-preview';

    const header = document.createElement('div');
    header.className = 'flow-progression-preview-title';
    header.textContent = 'Progression Preview';
    wrapper.appendChild(header);

    const rows = [
      { label: 'Bars', getter: bar => String(bar.index) },
      { label: 'Roman', getter: bar => bar.romans.join(' • ') },
      { label: 'Chords', getter: bar => bar.chords.join(' • ') },
    ];

    rows.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'flow-progression-preview-row';
      const label = document.createElement('div');
      label.className = 'flow-progression-preview-label';
      label.textContent = row.label;
      rowEl.appendChild(label);
      const cells = document.createElement('div');
      cells.className = 'flow-progression-preview-cells';
      preview.bars.forEach((bar) => {
        const cell = document.createElement('div');
        cell.className = 'flow-progression-preview-cell';
        cell.textContent = row.getter(bar);
        cells.appendChild(cell);
      });
      rowEl.appendChild(cells);
      wrapper.appendChild(rowEl);
    });

    return wrapper;
  };

  const renderNode = (node, state) => {
    content.innerHTML = '';
    const definition = getNodeDefinition(node.type);
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = definition?.label || node.type;
    content.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'flow-inspector-meta';
    meta.textContent = `ID: ${node.id}`;
    content.appendChild(meta);

    if (node.type === 'switch') {
      content.appendChild(renderSwitchEditor(node, state));
    } else if (node.type === 'counter') {
      content.appendChild(renderCounterEditor(node));
    } else if (node.type === 'join') {
      content.appendChild(renderJoinEditor(node, state));
    } else if (node.type === 'thought') {
      content.appendChild(renderThoughtEditor(node));
    } else {
    const schema = definition?.paramSchema || {};
    const params = node.params || {};
    const fields = Object.keys(schema);
    if (fields.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'flow-inspector-empty';
      empty.textContent = 'No configurable parameters for this node.';
      content.appendChild(empty);
    } else {
      const form = document.createElement('div');
      form.className = 'flow-inspector-form';
      fields.forEach((key) => {
        const field = buildField({
          label: key,
          type: schema[key]?.type || 'string',
          value: params[key],
          onChange: (value) => {
            store.updateNode(node.id, {
              params: {
                ...params,
                [key]: value,
              },
            });
          },
        });
        form.appendChild(field);
      });
      content.appendChild(form);
    }
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'flow-danger';
    deleteButton.textContent = 'Delete Node';
    deleteButton.addEventListener('click', () => {
      store.removeNode(node.id);
    });
    content.appendChild(deleteButton);
  };

  const renderEdge = (edge, nodeMap) => {
    content.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = 'Edge';
    content.appendChild(title);
    const fromNode = nodeMap.get(edge.from.nodeId);
    const toNode = nodeMap.get(edge.to.nodeId);
    const details = document.createElement('div');
    details.className = 'flow-inspector-meta';
    details.textContent = `From ${fromNode?.type || edge.from.nodeId}:${edge.from.portId} → ${toNode?.type || edge.to.nodeId}:${edge.to.portId}`;
    content.appendChild(details);
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'flow-danger';
    deleteButton.textContent = 'Delete Edge';
    deleteButton.addEventListener('click', () => {
      store.removeEdge(edge.id);
    });
    content.appendChild(deleteButton);
  };

  const update = (state) => {
    const selection = state.selection || { nodes: [], edges: [] };
    if (selection.nodes.length > 0) {
      const node = state.nodes.find(item => item.id === selection.nodes[0]);
      if (node) {
        renderNode(node, state);
        return;
      }
    }
    if (selection.edges.length > 0) {
      const edge = state.edges.find(item => item.id === selection.edges[0]);
      if (edge) {
        const nodeMap = new Map(state.nodes.map(node => [node.id, node]));
        renderEdge(edge, nodeMap);
        return;
      }
    }
    renderEmpty();
  };

  loadPresets().finally(() => {
    update(store.getState());
  });
  update(store.getState());
  const unsubscribe = store.subscribe(update);

  return {
    element: panel,
    destroy: () => unsubscribe(),
  };
}
