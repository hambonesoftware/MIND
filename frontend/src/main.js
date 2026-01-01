import { parseScript, compileSession, getPresets } from './api/client.js';
import { createAudioEngine } from './audio/audioEngine.js';

const GRID_STEP_MAP = { '1/4': 4, '1/8': 8, '1/16': 16 };

function getDefaultPresetForLane(lane, presets) {
  if (lane === 'note') {
    return presets.find(p => p.id.toLowerCase().includes('piano'))?.id || presets[0]?.id || '';
  }
  return presets.find(p => p.id.toLowerCase().includes(lane))?.id || presets[0]?.id || '';
}

function buildDefaultScript({ lane, defaultPattern, preset }) {
  if (lane === 'note') {
    return `beat(${lane}, "${defaultPattern}", grid="1/4", bars="1-16", preset="${preset}", notes="C4")`;
  }
  return `beat(${lane}, "${defaultPattern}", grid="1/4", bars="1-16", preset="${preset}")`;
}

/**
 * Represents a single node/lane in the UI.  Each node manages its
 * own DOM subtree and knows how to parse its script, latch edits and
 * visualise scheduled events.
 */
class NodeCard {
  constructor({ lane, displayName, presets }) {
    this.lane = lane;
    this.displayName = displayName;
    this.presets = presets;
    // default script based on lane
    const defaultPattern = lane === 'kick'
      ? '9...'
      : lane === 'snare'
      ? '.9..'
      : lane === 'hat'
      ? '....'
      : '....';
    // Choose a sensible default preset based on lane.  For the melodic
    // 'note' lane pick a piano preset if available; otherwise pick
    // a preset whose ID contains the lane name.
    const defaultPreset = getDefaultPresetForLane(lane, presets);
    // Compose the default script.  For melodic lanes include a default
    // note specification so users see how to specify pitches.  For
    // drum lanes retain the simple form.
    this.latchedText = buildDefaultScript({
      lane,
      defaultPattern,
      preset: defaultPreset,
    });
    this.pendingText = null;
    this.status = 'Latched';
    this.lastParsedGrid = '1/4';
    // Build DOM elements
    this.element = document.createElement('div');
    this.element.className = 'node-card';
    // Header
    const header = document.createElement('div');
    header.className = 'node-header';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'node-name';
    nameSpan.textContent = displayName;
    header.appendChild(nameSpan);
    this.statusPill = document.createElement('span');
    this.statusPill.className = 'status-pill status-latched';
    this.statusPill.textContent = 'Latched';
    header.appendChild(this.statusPill);
    // Mute checkbox
    const muteLabel = document.createElement('label');
    muteLabel.className = 'mute-label';
    this.muteCheckbox = document.createElement('input');
    this.muteCheckbox.type = 'checkbox';
    muteLabel.appendChild(this.muteCheckbox);
    muteLabel.appendChild(document.createTextNode(' Mute'));
    header.appendChild(muteLabel);
    this.element.appendChild(header);
    // Body
    const body = document.createElement('div');
    body.className = 'node-body';
    this.scriptInput = document.createElement('textarea');
    this.scriptInput.className = 'script-input';
    this.scriptInput.value = this.latchedText;
    body.appendChild(this.scriptInput);
    // Step strip
    this.stepStrip = document.createElement('div');
    this.stepStrip.className = 'step-strip';
    // Playhead indicator
    this.playhead = document.createElement('div');
    this.playhead.className = 'playhead';
    this.stepStrip.appendChild(this.playhead);
    body.appendChild(this.stepStrip);
    this.element.appendChild(body);
    // Preset row
    const presetRow = document.createElement('div');
    presetRow.className = 'preset-row';
    const presetLabel = document.createElement('label');
    presetLabel.textContent = 'Preset: ';
    this.presetSelect = document.createElement('select');
    for (const preset of presets) {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = preset.name;
      if (preset.id === defaultPreset) {
        opt.selected = true;
      }
      this.presetSelect.appendChild(opt);
    }
    presetLabel.appendChild(this.presetSelect);
    presetRow.appendChild(presetLabel);
    this.element.appendChild(presetRow);
    // Event listeners
    this.scriptInput.addEventListener('input', () => {
      this.onScriptChange();
    });
    this.presetSelect.addEventListener('change', () => {
      this.onPresetChange(this.presetSelect.value);
    });
  }

