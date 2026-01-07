import { getNodeDefinition } from '../state/nodeRegistry.js';
import {
  buildProgressionPreview,
  getProgressionPresetById,
  getProgressionPresets,
} from '../music/progressions.js';
import { STYLE_CATALOG } from '../music/styleCatalog.js';
import { buildStyleOptionSets, resolveThoughtStyle } from '../music/styleResolver.js';
import { PATTERN_BY_ID } from '../music/patternCatalog.js';
import { insertMoonlightTrebleTemplate } from '../templates/moonlightTreble.js';
import {
  buildPresetRhythmA,
  buildPresetRhythmB,
  getStepsPerBar,
  listNoteStarts,
  normalizeBars,
  normalizeRhythm,
  syncNotesToRhythm,
  tokenizeNotes,
} from './customMelodyModel.js';
import { createStepStrip } from './stepStrip.js';

const SOUND_FONTS = [
  { value: '/assets/soundfonts/General-GS.sf2', label: 'General GS' },
];

const STYLE_DROPDOWN_VIEW_OPTIONS = [
  { value: 'recommended', label: 'Recommended (Style+Mood)' },
  { value: 'all', label: 'All in Style' },
];

let currentFocusScope = '';

function debounce(fn, delay = 250) {
  let timeout = null;
  let lastArgs = null;
  const wrapped = (...args) => {
    lastArgs = args;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      fn(...(lastArgs || []));
    }, delay);
  };
  wrapped.flush = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      if (lastArgs) {
        fn(...lastArgs);
      }
    }
  };
  return wrapped;
}

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

const customMelodyState = new Map();
let customMelodyClipboard = null;