  onScriptChange() {
    // Store pending text and update parse status
    this.pendingText = this.scriptInput.value;
    this.updateStatus('Pending');
    // parse script to check validity
    parseScript(this.pendingText)
      .then(res => {
        if (res.ok) {
          this.lastParsedGrid = res.ast?.grid || '1/4';
          this.updateStatus('Pending');
        } else {
          this.updateStatus('Error');
        }
      })
      .catch(() => {
        this.updateStatus('Error');
      });
  }

  onPresetChange(presetId) {
    // Update the script to include or replace the preset argument
    const script = this.pendingText || this.latchedText;
    const presetRe = /(preset\s*=\s*")[^"]*(")/i;
    let updated;
    if (presetRe.test(script)) {
      updated = script.replace(presetRe, `$1${presetId}$2`);
    } else {
      // Insert before closing parenthesis
      const idx = script.lastIndexOf(')');
      if (idx !== -1) {
        const before = script.slice(0, idx);
        const after = script.slice(idx);
        updated = `${before}, preset="${presetId}"${after}`;
      } else {
        updated = script;
      }
    }
    this.scriptInput.value = updated;
    this.onScriptChange();
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.statusPill.textContent = newStatus;
    this.statusPill.classList.remove('status-latched', 'status-pending', 'status-error');
    if (newStatus === 'Latched') {
      this.statusPill.classList.add('status-latched');
    } else if (newStatus === 'Pending') {
      this.statusPill.classList.add('status-pending');
    } else if (newStatus === 'Error') {
      this.statusPill.classList.add('status-error');
    }
  }

  /**
   * Latch the pending script if it is currently pending (not error).
   */
  latch() {
    if (this.status === 'Pending' && this.pendingText) {
      this.latchedText = this.pendingText;
      this.pendingText = null;
      this.updateStatus('Latched');
    }
  }

  /**
   * Build a NodeInput object for compilation.
   */
  toNodeInput() {
    return {
      id: this.lane,
      text: this.latchedText,
      enabled: !this.muteCheckbox.checked,
    };
  }

  /**
   * Update the visual step strip based on compiled events.
   * @param {Array} events - events for this lane
   */
  updateSteps(events) {
    // Determine step count from grid
    const grid = this.lastParsedGrid || '1/4';
    const steps = GRID_STEP_MAP[grid] || 4;
    // Create or update step boxes
    // Remove existing boxes except playhead
    // Keep playhead as first child; remove others
    while (this.stepStrip.children.length > 1) {
      this.stepStrip.removeChild(this.stepStrip.lastChild);
    }
    // Create boxes
    const activeIndices = new Set();
    for (const ev of events) {
      // tBeat 0..4 -> step index
      const idx = Math.floor((ev.tBeat / 4) * steps + 1e-6);
      activeIndices.add(idx);
    }
    for (let i = 0; i < steps; i++) {
      const box = document.createElement('div');
      box.className = 'step-box';
      if (activeIndices.has(i)) {
        box.classList.add('on');
      }
      this.stepStrip.appendChild(box);
    }
  }

  /**
   * Move the playhead indicator according to progress (0–1) across the bar.
   */
  updatePlayhead(progress) {
    const pct = Math.max(0, Math.min(1, progress));
    this.playhead.style.left = `${pct * 100}%`;
  }
}

class TheoryBlockCard {
  constructor({ id, presets }) {
    this.id = id;
    this.kind = 'theory';
    this.presets = presets;
    this.parentId = null;
    const defaultPattern = '....';
    const defaultPreset = getDefaultPresetForLane('note', presets);
    this.latchedText = buildDefaultScript({
      lane: 'note',
      defaultPattern,
      preset: defaultPreset,
    });
    this.pendingText = null;
    this.status = 'Latched';
    this.lastParsedGrid = '1/4';
    this.element = document.createElement('div');
    this.element.className = 'block-card';
    this.element.dataset.blockId = id;
    const header = document.createElement('div');
    header.className = 'block-header';
    header.draggable = true;
    const title = document.createElement('span');
    title.className = 'block-title';
    title.textContent = 'Theory';
    header.appendChild(title);
    this.statusPill = document.createElement('span');
    this.statusPill.className = 'status-pill status-latched';
    this.statusPill.textContent = 'Latched';
    header.appendChild(this.statusPill);
    const muteLabel = document.createElement('label');
    muteLabel.className = 'mute-label';
    this.muteCheckbox = document.createElement('input');
    this.muteCheckbox.type = 'checkbox';
    muteLabel.appendChild(this.muteCheckbox);
    muteLabel.appendChild(document.createTextNode(' Mute'));
    header.appendChild(muteLabel);
    this.element.appendChild(header);
    const body = document.createElement('div');
    body.className = 'block-body';
    this.scriptInput = document.createElement('textarea');
    this.scriptInput.className = 'script-input';
    this.scriptInput.value = this.latchedText;
    body.appendChild(this.scriptInput);
    this.stepStrip = document.createElement('div');
    this.stepStrip.className = 'step-strip';
    this.playhead = document.createElement('div');
    this.playhead.className = 'playhead';
    this.stepStrip.appendChild(this.playhead);
    body.appendChild(this.stepStrip);
    this.element.appendChild(body);
    const presetRow = document.createElement('div');
    presetRow.className = 'preset-row';
    const presetLabel = document.createElement('label');
    presetLabel.textContent = 'Preset: ';
    this.presetSelect = document.createElement('select');
    for (const preset of presets) {
      const opt = document.createElement('option');
      opt.value = preset.id;
      opt.textContent = preset.name;
      if (preset.id === defaultPreset) {
        opt.selected = true;
      }
      this.presetSelect.appendChild(opt);
    }
    presetLabel.appendChild(this.presetSelect);
    presetRow.appendChild(presetLabel);
    this.element.appendChild(presetRow);
    this.scriptInput.addEventListener('input', () => {
      this.onScriptChange();
    });
    this.presetSelect.addEventListener('change', () => {
      this.onPresetChange(this.presetSelect.value);
    });
  }

  onScriptChange() {
    this.pendingText = this.scriptInput.value;
    this.updateStatus('Pending');
    parseScript(this.pendingText)
      .then(res => {
        if (res.ok) {
          this.lastParsedGrid = res.ast?.grid || '1/4';
          this.updateStatus('Pending');
        } else {
          this.updateStatus('Error');
        }
      })
      .catch(() => {
        this.updateStatus('Error');
      });
  }

  onPresetChange(presetId) {
    const script = this.pendingText || this.latchedText;
    const presetRe = /(preset\s*=\s*")[^"]*(")/i;
    let updated;
    if (presetRe.test(script)) {
      updated = script.replace(presetRe, `$1${presetId}$2`);
    } else {
      const idx = script.lastIndexOf(')');
      if (idx !== -1) {
        const before = script.slice(0, idx);
        const after = script.slice(idx);
        updated = `${before}, preset="${presetId}"${after}`;
      } else {
        updated = script;
      }
    }
    this.scriptInput.value = updated;
    this.onScriptChange();
  }

  updateStatus(newStatus) {
    this.status = newStatus;
    this.statusPill.textContent = newStatus;
    this.statusPill.classList.remove('status-latched', 'status-pending', 'status-error');
    if (newStatus === 'Latched') {
      this.statusPill.classList.add('status-latched');
    } else if (newStatus === 'Pending') {
      this.statusPill.classList.add('status-pending');
    } else if (newStatus === 'Error') {
      this.statusPill.classList.add('status-error');
    }
  }

  latch() {
    if (this.status === 'Pending' && this.pendingText) {
      this.latchedText = this.pendingText;
      this.pendingText = null;
      this.updateStatus('Latched');
    }
  }

  toNodeInput() {
    return {
      id: this.id,
      kind: 'theory',
      text: this.latchedText,
      enabled: !this.muteCheckbox.checked,
    };
  }

  updateSteps(events) {
    const grid = this.lastParsedGrid || '1/4';
    const steps = GRID_STEP_MAP[grid] || 4;
    while (this.stepStrip.children.length > 1) {
      this.stepStrip.removeChild(this.stepStrip.lastChild);
    }
    const activeIndices = new Set();
    for (const ev of events) {
      const idx = Math.floor((ev.tBeat / 4) * steps + 1e-6);
      activeIndices.add(idx);
    }
    for (let i = 0; i < steps; i++) {
      const box = document.createElement('div');
      box.className = 'step-box';
      if (activeIndices.has(i)) {
        box.classList.add('on');
      }
      this.stepStrip.appendChild(box);
    }
  }

  updatePlayhead(progress) {
    const pct = Math.max(0, Math.min(1, progress));
    this.playhead.style.left = `${pct * 100}%`;
  }
}

class RenderBlockCard {
  constructor({ id }) {
    this.id = id;
    this.kind = 'render';
    this.childId = null;
    this.renderSpec = {
      strum: null,
      perc: null,
    };
    this.element = document.createElement('div');
    this.element.className = 'block-card block-render';
    this.element.dataset.blockId = id;
    const header = document.createElement('div');
    header.className = 'block-header';
    const title = document.createElement('span');
    title.className = 'block-title';
    title.textContent = 'Render';
    header.appendChild(title);
    const subtitle = document.createElement('span');
    subtitle.className = 'block-subtitle';
    subtitle.textContent = 'Wrap a Theory block';
    header.appendChild(subtitle);
    this.element.appendChild(header);
    const body = document.createElement('div');
    body.className = 'block-body';
    const controls = document.createElement('div');
    controls.className = 'render-controls';

    const strumSection = document.createElement('div');
    strumSection.className = 'render-section';
    const strumHeader = document.createElement('div');
    strumHeader.className = 'render-section-title';
    strumHeader.textContent = 'Strum';
    strumSection.appendChild(strumHeader);

    const strumEnableLabel = document.createElement('label');
    strumEnableLabel.className = 'render-toggle';
    this.strumEnable = document.createElement('input');
    this.strumEnable.type = 'checkbox';
    strumEnableLabel.appendChild(this.strumEnable);
    strumEnableLabel.appendChild(document.createTextNode(' Enable'));
    strumSection.appendChild(strumEnableLabel);

    const strumSpreadLabel = document.createElement('label');
    strumSpreadLabel.textContent = 'Spread (ms)';
    this.strumSpread = document.createElement('input');
    this.strumSpread.type = 'range';
    this.strumSpread.min = '0';
    this.strumSpread.max = '120';
    this.strumSpread.value = '40';
    this.strumSpread.step = '5';
    const strumSpreadValue = document.createElement('span');
    strumSpreadValue.className = 'render-value';
    strumSpreadValue.textContent = `${this.strumSpread.value}ms`;
    const strumSpreadRow = document.createElement('div');
    strumSpreadRow.className = 'render-row';
    strumSpreadRow.appendChild(strumSpreadLabel);
    strumSpreadRow.appendChild(this.strumSpread);
    strumSpreadRow.appendChild(strumSpreadValue);
    strumSection.appendChild(strumSpreadRow);

    const strumDirectionRow = document.createElement('div');
    strumDirectionRow.className = 'render-row';
    const strumDirectionLabel = document.createElement('label');
    strumDirectionLabel.textContent = 'Direction';
    this.strumDirection = document.createElement('select');
    const upOption = document.createElement('option');
    upOption.value = 'up';
    upOption.textContent = 'Up';
    const downOption = document.createElement('option');
    downOption.value = 'down';
    downOption.textContent = 'Down';
    this.strumDirection.appendChild(upOption);
    this.strumDirection.appendChild(downOption);
    strumDirectionRow.appendChild(strumDirectionLabel);
    strumDirectionRow.appendChild(this.strumDirection);
    strumSection.appendChild(strumDirectionRow);

    controls.appendChild(strumSection);

    const percSection = document.createElement('div');
    percSection.className = 'render-section';
    const percHeader = document.createElement('div');
    percHeader.className = 'render-section-title';
    percHeader.textContent = 'Perc';
    percSection.appendChild(percHeader);

    const percEnableLabel = document.createElement('label');
    percEnableLabel.className = 'render-toggle';
    this.percEnable = document.createElement('input');
    this.percEnable.type = 'checkbox';
    percEnableLabel.appendChild(this.percEnable);
    percEnableLabel.appendChild(document.createTextNode(' Enable'));
    percSection.appendChild(percEnableLabel);

    const percGridRow = document.createElement('div');
    percGridRow.className = 'render-row';
    const percGridLabel = document.createElement('label');
    percGridLabel.textContent = 'Grid';
    this.percGrid = document.createElement('select');
    ['1/4', '1/8', '1/16'].forEach(value => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      this.percGrid.appendChild(opt);
    });
    this.percGrid.value = '1/8';
    percGridRow.appendChild(percGridLabel);
    percGridRow.appendChild(this.percGrid);
    percSection.appendChild(percGridRow);