function buildField({ label, type, value, onChange, placeholder, helper, focusKey, commitDelay = 250 }) {
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
  const keyBase = focusKey || label;
  if (keyBase) {
    const scopedKey = currentFocusScope ? `${currentFocusScope}:${keyBase}` : keyBase;
    input.dataset.focusKey = scopedKey;
  }
  const commit = debounce((nextValue) => {
    onChange(nextValue);
  }, commitDelay);
  input.addEventListener('input', () => {
    const nextValue = type === 'number'
      ? Number(input.value)
      : input.value;
    commit(nextValue);
  });
  input.addEventListener('blur', () => {
    if (typeof commit.flush === 'function') {
      commit.flush();
    }
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

function buildToggle({ label, checked, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  input.addEventListener('change', () => onChange(input.checked));
  const text = document.createElement('span');
  text.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(text);
  return wrapper;
}

function buildSelect({ label, value, options, onChange, focusKey }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const select = document.createElement('select');
  select.className = 'flow-field-input';
  const keyBase = focusKey || label;
  if (keyBase) {
    const scopedKey = currentFocusScope ? `${currentFocusScope}:${keyBase}` : keyBase;
    select.dataset.focusKey = scopedKey;
  }
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

function buildTextarea({ label, value, onChange, placeholder, helper, focusKey, commitDelay = 250 }) {
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
  const keyBase = focusKey || label;
  if (keyBase) {
    const scopedKey = currentFocusScope ? `${currentFocusScope}:${keyBase}` : keyBase;
    input.dataset.focusKey = scopedKey;
  }
  const commit = debounce(onChange, commitDelay);
  input.addEventListener('input', () => {
    commit(input.value);
  });
  input.addEventListener('blur', () => {
    if (typeof commit.flush === 'function') {
      commit.flush();
    }
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

  const captureFocusState = () => {
    const active = document.activeElement;
    if (!active || !content.contains(active)) {
      return null;
    }
    const key = active.dataset?.focusKey || null;
    const selectionStart = typeof active.selectionStart === 'number' ? active.selectionStart : null;
    const selectionEnd = typeof active.selectionEnd === 'number' ? active.selectionEnd : null;
    return { key, selectionStart, selectionEnd };
  };

  const restoreFocusState = (state) => {
    if (!state || !state.key) {
      return;
    }
    const targets = Array.from(content.querySelectorAll('[data-focus-key]'));
    const match = targets.find(el => el.dataset.focusKey === state.key);
    if (!match) {
      return;
    }
    match.focus({ preventScroll: true });
    if (typeof match.setSelectionRange === 'function' && state.selectionStart !== null && state.selectionEnd !== null) {
      const length = typeof match.value === 'string' ? match.value.length : 0;
      const start = Math.min(state.selectionStart, length);
      const end = Math.min(state.selectionEnd, length);
      try {
        match.setSelectionRange(start, end);
      } catch (error) {
        // ignore selection errors
      }
    }
  };

  const renderEmpty = () => {
    currentFocusScope = 'empty';
    content.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'flow-inspector-empty';
    empty.textContent = 'Select a node or edge to inspect its properties.';
    content.appendChild(empty);

    const templates = document.createElement('div');
    templates.className = 'flow-inspector-templates';
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = 'Templates';
    templates.appendChild(title);

    const templateButton = document.createElement('button');
    templateButton.type = 'button';
    templateButton.className = 'flow-branch-add';
    templateButton.textContent = 'Insert Moonlight Treble (Bars 1–16)';
    templateButton.addEventListener('click', () => {
      insertMoonlightTrebleTemplate(store);
    });
    templates.appendChild(templateButton);
    content.appendChild(templates);
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
      const focusKeyFor = suffix => `${node.id}-branch-${branch.id || index}-${suffix}`;
      const rowHeader = document.createElement('div');
      rowHeader.className = 'flow-branch-header';
      rowHeader.textContent = branch.id;
      row.appendChild(rowHeader);

      const labelField = buildField({
        label: 'label',
        type: 'string',
        value: branch.label || '',
        focusKey: focusKeyFor('label'),
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
          focusKey: focusKeyFor('counterId'),
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
          focusKey: focusKeyFor('counter-value'),
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
          focusKey: focusKeyFor('bar-index'),
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
          focusKey: focusKeyFor('manual-value'),
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
          focusKey: focusKeyFor('threshold'),
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
    const coerceSeed = (value, fallback = 1) => (
      Number.isFinite(value) ? Number(value) : fallback
    );
    const buildStyleSignature = ({ styleId, moodId, styleSeed }) => `${styleId}|${moodId}|${styleSeed}`;
    const getDropdownView = (key) => (params.dropdownViewPrefs?.[key] || 'recommended');
    const updateDropdownPrefs = (key, value) => {
      const nextPrefs = { ...(params.dropdownViewPrefs || {}) };
      nextPrefs[key] = value;
      updateParams({ dropdownViewPrefs: nextPrefs });
    };
    const ensureOptionPresence = (options, currentValue, labelResolver) => {
      if (!currentValue) return options;
      if (options.some(option => option.value === currentValue)) {
        return options;
      }
      const label = labelResolver ? labelResolver(currentValue) : currentValue;
      return [...options, { value: currentValue, label }];
    };
    const computeStyleContext = () => buildStyleOptionSets({
      styleId: params.styleId || (STYLE_CATALOG[0]?.id || 'classical_film'),
      moodId: params.moodId || 'none',
      moodMode: 'override',
      styleSeed: coerceSeed(params.styleSeed, 1),
      nodeId: node.id,
    });
    const styleContext = computeStyleContext();

    const applyStyleResolution = ({ nextSeed, nextStyleId, nextMoodId } = {}) => {
      const seedToUse = coerceSeed(nextSeed ?? params.styleSeed, 1);
      const styleId = nextStyleId || params.styleId || (STYLE_CATALOG[0]?.id || 'classical_film');
      const moodId = nextMoodId || params.moodId || 'none';
      const moodMode = 'override';
      const resolved = resolveThoughtStyle({
        styleId,
        styleSeed: seedToUse,
        nodeId: node.id,
        moodMode,
        moodId,
      });
      const resolvedPresetId = resolved.progressionPresetId ?? params.progressionPresetId;
      const resolvedVariantId = resolved.progressionVariantId ?? params.progressionVariantId;
      const resolvedLength = resolved.progressionLength ?? params.progressionLength;
      const preset = getProgressionPresetById(resolvedPresetId);
      const progressionCustom = preset ? (preset.romans || []).join(' ') : (params.progressionCustom || '');
      const progressionCustomVariantStyle = resolvedVariantId || params.progressionCustomVariantStyle || 'triads';
      const nextMoodIdValue = resolved.moodId || moodId;
      const nextSignature = buildStyleSignature({
        styleId,
        moodId: nextMoodIdValue,
        styleSeed: seedToUse,
      });

      const nextParams = {
        styleId,
        styleSeed: seedToUse,
        moodMode,
        moodId: nextMoodIdValue,
        styleResolvedSignature: nextSignature,
        harmonyMode: resolved.harmonyMode ?? params.harmonyMode ?? 'progression_preset',
        progressionPresetId: resolvedPresetId,
        progressionVariantId: resolvedVariantId,
        chordsPerBar: resolved.chordsPerBar ?? params.chordsPerBar,
        fillBehavior: resolved.fillBehavior ?? params.fillBehavior,
        progressionLength: resolvedLength,
        progressionCustom,
        progressionCustomVariantStyle,
        notePatternId: resolved.notePatternId ?? params.notePatternId,
        patternType: resolved.patternType ?? params.patternType,
        rhythmGrid: resolved.rhythmGrid ?? params.rhythmGrid,
        syncopation: resolved.syncopation ?? params.syncopation,
        timingWarp: resolved.timingWarp ?? params.timingWarp,
        timingIntensity: resolved.timingIntensity ?? params.timingIntensity,
        instrumentPreset: resolved.instrumentPreset ?? params.instrumentPreset,
        registerMin: resolved.registerMin ?? params.registerMin,
        registerMax: resolved.registerMax ?? params.registerMax,
        dropdownViewPrefs: params.dropdownViewPrefs || {},
      };
      if (preset && (resolvedLength === 'preset' || resolvedLength == null)) {
        nextParams.progressionLength = preset.defaultLength || (preset.romans?.length || 'preset');
      }
      updateParams(nextParams);
    };

    const rerollSeed = () => {
      const nextSeed = coerceSeed(params.styleSeed, 1) + 1;
      applyStyleResolution({ nextSeed });
    };

    const copySeed = async () => {
      const seedValue = params.styleSeed ?? '';
      if (navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(String(seedValue));
        } catch (error) {
          // ignore copy errors silently
        }
      }
    };

    const pasteSeed = async () => {
      let text = '';
      if (navigator?.clipboard?.readText) {
        try {
          text = await navigator.clipboard.readText();
        } catch (error) {
          text = '';
        }
      }
      const parsed = Number.parseInt(text, 10);
      if (Number.isFinite(parsed)) {
        applyStyleResolution({ nextSeed: parsed });
      }
    };

    const buildSection = (title, body, { collapsible = false, defaultOpen = true } = {}) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section';
      if (collapsible) {
        const details = document.createElement('details');
        details.open = defaultOpen;
        const summary = document.createElement('summary');
        summary.className = 'flow-section-title';
        summary.textContent = title;
        details.appendChild(summary);
        details.appendChild(body);
        wrapper.appendChild(details);
        return wrapper;
      }
      const header = document.createElement('div');
      header.className = 'flow-section-title';
      header.textContent = title;
      wrapper.appendChild(header);
      wrapper.appendChild(body);
      return wrapper;
    };

    const getStyleDefinition = () => styleContext?.style || STYLE_CATALOG[0] || null;

    const buildCustomMelodyEditor = () => {
      const durationBars = Math.max(params.durationBars ?? 1, 1);
      const grid = params.customMelody?.grid || params.rhythmGrid || '1/16';
      const stepsPerBar = getStepsPerBar(grid);
      const rawBars = params.customMelody?.bars;
      const barCount = durationBars;
      const emptyBar = normalizeBars([], 1, stepsPerBar)[0];
      const baseBars = normalizeBars(
        rawBars,
        Math.max(barCount, Array.isArray(rawBars) ? rawBars.length : 0),
        stepsPerBar
      );
      const bars = baseBars.slice(0, barCount);
      const savedState = customMelodyState.get(node.id) || { barIndex: 0 };
      let activeIndex = Math.min(Math.max(savedState.barIndex ?? 0, 0), bars.length - 1);
      if (activeIndex !== savedState.barIndex) {
        customMelodyState.set(node.id, { ...savedState, barIndex: activeIndex });
      }

      const mergeBars = (nextSubset) => {
        const mergedLength = Math.max(
          baseBars.length,
          Array.isArray(nextSubset) ? nextSubset.length : 0,
          barCount
        );
        const merged = [];
        for (let idx = 0; idx < mergedLength; idx += 1) {
          if (Array.isArray(nextSubset) && nextSubset[idx]) {
            merged[idx] = nextSubset[idx];
          } else if (baseBars[idx]) {
            merged[idx] = baseBars[idx];
          } else {
            merged[idx] = emptyBar;
          }
        }
        return merged;
      };

      const writeBars = (nextBars, nextGrid = grid) => {
        const targetGrid = nextGrid || grid;
        const merged = mergeBars(nextBars);
        const normalized = normalizeBars(
          merged,
          Math.max(barCount, merged.length),
          getStepsPerBar(targetGrid)
        );
        updateParams({
          customMelody: {
            grid: targetGrid,
            bars: normalized,
          },
        });
      };

      const wrapper = document.createElement('div');
      wrapper.className = 'melody-card';

      const header = document.createElement('div');
      header.className = 'melody-card-header';
      header.textContent = 'Custom Melody';
      wrapper.appendChild(header);

      const topRow = document.createElement('div');
      topRow.className = 'melody-row';
      const gridField = buildSelect({
        label: 'Grid',
        value: grid,
        options: [
          { value: '1/4', label: 'Quarter (1/4)' },
          { value: '1/8', label: 'Eighth (1/8)' },
          { value: '1/12', label: 'Triplet (1/12)' },
          { value: '1/16', label: 'Sixteenth (1/16)' },
          { value: '1/24', label: '1/24' },
        ],
        onChange: (value) => {
          const nextSteps = getStepsPerBar(value);
          const nextBars = normalizeBars(baseBars, Math.max(barCount, baseBars.length), nextSteps);
          writeBars(nextBars, value);
        },
      });
      gridField.classList.add('melody-field');
      topRow.appendChild(gridField);

      const barField = buildSelect({
        label: 'Bar (within thought)',
        value: String(activeIndex),
        options: bars.map((_, idx) => ({ value: String(idx), label: `Bar ${idx + 1}` })),
        onChange: (value) => {
          activeIndex = Math.min(Math.max(Number(value) || 0, 0), bars.length - 1);
          customMelodyState.set(node.id, { ...savedState, barIndex: activeIndex });
          renderBarDetails();
        },
      });
      barField.classList.add('melody-field');
      topRow.appendChild(barField);
      wrapper.appendChild(topRow);

      const stripContainer = document.createElement('div');
      stripContainer.className = 'melody-strip-container';
      const stripHint = document.createElement('div');
      stripHint.className = 'melody-hint';
      stripHint.textContent = 'Click to toggle notes, double-click to add/remove holds, right-click to clear.';
      stripContainer.appendChild(stripHint);

      const stepStrip = createStepStrip({
        steps: normalizeRhythm(bars[activeIndex]?.rhythm, stepsPerBar).split(''),
        onChange: (nextSteps) => {
          const raw = (nextSteps || []).join('').slice(0, stepsPerBar).padEnd(stepsPerBar, '.');
          const rhythm = normalizeRhythm(raw, stepsPerBar);
          const nextBars = bars.map((bar, idx) => (
            idx === activeIndex
              ? { rhythm, notes: syncNotesToRhythm(bar.notes, rhythm) }
              : bar
          ));
          writeBars(nextBars);
        },
      });
      stripContainer.appendChild(stepStrip.element);
      wrapper.appendChild(stripContainer);

      const actions = document.createElement('div');
      actions.className = 'melody-actions';

      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.textContent = 'Copy bar';
      copyButton.addEventListener('click', () => {
        const bar = bars[activeIndex] || { rhythm: '', notes: '' };
        customMelodyClipboard = { rhythm: bar.rhythm, notes: bar.notes };
        pasteButton.disabled = false;
      });
      actions.appendChild(copyButton);

      const pasteButton = document.createElement('button');
      pasteButton.type = 'button';
      pasteButton.textContent = 'Paste bar';
      pasteButton.disabled = !customMelodyClipboard;
      pasteButton.addEventListener('click', () => {
        if (!customMelodyClipboard) return;
        const rhythm = normalizeRhythm(customMelodyClipboard.rhythm, stepsPerBar);
        const notes = syncNotesToRhythm(customMelodyClipboard.notes, rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(pasteButton);

      const copyPrevButton = document.createElement('button');
      copyPrevButton.type = 'button';
      copyPrevButton.textContent = 'Copy previous';
      copyPrevButton.disabled = activeIndex === 0;
      copyPrevButton.addEventListener('click', () => {
        if (activeIndex === 0) return;
        const prev = bars[activeIndex - 1] || { rhythm: '', notes: '' };
        const rhythm = normalizeRhythm(prev.rhythm, stepsPerBar);
        const notes = syncNotesToRhythm(prev.notes, rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(copyPrevButton);

      const presetAButton = document.createElement('button');
      presetAButton.type = 'button';
      presetAButton.textContent = 'Preset A';
      presetAButton.addEventListener('click', () => {
        const rhythm = normalizeRhythm(buildPresetRhythmA(stepsPerBar), stepsPerBar);
        const notes = syncNotesToRhythm(bars[activeIndex]?.notes || '', rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(presetAButton);

      const presetBButton = document.createElement('button');
      presetBButton.type = 'button';
      presetBButton.textContent = 'Preset B';
      presetBButton.addEventListener('click', () => {
        const rhythm = normalizeRhythm(buildPresetRhythmB(stepsPerBar), stepsPerBar);
        const notes = syncNotesToRhythm(bars[activeIndex]?.notes || '', rhythm);
        const nextBars = bars.map((bar, idx) => (
          idx === activeIndex ? { rhythm, notes } : bar
        ));
        writeBars(nextBars);
      });
      actions.appendChild(presetBButton);

      wrapper.appendChild(actions);

      const notesSection = document.createElement('div');
      notesSection.className = 'melody-notes';
      const notesHeader = document.createElement('div');
      notesHeader.className = 'melody-notes-header';
      notesHeader.textContent = 'Notes (aligned to note starts)';
      notesSection.appendChild(notesHeader);
      const notesList = document.createElement('div');
      notesList.className = 'melody-notes-list';
      notesSection.appendChild(notesList);
      wrapper.appendChild(notesSection);

      const renderBarDetails = () => {
        const bar = bars[activeIndex] || { rhythm: '.'.repeat(stepsPerBar), notes: '' };
        const normalizedRhythm = normalizeRhythm(bar.rhythm, stepsPerBar);
        stepStrip.setSteps(normalizedRhythm.split(''));

        notesList.innerHTML = '';
        const noteStarts = listNoteStarts(normalizedRhythm);
        const tokens = tokenizeNotes(bar.notes);
        if (noteStarts.length === 0) {
          const empty = document.createElement('div');
          empty.className = 'melody-hint';
          empty.textContent = 'Add note-on steps in the rhythm to enter notes.';
          notesList.appendChild(empty);
          return;
        }
        noteStarts.forEach((stepIndex, noteIndex) => {
          const row = document.createElement('div');
          row.className = 'melody-note-row';
          const label = document.createElement('span');
          label.className = 'melody-note-label';
          label.textContent = `Note ${noteIndex + 1} (Step ${stepIndex + 1})`;
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'melody-note-input';
          input.placeholder = 'C#5 or 73';
          input.value = tokens[noteIndex] || '';
          input.addEventListener('input', () => {
            const nextTokens = [...tokens];
            nextTokens[noteIndex] = input.value;
            const nextNotes = syncNotesToRhythm(nextTokens.join(' '), normalizedRhythm);
            const nextBars = bars.map((item, idx) => (
              idx === activeIndex ? { rhythm: normalizedRhythm, notes: nextNotes } : item
            ));
            writeBars(nextBars);
          });
          row.appendChild(label);
          row.appendChild(input);
          notesList.appendChild(row);
        });
      };

      renderBarDetails();

      return wrapper;
    };

    const buildHarmonySection = () => {
      const harmonyWrapper = document.createElement('div');
      harmonyWrapper.className = 'flow-section-body';
      const progressionView = getDropdownView('progression');
      const progressionSets = styleContext?.optionSets?.progressions || { recommended: [], all: [] };
      const progressionPool = progressionView === 'all' ? progressionSets.all : progressionSets.recommended;
      const availablePresets = progressionPool.length > 0 ? progressionPool : progressionSets.all;
      const progressionOptions = ensureOptionPresence(
        availablePresets.map(preset => ({ value: preset.id, label: preset.label || preset.id })),
        params.progressionPresetId,
        value => getProgressionPresetById(value)?.name || value
      );
      harmonyWrapper.appendChild(buildSelect({
        label: 'Progression View',
        value: progressionView,
        options: [
          { value: 'recommended', label: 'Recommended (Style+Mood)' },
          { value: 'all', label: 'All in Style' },
        ],
        onChange: value => updateDropdownPrefs('progression', value),
      }));
      harmonyWrapper.appendChild(buildSelect({
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
        harmonyWrapper.appendChild(buildField({
          label: 'chordRoot',
          type: 'string',
          value: params.chordRoot || '',
          onChange: value => updateParams({ chordRoot: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
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
        harmonyWrapper.appendChild(buildField({
          label: 'Chord Notes Override',
          type: 'string',
          value: params.chordNotes || '',
          placeholder: 'C#4:E4:G#4',
          helper: 'Optional. One chord only. Colon-separated notes (with octave) or MIDI numbers (e.g., 61:64:68). Overrides Chord Root/Quality.',
          onChange: value => updateParams({ chordNotes: value }),
        }));
      }

      if (harmonyMode === 'progression_preset') {
        const presetOptions = progressionOptions.length > 0 ? progressionOptions : getProgressionPresets().map(preset => ({
          value: preset.id,
          label: preset.name,
        }));
        let activePresetId = params.progressionPresetId || presetOptions[0]?.value || '';
        if (!presetOptions.some(option => option.value === activePresetId)) {
          activePresetId = presetOptions[0]?.value || activePresetId;
        }
        const activePreset = getProgressionPresetById(activePresetId);
        const variantOptions = ensureOptionPresence(
          (activePreset?.variants || []).map(variant => ({
            value: variant.id,
            label: variant.label,
          })),
          params.progressionVariantId,
          value => value || 'variant'
        );
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionPresetId',
          value: activePresetId,
          options: presetOptions,
          onChange: value => updateParams({ progressionPresetId: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionVariantId',
          value: params.progressionVariantId || activePreset?.variants?.[0]?.id || 'triads',
          options: variantOptions,
          onChange: value => updateParams({ progressionVariantId: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'chordsPerBar',
          value: params.chordsPerBar || '1',
          options: [
            { value: '1', label: '1 chord per bar' },
            { value: '2', label: '2 chords per bar' },
            { value: '0.5', label: '1 chord per 2 bars' },
          ],
          onChange: value => updateParams({ chordsPerBar: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'fillBehavior',
          value: params.fillBehavior || 'repeat',
          options: [
            { value: 'repeat', label: 'Repeat' },
            { value: 'hold_last', label: 'Hold last' },
            { value: 'rest', label: 'Rest' },
          ],
          onChange: value => updateParams({ fillBehavior: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
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
        harmonyWrapper.appendChild(buildTextarea({
          label: 'progressionCustom',
          value: params.progressionCustom || '',
          placeholder: 'i VII VI VII',
          helper: 'Enter roman numerals separated by spaces.',
          onChange: value => updateParams({ progressionCustom: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'progressionCustomVariantStyle',
          value: params.progressionCustomVariantStyle || 'triads',
          options: [
            { value: 'triads', label: 'Triads' },
            { value: '7ths', label: '7ths' },
            { value: '9ths_soft', label: '9ths (soft)' },
          ],
          onChange: value => updateParams({ progressionCustomVariantStyle: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'chordsPerBar',
          value: params.chordsPerBar || '1',
          options: [
            { value: '1', label: '1 chord per bar' },
            { value: '2', label: '2 chords per bar' },
            { value: '0.5', label: '1 chord per 2 bars' },
          ],
          onChange: value => updateParams({ chordsPerBar: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
          label: 'fillBehavior',
          value: params.fillBehavior || 'repeat',
          options: [
            { value: 'repeat', label: 'Repeat' },
            { value: 'hold_last', label: 'Hold last' },
            { value: 'rest', label: 'Rest' },
          ],
          onChange: value => updateParams({ fillBehavior: value }),
        }));
        harmonyWrapper.appendChild(buildSelect({
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
          harmonyWrapper.appendChild(buildProgressionPreviewStrip(preview));
        }
      }
      return harmonyWrapper;
    };

    const buildPatternSection = ({ includeCustomEditor = true } = {}) => {
      const patternWrapper = document.createElement('div');
      patternWrapper.className = 'flow-section-body';
      const melodyMode = params.melodyMode || 'generated';
      patternWrapper.appendChild(buildSelect({
        label: 'melodyMode',
        value: melodyMode,
        options: [
          { value: 'generated', label: 'Generated' },
          { value: 'custom', label: 'Custom' },
        ],
        onChange: value => updateParams({ melodyMode: value }),
      }));
      if (melodyMode === 'generated') {
        const patternView = getDropdownView('pattern');
        const patternSets = styleContext?.optionSets?.patterns || { recommended: [], all: [] };
        const patternPool = patternView === 'all' ? patternSets.all : patternSets.recommended;
        const availablePatterns = patternPool.length > 0 ? patternPool : patternSets.all;
        const patternOptions = ensureOptionPresence(
          availablePatterns.map(pattern => ({ value: pattern.id, label: pattern.label || pattern.id })),
          params.notePatternId,
          value => PATTERN_BY_ID[value]?.label || value
        );
        patternWrapper.appendChild(buildSelect({
          label: 'Pattern View',
          value: patternView,
          options: STYLE_DROPDOWN_VIEW_OPTIONS,
          onChange: value => updateDropdownPrefs('pattern', value),
        }));
        patternWrapper.appendChild(buildSelect({
          label: 'pattern',
          value: params.notePatternId || patternOptions[0]?.value || '',
          options: patternOptions,
          onChange: (value) => {
            const mapped = PATTERN_BY_ID[value];
            updateParams({
              notePatternId: value,
              patternType: mapped?.mapsToPatternType || mapped?.patternType || value || params.patternType,
            });
          },
        }));
      } else if (includeCustomEditor) {
        patternWrapper.appendChild(buildCustomMelodyEditor());
      } else {
        const hint = document.createElement('div');
        hint.className = 'flow-field-help';
        hint.textContent = 'Custom melody editing is available in Advanced.';
        patternWrapper.appendChild(hint);
      }
      return patternWrapper;
    };

    const buildFeelSection = () => {
      const feelWrapper = document.createElement('div');
      feelWrapper.className = 'flow-section-body';
      const feelView = getDropdownView('feel');
      const feelSets = styleContext?.optionSets?.feels || { recommended: [], all: [] };
      const feelPool = feelView === 'all' ? feelSets.all : feelSets.recommended;
      const availableFeels = feelPool.length > 0 ? feelPool : feelSets.all;
      const activeFeel = availableFeels.find(feel => (
        feel.rhythmGrid === (params.rhythmGrid || '1/12')
        && feel.syncopation === (params.syncopation || 'none')
        && feel.timingWarp === (params.timingWarp || 'none')
        && Number(feel.timingIntensity) === Number(params.timingIntensity ?? 0)
      )) || feelSets.all.find(feel => (
        feel.rhythmGrid === (params.rhythmGrid || '1/12')
        && feel.syncopation === (params.syncopation || 'none')
        && feel.timingWarp === (params.timingWarp || 'none')
        && Number(feel.timingIntensity) === Number(params.timingIntensity ?? 0)
      ));
      const feelOptions = ensureOptionPresence(
        availableFeels.map(feel => ({ value: feel.id, label: feel.label || feel.id })),
        activeFeel?.id,
        value => availableFeels.find(feel => feel.id === value)?.label || value
      );
      feelWrapper.appendChild(buildSelect({
        label: 'Feel View',
        value: feelView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('feel', value),
      }));
      feelWrapper.appendChild(buildSelect({
        label: 'Feel Preset',
        value: activeFeel?.id || '',
        options: feelOptions,
        onChange: (value) => {
          const selected = availableFeels.find(feel => feel.id === value) || feelSets.all.find(feel => feel.id === value);
          if (selected) {
            updateParams({
              rhythmGrid: selected.rhythmGrid,
              syncopation: selected.syncopation,
              timingWarp: selected.timingWarp,
              timingIntensity: selected.timingIntensity,
            });
          }
        },
      }));
      feelWrapper.appendChild(buildSelect({
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
      feelWrapper.appendChild(buildSelect({
        label: 'syncopation',
        value: params.syncopation || 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'offbeat', label: 'Offbeat' },
          { value: 'anticipation', label: 'Anticipation' },
        ],
        onChange: value => updateParams({ syncopation: value }),
      }));
      feelWrapper.appendChild(buildSelect({
        label: 'timingWarp',
        value: params.timingWarp || 'none',
        options: [
          { value: 'none', label: 'None' },
          { value: 'swing', label: 'Swing' },
          { value: 'shuffle', label: 'Shuffle' },
        ],
        onChange: value => updateParams({ timingWarp: value }),
      }));
      feelWrapper.appendChild(buildField({
        label: 'timingIntensity',
        type: 'number',
        value: params.timingIntensity ?? 0,
        onChange: value => updateParams({ timingIntensity: value }),
      }));
      return feelWrapper;
    };

    const buildRegisterAndInstrumentSection = () => {
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section-body';
      const instrumentView = getDropdownView('instrument');
      const registerView = getDropdownView('register');
      const instrumentSets = styleContext?.optionSets?.instruments || { recommended: [], all: [] };
      const registerSets = styleContext?.optionSets?.registers || { recommended: [], all: [] };
      const instrumentPool = instrumentView === 'all' ? instrumentSets.all : instrumentSets.recommended;
      const registerPool = registerView === 'all' ? registerSets.all : registerSets.recommended;
      const instruments = instrumentPool.length > 0 ? instrumentPool : instrumentSets.all;
      const registers = registerPool.length > 0 ? registerPool : registerSets.all;
      const instrumentOptions = ensureOptionPresence(
        [
          ...instruments.map(item => ({ value: item.instrumentPreset || item.id, label: item.label || item.instrumentPreset || item.id })),
          ...((presetCache || []).map(preset => ({ value: preset.id, label: preset.name }))),
        ].filter(option => option.value),
        params.instrumentPreset,
        value => value
      );
      const activeRegister = registers.find(item => item.min === params.registerMin && item.max === params.registerMax)
        || registerSets.all.find(item => item.min === params.registerMin && item.max === params.registerMax);
      const registerOptions = ensureOptionPresence(
        registers.map(item => ({ value: item.id, label: item.label || item.id })),
        activeRegister?.id,
        value => registers.find(item => item.id === value)?.label || value
      );
      wrapper.appendChild(buildSelect({
        label: 'Instrument View',
        value: instrumentView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('instrument', value),
      }));
      if (instrumentOptions.length > 0) {
        wrapper.appendChild(buildSelect({
          label: 'instrumentPreset',
          value: params.instrumentPreset || instrumentOptions[0]?.value,
          options: instrumentOptions,
          onChange: value => updateParams({ instrumentPreset: value }),
        }));
      } else {
        wrapper.appendChild(buildField({
          label: 'instrumentPreset',
          type: 'string',
          value: params.instrumentPreset || '',
          onChange: value => updateParams({ instrumentPreset: value }),
        }));
      }

      wrapper.appendChild(buildSelect({
        label: 'Register View',
        value: registerView,
        options: STYLE_DROPDOWN_VIEW_OPTIONS,
        onChange: value => updateDropdownPrefs('register', value),
      }));
      wrapper.appendChild(buildField({
        label: 'registerMin',
        type: 'number',
        value: params.registerMin ?? 48,
        onChange: value => updateParams({ registerMin: value }),
      }));
      wrapper.appendChild(buildField({
        label: 'registerMax',
        type: 'number',
        value: params.registerMax ?? 84,
        onChange: value => updateParams({ registerMax: value }),
      }));
      wrapper.appendChild(buildSelect({
        label: 'instrumentSoundfont',
        value: params.instrumentSoundfont || SOUND_FONTS[0].value,
        options: SOUND_FONTS,
        onChange: value => updateParams({ instrumentSoundfont: value }),
      }));

      if (registerOptions.length > 0) {
        wrapper.appendChild(buildSelect({
          label: 'Register Suggestion',
          value: activeRegister?.id || '',
          options: registerOptions,
          onChange: (value) => {
            const selected = registers.find(item => item.id === value) || registerSets.all.find(item => item.id === value);
            if (selected) {
              updateParams({ registerMin: selected.min, registerMax: selected.max });
            }
          },
        }));
      }
      return wrapper;
    };

    const renderThoughtCoreSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      body.appendChild(buildField({
        label: 'label',
        type: 'string',
        value: params.label,
        onChange: value => updateParams({ label: value }),
      }));
      body.appendChild(buildField({
        label: 'durationBars',
        type: 'number',
        value: params.durationBars ?? 1,
        onChange: value => updateParams({ durationBars: value }),
      }));
      body.appendChild(buildField({
        label: 'key',
        type: 'string',
        value: params.key || 'C# minor',
        onChange: value => updateParams({ key: value }),
      }));
      return buildSection('Core', body);
    };

    const renderThoughtStyleSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';

      const styleOptions = (STYLE_CATALOG || []).map(style => ({
        value: style.id,
        label: style.label || style.id,
      }));
      if (styleOptions.length > 0) {
        body.appendChild(buildSelect({
          label: 'Style',
          value: params.styleId || styleOptions[0].value,
          options: styleOptions,
          onChange: value => {
            updateParams({ styleId: value, moodId: 'none', moodMode: 'override' });
            applyStyleResolution({ nextStyleId: value, nextMoodId: 'none' });
          },
        }));
      }

      body.appendChild(buildRegisterAndInstrumentSection());
      return buildSection('Style', body);
    };

    const renderThoughtStyleOptionsSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      const styleId = params.styleId || (STYLE_CATALOG[0]?.id || 'classical_film');
      const moodId = params.moodId || 'none';
      const styleSeed = coerceSeed(params.styleSeed, 1);
      const signature = buildStyleSignature({ styleId, moodId, styleSeed });
      const isSignatureResolved = params.styleResolvedSignature === signature;
      const resolveIfNeeded = () => {
        if (!isSignatureResolved) {
          applyStyleResolution({ nextStyleId: styleId, nextMoodId: moodId, nextSeed: styleSeed });
        }
      };

      const seedRow = document.createElement('div');
      seedRow.className = 'flow-inline-actions';
      seedRow.appendChild(buildField({
        label: 'styleSeed',
        type: 'number',
        value: styleSeed,
        onChange: value => applyStyleResolution({ nextSeed: value }),
      }));
      const buttonRow = document.createElement('div');
      buttonRow.className = 'flow-seed-actions';
      const rerollButton = document.createElement('button');
      rerollButton.type = 'button';
      rerollButton.textContent = 'Reroll';
      rerollButton.addEventListener('click', rerollSeed);
      buttonRow.appendChild(rerollButton);
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.textContent = 'Copy';
      copyButton.addEventListener('click', () => copySeed());
      buttonRow.appendChild(copyButton);
      const pasteButton = document.createElement('button');
      pasteButton.type = 'button';
      pasteButton.textContent = 'Paste';
      pasteButton.addEventListener('click', () => pasteSeed());
      buttonRow.appendChild(pasteButton);
      seedRow.appendChild(buttonRow);
      body.appendChild(seedRow);
      const seedHelp = document.createElement('div');
      seedHelp.className = 'flow-field-help';
      seedHelp.textContent = 'Seed controls Auto choices. Reroll to deterministically update Auto fields.';
      body.appendChild(seedHelp);

      const moodRow = document.createElement('div');
      moodRow.className = 'flow-inline-actions';
      const moodOptions = (styleContext?.moods || []).map(mood => ({ value: mood.id, label: mood.label }));
      moodRow.appendChild(buildSelect({
        label: 'Mood',
        value: params.moodId || styleContext?.mood?.id || '',
        options: ensureOptionPresence(moodOptions, styleContext?.mood?.id, val => moodOptions.find(opt => opt.value === val)?.label || val),
        onChange: value => {
          updateParams({ moodId: value, moodMode: 'override' });
          applyStyleResolution({ nextMoodId: value });
        },
      }));
      body.appendChild(moodRow);

      body.appendChild(buildHarmonySection());
      body.appendChild(buildPatternSection({ includeCustomEditor: true }));
      body.appendChild(buildFeelSection());
      const wrapper = document.createElement('div');
      wrapper.className = 'flow-section';
      const details = document.createElement('details');
      details.open = false;
      const summary = document.createElement('summary');
      summary.className = 'flow-section-title';
      summary.textContent = 'Style Options';
      details.appendChild(summary);
      details.appendChild(body);
      details.addEventListener('toggle', () => {
        if (details.open) {
          resolveIfNeeded();
        }
      });
      wrapper.appendChild(details);
      return wrapper;
    };

    const renderThoughtAdvancedSection = () => {
      const body = document.createElement('div');
      body.className = 'flow-section-body';
      const legacyNote = document.createElement('div');
      legacyNote.className = 'flow-field-help';
      legacyNote.textContent = 'Legacy raw controls (duplicate of Style Options) stay here.';
      body.appendChild(legacyNote);
      body.appendChild(buildHarmonySection());
      body.appendChild(buildPatternSection({ includeCustomEditor: true }));
      body.appendChild(buildFeelSection());
      body.appendChild(buildRegisterAndInstrumentSection());

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
      body.appendChild(moonlightButton);

      return buildSection('Advanced', body, { collapsible: true, defaultOpen: false });
    };

    const stack = document.createElement('div');
    stack.className = 'flow-inspector-form';
    stack.appendChild(renderThoughtCoreSection());
    stack.appendChild(renderThoughtStyleSection());
    stack.appendChild(renderThoughtStyleOptionsSection());
    stack.appendChild(renderThoughtAdvancedSection());
    return stack;
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
    currentFocusScope = node?.id || 'node';
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
    currentFocusScope = edge?.id || 'edge';
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
    const previousFocus = captureFocusState();
    let rendered = false;
    const selection = state.selection || { nodes: [], edges: [] };
    if (selection.nodes.length > 0) {
      const node = state.nodes.find(item => item.id === selection.nodes[0]);
      if (node) {
        renderNode(node, state);
        rendered = true;
      }
    }
    if (selection.edges.length > 0) {
      const edge = state.edges.find(item => item.id === selection.edges[0]);
      if (edge) {
        const nodeMap = new Map(state.nodes.map(node => [node.id, node]));
        renderEdge(edge, nodeMap);
        rendered = true;
      }
    }
    if (!rendered) {
      renderEmpty();
    }
    restoreFocusState(previousFocus);
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