    const kickRow = document.createElement('div');
    kickRow.className = 'render-row';
    const kickLabel = document.createElement('label');
    kickLabel.textContent = 'Kick';
    this.kickMask = document.createElement('input');
    this.kickMask.type = 'text';
    this.kickMask.placeholder = 'x...x...';
    kickRow.appendChild(kickLabel);
    kickRow.appendChild(this.kickMask);
    percSection.appendChild(kickRow);

    const snareRow = document.createElement('div');
    snareRow.className = 'render-row';
    const snareLabel = document.createElement('label');
    snareLabel.textContent = 'Snare';
    this.snareMask = document.createElement('input');
    this.snareMask.type = 'text';
    this.snareMask.placeholder = '....x...';
    snareRow.appendChild(snareLabel);
    snareRow.appendChild(this.snareMask);
    percSection.appendChild(snareRow);

    const hatRow = document.createElement('div');
    hatRow.className = 'render-row';
    const hatLabel = document.createElement('label');
    hatLabel.textContent = 'Hat';
    this.hatMask = document.createElement('input');
    this.hatMask.type = 'text';
    this.hatMask.placeholder = 'x.x.x.x.';
    hatRow.appendChild(hatLabel);
    hatRow.appendChild(this.hatMask);
    percSection.appendChild(hatRow);

    controls.appendChild(percSection);
    body.appendChild(controls);
    this.dropzone = document.createElement('div');
    this.dropzone.className = 'block-dropzone';
    this.dropzone.textContent = 'Drop Theory Block Here';
    body.appendChild(this.dropzone);
    this.childContainer = document.createElement('div');
    this.childContainer.className = 'block-child';
    body.appendChild(this.childContainer);
    this.element.appendChild(body);

    const updateSpec = () => {
      this.renderSpec.strum = this.strumEnable.checked
        ? {
            grid: '1/16',
            directionPattern: this.strumDirection.value,
            spreadMs: parseInt(this.strumSpread.value, 10),
          }
        : null;
      this.renderSpec.perc = this.percEnable.checked
        ? {
            grid: this.percGrid.value,
            kickMask: this.kickMask.value || null,
            snareMask: this.snareMask.value || null,
            hatMask: this.hatMask.value || null,
          }
        : null;
    };

    this.strumEnable.addEventListener('change', updateSpec);
    this.strumSpread.addEventListener('input', () => {
      strumSpreadValue.textContent = `${this.strumSpread.value}ms`;
      updateSpec();
    });
    this.strumDirection.addEventListener('change', updateSpec);
    this.percEnable.addEventListener('change', updateSpec);
    this.percGrid.addEventListener('change', updateSpec);
    this.kickMask.addEventListener('input', updateSpec);
    this.snareMask.addEventListener('input', updateSpec);
    this.hatMask.addEventListener('input', updateSpec);
    updateSpec();
  }

  toNodeInput() {
    return {
      id: this.id,
      kind: 'render',
      enabled: true,
      childId: this.childId,
      render: this.renderSpec,
    };
  }

  setChild(theoryBlock) {
    this.childId = theoryBlock?.id || null;
    this.childContainer.innerHTML = '';
    if (theoryBlock) {
      theoryBlock.element.classList.add('block-nested');
      this.childContainer.appendChild(theoryBlock.element);
    }
  }

  clearChild() {
    this.childId = null;
    this.childContainer.innerHTML = '';
  }
}

class BlockWorkspace {
  constructor({ presets, onTheoryPresetChange }) {
    this.presets = presets;
    this.onTheoryPresetChange = onTheoryPresetChange;
    this.blocks = new Map();
    this.blockOrder = [];
    this.element = document.createElement('section');
    this.element.className = 'block-workspace';
    const header = document.createElement('div');
    header.className = 'block-workspace-header';
    const title = document.createElement('h2');
    title.textContent = 'Note Workspace';
    header.appendChild(title);
    const actions = document.createElement('div');
    actions.className = 'block-actions';
    const addTheoryBtn = document.createElement('button');
    addTheoryBtn.textContent = 'Add Theory';
    const addRenderBtn = document.createElement('button');
    addRenderBtn.textContent = 'Add Render';
    actions.appendChild(addTheoryBtn);
    actions.appendChild(addRenderBtn);
    header.appendChild(actions);
    this.element.appendChild(header);
    this.rootList = document.createElement('div');
    this.rootList.className = 'block-root-list';
    this.element.appendChild(this.rootList);
    addTheoryBtn.addEventListener('click', () => {
      this.addTheoryBlock();
    });
    addRenderBtn.addEventListener('click', () => {
      this.addRenderBlock();
    });
  }

  addTheoryBlock() {
    const id = `theory-${this.blockOrder.length + 1}`;
    const block = new TheoryBlockCard({ id, presets: this.presets });
    this.registerBlock(block);
    this.rootList.appendChild(block.element);
    block.element.querySelector('.block-header').addEventListener('dragstart', (ev) => {
      ev.dataTransfer.setData('text/plain', id);
      ev.dataTransfer.effectAllowed = 'move';
    });
    block.presetSelect.addEventListener('change', () => {
      if (typeof this.onTheoryPresetChange === 'function') {
        this.onTheoryPresetChange(block.presetSelect.value);
      }
    });
    return block;
  }

  addRenderBlock() {
    const id = `render-${this.blockOrder.length + 1}`;
    const block = new RenderBlockCard({ id });
    this.registerBlock(block);
    this.rootList.appendChild(block.element);
    block.dropzone.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      block.dropzone.classList.add('block-dropzone-active');
    });
    block.dropzone.addEventListener('dragleave', () => {
      block.dropzone.classList.remove('block-dropzone-active');
    });
    block.dropzone.addEventListener('drop', (ev) => {
      ev.preventDefault();
      block.dropzone.classList.remove('block-dropzone-active');
      const draggedId = ev.dataTransfer.getData('text/plain');
      this.attachChild(id, draggedId);
    });
    return block;
  }

  registerBlock(block) {
    this.blocks.set(block.id, block);
    this.blockOrder.push(block.id);
  }

  attachChild(renderId, theoryId) {
    const renderBlock = this.blocks.get(renderId);
    const theoryBlock = this.blocks.get(theoryId);
    if (!renderBlock || renderBlock.kind !== 'render') return;
    if (!theoryBlock || theoryBlock.kind !== 'theory') return;
    if (theoryBlock.parentId) {
      const previousParent = this.blocks.get(theoryBlock.parentId);
      if (previousParent?.kind === 'render') {
        previousParent.clearChild();
      }
    }
    if (renderBlock.childId) {
      const existingChild = this.blocks.get(renderBlock.childId);
      if (existingChild) {
        existingChild.parentId = null;
        existingChild.element.classList.remove('block-nested');
        this.rootList.appendChild(existingChild.element);
      }
    }
    theoryBlock.parentId = renderId;
    renderBlock.setChild(theoryBlock);
  }

  getPrimaryTheoryBlock() {
    for (const id of this.blockOrder) {
      const block = this.blocks.get(id);
      if (block?.kind === 'theory') {
        return block;
      }
    }
    return null;
  }

  latchAll() {
    for (const block of this.blocks.values()) {
      if (block.kind === 'theory') {
        block.latch();
      }
    }
  }

  updateStepsForLane(lane, events) {
    if (lane !== 'note') return;
    for (const block of this.blocks.values()) {
      if (block.kind === 'theory') {
        block.updateSteps(events);
      }
    }
  }

  updatePlayheads(progress) {
    for (const block of this.blocks.values()) {
      if (block.kind === 'theory') {
        block.updatePlayhead(progress);
      }
    }
  }

  getAllNodeInputs() {
    const inputs = [];
    for (const blockId of this.blockOrder) {
      const block = this.blocks.get(blockId);
      if (!block) continue;
      if (typeof block.toNodeInput === 'function') {
        inputs.push(block.toNodeInput());
      }
    }
    return inputs;
  }
}

/**
 * Entry point: build the UI and wire up the runtime.
 */
async function main() {
    // Fetch preset list from API
    const presetResp = await getPresets();
    const presets = presetResp.presets || [];
    // Create audio engine
    const audioEngine = await createAudioEngine();
    let workspace = null;
    // Build transport bar
    const transport = document.getElementById('transport');
    // Play/Stop button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    transport.appendChild(playButton);
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    transport.appendChild(stopButton);
    // BPM input
    const bpmLabel = document.createElement('label');
    bpmLabel.textContent = ' BPM: ';
    const bpmInput = document.createElement('input');
    bpmInput.type = 'number';
    bpmInput.min = '30';
    bpmInput.max = '300';
    bpmInput.value = '80';
    bpmInput.step = '1';
    bpmLabel.appendChild(bpmInput);
    transport.appendChild(bpmLabel);
    // Audio engine indicator.  Displays the name of the active audio
    // backend, the SF2 engine status (Active/Fallback) and the
    // currently selected program for the melodic lane.  The status
    // updates automatically when the soundfont finishes loading and
    // when the user changes the preset for the note lane.
    const engineIndicator = document.createElement('span');
    engineIndicator.className = 'engine-indicator';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'engine-name';
    nameSpan.textContent = ` Engine: ${audioEngine.name}`;
    engineIndicator.appendChild(nameSpan);
    const statusSpan = document.createElement('span');
    statusSpan.className = 'engine-status';
    engineIndicator.appendChild(statusSpan);
    const progressSpan = document.createElement('span');
    progressSpan.className = 'engine-progress';
    engineIndicator.appendChild(progressSpan);
    transport.appendChild(engineIndicator);
    // Helper to update the status and program indicator.
    function updateEngineIndicator() {
      // Update status: only meaningful for Sf2Engine which exposes
      // ``status`` property; default engines omit it.
      const status = audioEngine.status || '';
      let statusText = '';
      if (audioEngine.name === 'SF2 Engine') {
        statusText = status === 'Active' ? ' SF2: Active' : ' SF2: Fallback';
      }
      // Determine current program for the melodic lane (note).  We
      // inspect the Theory block preset select and parse the program
      // number if present (gm:bank:program).  If parsing fails the
      // value is shown verbatim.  Only displayed when using the SF2
      // Engine.
      let programText = '';
      if (audioEngine.name === 'SF2 Engine') {
        const theoryBlock = workspace?.getPrimaryTheoryBlock();
        if (theoryBlock) {
          const presetId = theoryBlock.presetSelect.value;
          let prog = '';
          const lower = presetId.toLowerCase();
          if (lower.startsWith('gm:')) {
            const parts = lower.split(':');
            prog = parts[2] || '';
          } else if (lower.includes('kick') || lower.includes('snare') || lower.includes('hat')) {
            prog = '';
          } else {
            // Map common names to programme numbers
            if (lower.includes('piano')) prog = '0';
            else if (lower.includes('guitar')) prog = '24';
            else if (lower.includes('bass')) prog = '32';
            else if (lower.includes('violin')) prog = '40';
            else if (lower.includes('string')) prog = '48';
            else if (lower.includes('choir')) prog = '52';
            else if (lower.includes('trumpet')) prog = '56';
            else if (lower.includes('lead')) prog = '80';
            else prog = '';
          }
          if (prog) {
            programText = ` Program: ${prog}`;
          }
        }
      }
      statusSpan.textContent = `${statusText}${programText}`;
    }
    // Note: updateEngineIndicator() cannot be called until the
    // NodeCards array has been created.  It will be invoked after
    // NodeCard construction later in this function.
    // Listen for progress and completion events only when using the SF2
    // engine.  Progress updates occur during soundfont fetch; upon
    // completion update the indicator status via updateEngineIndicator.
    if (audioEngine.name === 'SF2 Engine') {
      window.addEventListener('sf2-load-progress', (ev) => {
        const { loaded, total } = ev.detail;
        if (total > 0) {
          const pct = Math.floor((loaded / total) * 100);
          progressSpan.textContent = ` (loading ${pct}%)`;
        }
      });
      window.addEventListener('sf2-load-done', (ev) => {
        if (ev.detail && ev.detail.success) {
          progressSpan.textContent = ' (loaded)';
        } else {
          progressSpan.textContent = ' (load failed, using samples)';
        }
        updateEngineIndicator();
      });
    }
    // Seed input
    const seedLabel = document.createElement('label');
    seedLabel.textContent = ' Seed: ';
    const seedInput = document.createElement('input');
    seedInput.type = 'number';
    seedInput.value = '12345';
    seedInput.step = '1';
    seedLabel.appendChild(seedInput);
    transport.appendChild(seedLabel);
    // Latch All button
    const latchButton = document.createElement('button');
    latchButton.textContent = 'Latch';
    transport.appendChild(latchButton);
    // Node stack
    const nodeStackEl = document.getElementById('nodeStack');
    const lanes = [
      { lane: 'kick', displayName: 'Kick' },
      { lane: 'snare', displayName: 'Snare' },
      { lane: 'hat', displayName: 'Hat' },
      // Add a melodic lane for pitched sequences.  The backend maps the
      // 'note' lane to MIDI note 60 by default; users can specify
      // different note numbers in the script.
      { lane: 'note', displayName: 'Piano' },
    ];
    const nodeCards = [];
    for (const ln of lanes) {
      if (ln.lane === 'note') {
        continue;
      }
      const card = new NodeCard({ lane: ln.lane, displayName: ln.displayName, presets });
      nodeCards.push(card);
      nodeStackEl.appendChild(card.element);
      // Set the initial preset on the audio engine based on the default selection
      if (typeof audioEngine.setPreset === 'function') {
        audioEngine.setPreset(ln.lane, card.presetSelect.value);
      }
      // When the user changes the preset drop‑down update the audio engine
      card.presetSelect.addEventListener('change', () => {
        if (typeof audioEngine.setPreset === 'function') {
          audioEngine.setPreset(ln.lane, card.presetSelect.value);
        }
        // Update the engine indicator when the melodic lane preset changes
        if (typeof updateEngineIndicator === 'function') {
          updateEngineIndicator();
        }
      });
    }
    workspace = new BlockWorkspace({
      presets,
      onTheoryPresetChange: (presetId) => {
        if (typeof audioEngine.setPreset === 'function') {
          audioEngine.setPreset('note', presetId);
        }
        if (typeof updateEngineIndicator === 'function') {
          updateEngineIndicator();
        }
      },
    });
    nodeStackEl.appendChild(workspace.element);
    const defaultTheory = workspace.addTheoryBlock();
    const defaultRender = workspace.addRenderBlock();
    if (defaultRender) {
      defaultRender.element.classList.add('block-card-initial');
    }
    if (typeof audioEngine.setPreset === 'function' && defaultTheory) {
      audioEngine.setPreset('note', defaultTheory.presetSelect.value);
    }
    // After creating all node cards update the engine indicator to
    // reflect the initial program on the melodic lane.
    if (typeof updateEngineIndicator === 'function') {
      updateEngineIndicator();
    }
    // Playback state
    let isPlaying = false;
    let barIndex = 0;
    let barStartTime = 0;
    let intervalId = null;

    async function compileCurrentBar() {
      const req = {
        seed: parseInt(seedInput.value || '0', 10),
        bpm: parseFloat(bpmInput.value || '80'),
        barIndex,
        nodes: [
          ...nodeCards.map(c => c.toNodeInput()),
          ...workspace.getAllNodeInputs(),
        ],
      };
      try {
        // Inform the audio engine of the current tempo before compiling
        if (typeof audioEngine.setBpm === 'function') {
          audioEngine.setBpm(req.bpm);
        }
        const res = await compileSession(req);
        // group events by lane
        const byLane = {};
        for (const ev of res.events) {
          if (!byLane[ev.lane]) byLane[ev.lane] = [];
          byLane[ev.lane].push(ev);
        }
        for (const card of nodeCards) {
          card.updateSteps(byLane[card.lane] || []);
        }
        workspace.updateStepsForLane('note', byLane.note || []);
        // schedule events into audio engine (ignored for null engine)
        audioEngine.schedule(res.events, 0);
      } catch (err) {
        console.error('Compile error', err);
      }
    }

    function startPlayback() {
      if (isPlaying) return;
      isPlaying = true;
      barIndex = 0;
      barStartTime = performance.now();
      audioEngine.start();
      // Latch any pending nodes immediately before starting
      nodeCards.forEach(c => c.latch());
      workspace.latchAll();
      compileCurrentBar();
      intervalId = setInterval(() => {
        const now = performance.now();
        const bpm = parseFloat(bpmInput.value || '80');
        const barDur = (60 / bpm) * 4 * 1000; // in ms
        const elapsed = now - barStartTime;
        const progress = elapsed / barDur;
        // update playhead
        nodeCards.forEach(c => c.updatePlayhead(progress % 1));
        workspace.updatePlayheads(progress % 1);
        if (elapsed >= barDur) {
          // Move to next bar
          barIndex = (barIndex + 1) % 16;
          barStartTime = now;
          // At the boundary latch pending nodes
          nodeCards.forEach(c => c.latch());
          workspace.latchAll();
          compileCurrentBar();
        }
      }, 50);
    }

    function stopPlayback() {
      if (!isPlaying) return;
      isPlaying = false;
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      audioEngine.stop();
      // Reset playheads
      nodeCards.forEach(c => c.updatePlayhead(0));
      workspace.updatePlayheads(0);
    }

    playButton.addEventListener('click', startPlayback);
    stopButton.addEventListener('click', stopPlayback);
    latchButton.addEventListener('click', () => {
      nodeCards.forEach(c => c.latch());
      workspace.latchAll();
    });
}

main().catch(err => {
  console.error(err);
});
