import { parseScript, getPresets } from './api/client.js';
import { createAudioEngine } from './audio/audioEngine.js';
import { NullAudioEngine } from './audio/nullEngine.js';
import { createTransportScheduler } from './audio/transport.js';
import { USE_NODE_GRAPH } from './config.js';
import { createGraphStore } from './state/graphStore.js';
import { createFlowGraphStore, DEFAULT_STATE, isStartPlayable } from './state/flowGraph.js';
import { createExecutionsPanel } from './ui/executionsPanel.js';
import { createFlowCanvas } from './ui/flowCanvas.js';
import { createFlowInspector } from './ui/flowInspector.js';
import { createFlowPalette } from './ui/flowPalette.js';
import { createToastManager } from './ui/toast.js';
import { createRivuletLab } from './ui/rivuletLab.js';

/**
 * Represents a single node/lane in the UI.  Each node manages its
 * own DOM subtree and knows how to parse its script, latch edits and
 * visualise scheduled events.
 */
class NodeCard {
  constructor({ lane, displayName, presets, onGraphChange = null }) {
    this.lane = lane;
    this.displayName = displayName;
    this.presets = presets;
    this.onGraphChange = onGraphChange;
    const defaultPattern = lane === 'kick'
      ? '9...'
      : lane === 'snare'
      ? '.9..'
      : lane === 'hat'
      ? '....'
      : '....';
    const defaultPreset = resolveDefaultPreset(lane, presets);
    this.latchedText = buildDefaultScript(lane, defaultPattern, defaultPreset);
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
    this.muteCheckbox.addEventListener('change', () => {
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
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
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
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

  toGraphNode() {
    return {
      id: this.lane,
      kind: 'theory',
      enabled: !this.muteCheckbox.checked,
      text: this.latchedText,
    };
  }

  /**
   * Update the visual step strip based on compiled events.
   * @param {Array} events - events for this lane
   */
  updateSteps(events) {
    // Determine step count from grid
    const grid = this.lastParsedGrid || '1/4';
    const steps = { '1/4': 4, '1/8': 8, '1/12': 12, '1/16': 16, '1/24': 24 }[grid] || 4;
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

class NoteWorkspaceCard {
  constructor({ displayName, presets, onGraphChange = null }) {
    this.lane = 'note';
    this.displayName = displayName;
    this.presets = presets;
    this.onGraphChange = onGraphChange;
    this.blockCounter = 1;
    this.blocks = [];
    this.lastParsedGrid = '1/4';
    const defaultPreset = resolveDefaultPreset('note', presets);
    this.element = document.createElement('div');
    this.element.className = 'node-card';
    const header = document.createElement('div');
    header.className = 'node-header';
    const nameSpan = document.createElement('span');
    nameSpan.className = 'node-name';
    nameSpan.textContent = displayName;
    header.appendChild(nameSpan);
    this.statusPill = document.createElement('span');
    this.statusPill.className = 'status-pill status-latched';
    this.statusPill.textContent = 'Workspace';
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
    body.className = 'node-body';
    this.workspace = document.createElement('div');
    this.workspace.className = 'workspace';
    const toolbar = document.createElement('div');
    toolbar.className = 'workspace-toolbar';
    const addTheoryButton = document.createElement('button');
    addTheoryButton.textContent = '+ Theory Block';
    const addRenderButton = document.createElement('button');
    addRenderButton.textContent = '+ Render Block';
    toolbar.appendChild(addTheoryButton);
    toolbar.appendChild(addRenderButton);
    this.workspace.appendChild(toolbar);
    this.workspaceList = document.createElement('div');
    this.workspaceList.className = 'workspace-list';
    this.workspace.appendChild(this.workspaceList);
    this.activeHint = document.createElement('div');
    this.activeHint.className = 'workspace-hint';
    this.workspace.appendChild(this.activeHint);
    body.appendChild(this.workspace);

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

    addTheoryButton.addEventListener('click', () => this.addTheoryBlock());
    addRenderButton.addEventListener('click', () => this.addRenderBlock());
    this.presetSelect.addEventListener('change', () => {
      this.updatePresetAcrossTheoryBlocks(this.presetSelect.value);
    });

    this.addTheoryBlock(defaultPreset);
    this.renderWorkspace();
  }

  addTheoryBlock(defaultPresetOverride = null) {
    const presetId = defaultPresetOverride || this.presetSelect?.value || '';
    const block = {
      id: `theory-${this.blockCounter++}`,
      kind: 'theory',
      title: `Theory ${this.blockCounter - 1}`,
      enabled: true,
      latchedText: buildDefaultScript('note', '....', presetId),
      pendingText: null,
      status: 'Latched',
      lastParsedGrid: '1/4',
    };
    this.blocks.push(block);
    this.renderWorkspace();
    if (typeof this.onGraphChange === 'function') {
      this.onGraphChange();
    }
  }

  addRenderBlock() {
    const block = {
      id: `render-${this.blockCounter++}`,
      kind: 'render',
      title: `Render ${this.blockCounter - 1}`,
      enabled: true,
      render: {
        strumEnabled: false,
        spreadMs: 20,
        direction: 'DUDUDUDU',
        percEnabled: false,
        hatPattern: '........',
        kickPattern: '........',
        snarePattern: '........',
      },
      childId: null,
    };
    this.blocks.push(block);
    this.renderWorkspace();
    if (typeof this.onGraphChange === 'function') {
      this.onGraphChange();
    }
  }

  getBlockById(id) {
    return this.blocks.find(block => block.id === id) || null;
  }

  getRootBlocks() {
    const childIds = new Set(
      this.blocks
        .filter(block => block.kind === 'render' && block.childId)
        .map(block => block.childId),
    );
    return this.blocks.filter(block => !childIds.has(block.id));
  }

  getActiveTheoryBlock() {
    const renderWithChild = this.blocks.find(
      block => block.kind === 'render' && block.enabled && block.childId,
    );
    if (renderWithChild) {
      return this.getBlockById(renderWithChild.childId);
    }
    const firstEnabledTheory = this.blocks.find(
      block => block.kind === 'theory' && block.enabled,
    );
    return firstEnabledTheory || this.blocks.find(block => block.kind === 'theory') || null;
  }

  updateActiveHint() {
    const active = this.getActiveTheoryBlock();
    if (active) {
      this.activeHint.textContent = `Using Theory Block ${active.title} for playback.`;
    } else {
      this.activeHint.textContent = 'Add a Theory block to enable playback.';
    }
  }

  updatePresetAcrossTheoryBlocks(presetId) {
    const presetRe = /(preset\s*=\s*")[^"]*(")/i;
    for (const block of this.blocks) {
      if (block.kind !== 'theory') {
        continue;
      }
      const script = block.pendingText || block.latchedText;
      let updated = script;
      if (presetRe.test(script)) {
        updated = script.replace(presetRe, `$1${presetId}$2`);
      } else {
        const idx = script.lastIndexOf(')');
        if (idx !== -1) {
          updated = `${script.slice(0, idx)}, preset="${presetId}"${script.slice(idx)}`;
        }
      }
      if (block.pendingText) {
        block.pendingText = updated;
        block.status = 'Pending';
      } else {
        block.latchedText = updated;
      }
    }
    this.renderWorkspace();
    if (typeof this.onGraphChange === 'function') {
      this.onGraphChange();
    }
  }

  renderWorkspace() {
    this.workspaceList.innerHTML = '';
    const rootBlocks = this.getRootBlocks();
    for (const block of rootBlocks) {
      if (block.kind === 'theory') {
        this.workspaceList.appendChild(this.renderTheoryBlock(block));
      } else {
        this.workspaceList.appendChild(this.renderRenderBlock(block));
      }
    }
    this.updateActiveHint();
  }

  renderTheoryBlock(block) {
    const card = document.createElement('div');
    card.className = 'block-card';
    const header = document.createElement('div');
    header.className = 'block-card-header';
    header.draggable = true;
    header.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', block.id);
      event.dataTransfer.effectAllowed = 'move';
    });
    const title = document.createElement('span');
    title.textContent = block.title;
    header.appendChild(title);
    const status = document.createElement('span');
    status.className = `status-pill ${block.status === 'Error'
      ? 'status-error'
      : block.status === 'Pending'
      ? 'status-pending'
      : 'status-latched'}`;
    status.textContent = block.status;
    header.appendChild(status);
    const enabledLabel = document.createElement('label');
    enabledLabel.className = 'block-toggle';
    const enabledInput = document.createElement('input');
    enabledInput.type = 'checkbox';
    enabledInput.checked = block.enabled;
    enabledInput.addEventListener('change', () => {
      block.enabled = enabledInput.checked;
      this.updateActiveHint();
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    enabledLabel.appendChild(enabledInput);
    enabledLabel.appendChild(document.createTextNode(' Enabled'));
    header.appendChild(enabledLabel);
    card.appendChild(header);

    const textarea = document.createElement('textarea');
    textarea.className = 'script-input';
    textarea.value = block.pendingText || block.latchedText;
    textarea.addEventListener('input', () => {
      block.pendingText = textarea.value;
      block.status = 'Pending';
      status.textContent = 'Pending';
      status.className = 'status-pill status-pending';
      parseScript(block.pendingText)
        .then(res => {
          if (res.ok) {
            block.lastParsedGrid = res.ast?.grid || block.lastParsedGrid || '1/4';
            block.status = 'Pending';
            status.textContent = 'Pending';
            status.className = 'status-pill status-pending';
          } else {
            block.status = 'Error';
            status.textContent = 'Error';
            status.className = 'status-pill status-error';
          }
        })
        .catch(() => {
          block.status = 'Error';
          status.textContent = 'Error';
          status.className = 'status-pill status-error';
        });
    });
    card.appendChild(textarea);
    return card;
  }

  renderRenderBlock(block) {
    const card = document.createElement('div');
    card.className = 'block-card';
    const header = document.createElement('div');
    header.className = 'block-card-header';
    const title = document.createElement('span');
    title.textContent = block.title;
    header.appendChild(title);
    const enabledLabel = document.createElement('label');
    enabledLabel.className = 'block-toggle';
    const enabledInput = document.createElement('input');
    enabledInput.type = 'checkbox';
    enabledInput.checked = block.enabled;
    enabledInput.addEventListener('change', () => {
      block.enabled = enabledInput.checked;
      this.updateActiveHint();
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    enabledLabel.appendChild(enabledInput);
    enabledLabel.appendChild(document.createTextNode(' Enabled'));
    header.appendChild(enabledLabel);
    card.appendChild(header);

    const controls = document.createElement('div');
    controls.className = 'render-controls';
    const strumLabel = document.createElement('label');
    const strumInput = document.createElement('input');
    strumInput.type = 'checkbox';
    strumInput.checked = block.render.strumEnabled;
    strumInput.addEventListener('change', () => {
      block.render.strumEnabled = strumInput.checked;
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    strumLabel.appendChild(strumInput);
    strumLabel.appendChild(document.createTextNode(' Strum'));
    controls.appendChild(strumLabel);

    const spreadLabel = document.createElement('label');
    spreadLabel.textContent = 'Spread (ms)';
    const spreadInput = document.createElement('input');
    spreadInput.type = 'range';
    spreadInput.min = '0';
    spreadInput.max = '120';
    spreadInput.value = String(block.render.spreadMs);
    const spreadValue = document.createElement('span');
    spreadValue.textContent = ` ${block.render.spreadMs}`;
    spreadInput.addEventListener('input', () => {
      block.render.spreadMs = parseInt(spreadInput.value, 10);
      spreadValue.textContent = ` ${block.render.spreadMs}`;
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    spreadLabel.appendChild(spreadInput);
    spreadLabel.appendChild(spreadValue);
    controls.appendChild(spreadLabel);

    const directionLabel = document.createElement('label');
    directionLabel.textContent = 'Direction';
    const directionInput = document.createElement('input');
    directionInput.type = 'text';
    directionInput.value = block.render.direction;
    directionInput.addEventListener('input', () => {
      block.render.direction = directionInput.value;
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    directionLabel.appendChild(directionInput);
    controls.appendChild(directionLabel);

    const percLabel = document.createElement('label');
    const percInput = document.createElement('input');
    percInput.type = 'checkbox';
    percInput.checked = block.render.percEnabled;
    percInput.addEventListener('change', () => {
      block.render.percEnabled = percInput.checked;
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    percLabel.appendChild(percInput);
    percLabel.appendChild(document.createTextNode(' Perc'));
    controls.appendChild(percLabel);

    const hatLabel = document.createElement('label');
    hatLabel.textContent = 'Hat';
    const hatInput = document.createElement('input');
    hatInput.type = 'text';
    hatInput.value = block.render.hatPattern;
    hatInput.addEventListener('input', () => {
      block.render.hatPattern = hatInput.value;
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    hatLabel.appendChild(hatInput);
    controls.appendChild(hatLabel);

    const kickLabel = document.createElement('label');
    kickLabel.textContent = 'Kick';
    const kickInput = document.createElement('input');
    kickInput.type = 'text';
    kickInput.value = block.render.kickPattern;
    kickInput.addEventListener('input', () => {
      block.render.kickPattern = kickInput.value;
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    kickLabel.appendChild(kickInput);
    controls.appendChild(kickLabel);

    const snareLabel = document.createElement('label');
    snareLabel.textContent = 'Snare';
    const snareInput = document.createElement('input');
    snareInput.type = 'text';
    snareInput.value = block.render.snarePattern;
    snareInput.addEventListener('input', () => {
      block.render.snarePattern = snareInput.value;
      if (typeof this.onGraphChange === 'function') {
        this.onGraphChange();
      }
    });
    snareLabel.appendChild(snareInput);
    controls.appendChild(snareLabel);
    card.appendChild(controls);

    const dropzone = document.createElement('div');
    dropzone.className = 'dropzone';
    dropzone.textContent = 'Drop a Theory block here';
    dropzone.addEventListener('dragover', (event) => {
      event.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', (event) => {
      event.preventDefault();
      dropzone.classList.remove('dragover');
      const droppedId = event.dataTransfer.getData('text/plain');
      const droppedBlock = this.getBlockById(droppedId);
      if (droppedBlock && droppedBlock.kind === 'theory') {
        block.childId = droppedBlock.id;
        this.renderWorkspace();
        if (typeof this.onGraphChange === 'function') {
          this.onGraphChange();
        }
      }
    });
    if (block.childId) {
      const child = this.getBlockById(block.childId);
      if (child) {
        dropzone.textContent = '';
        const nested = document.createElement('div');
        nested.className = 'nested-child';
        const nestedTitle = document.createElement('span');
        nestedTitle.textContent = `${child.title} (${child.status})`;
        nested.appendChild(nestedTitle);
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove child';
        removeButton.addEventListener('click', () => {
          block.childId = null;
          this.renderWorkspace();
          if (typeof this.onGraphChange === 'function') {
            this.onGraphChange();
          }
        });
        nested.appendChild(removeButton);
        dropzone.appendChild(nested);
      }
    }
    card.appendChild(dropzone);
    return card;
  }

  latch() {
    for (const block of this.blocks) {
      if (block.kind !== 'theory') {
        continue;
      }
      if (block.status === 'Pending' && block.pendingText) {
        block.latchedText = block.pendingText;
        block.pendingText = null;
        block.status = 'Latched';
      }
    }
    this.renderWorkspace();
    if (typeof this.onGraphChange === 'function') {
      this.onGraphChange();
    }
  }

  toNodeInput() {
    const active = this.getActiveTheoryBlock();
    if (active) {
      this.lastParsedGrid = active.lastParsedGrid || this.lastParsedGrid;
    }
    return {
      id: this.lane,
      text: active ? active.latchedText : '',
      enabled: !this.muteCheckbox.checked && Boolean(active),
    };
  }

  toGraphNodes() {
    return this.blocks
      .slice()
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((block) => {
        if (block.kind === 'theory') {
          return {
            id: block.id,
            kind: 'theory',
            enabled: block.enabled,
            text: block.latchedText,
          };
        }
        return {
          id: block.id,
          kind: 'render',
          enabled: block.enabled,
          childId: block.childId || null,
          render: {
            strum: {
              enabled: block.render.strumEnabled,
              spreadMs: block.render.spreadMs,
              directionByStep: block.render.direction,
            },
            perc: {
              enabled: block.render.percEnabled,
              hat: block.render.hatPattern,
              kick: block.render.kickPattern,
              snare: block.render.snarePattern,
            },
          },
        };
      });
  }

  toGraphEdges() {
    return this.blocks
      .filter(block => block.kind === 'render' && block.childId)
      .map(block => ({
        id: `edge-${block.id}-${block.childId}`,
        from: { nodeId: block.id },
        to: { nodeId: block.childId },
      }));
  }

  loadWorkspace(workspace) {
    this.blocks = workspace.blocks.map(block => ({
      ...block,
      pendingText: null,
      status: 'Latched',
      lastParsedGrid: block.lastParsedGrid || '1/4',
    }));
    const maxIndex = this.blocks
      .map(block => parseInt(block.id.split('-')[1], 10))
      .filter(Number.isFinite)
      .reduce((max, value) => Math.max(max, value), 0);
    this.blockCounter = maxIndex + 1;
    this.renderWorkspace();
    if (typeof this.onGraphChange === 'function') {
      this.onGraphChange();
    }
  }

  updateSteps(events) {
    const grid = this.lastParsedGrid || '1/4';
    const steps = { '1/4': 4, '1/8': 8, '1/12': 12, '1/16': 16, '1/24': 24 }[grid] || 4;
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

function resolveDefaultPreset(lane, presets) {
  let defaultPreset = '';
  if (lane === 'note') {
    defaultPreset = presets.find(p => p.id.toLowerCase().includes('piano'))?.id || '';
  }
  if (!defaultPreset) {
    defaultPreset = presets.find(p => p.id.toLowerCase().includes(lane))?.id || presets[0]?.id || '';
  }
  return defaultPreset;
}

function buildDefaultScript(lane, defaultPattern, defaultPreset) {
  if (lane === 'note') {
    return `beat(${lane}, "${defaultPattern}", grid="1/4", bars="1-16", preset="${defaultPreset}", notes="C4")`;
  }
  return `beat(${lane}, "${defaultPattern}", grid="1/4", bars="1-16", preset="${defaultPreset}")`;
}

/**
 * Entry point: build the UI and wire up the runtime.
 */
async function main() {
    // Fetch preset list from API
    const presetResp = await getPresets();
    const presets = presetResp.presets || [];
    const toast = createToastManager();
    const placeholderEngine = new NullAudioEngine();
    await placeholderEngine.init();
    placeholderEngine.name = 'Audio not started';
    const audioEngineRef = { current: placeholderEngine };
    let audioInitPromise = null;
    const graphStore = createGraphStore();
    const nodeCards = [];

    const syncPresetsToEngine = (engine) => {
      if (!engine || typeof engine.setPreset !== 'function') return;
      nodeCards.forEach((card) => {
        if (card?.presetSelect) {
          engine.setPreset(card.lane || card.displayName?.toLowerCase?.() || 'lane', card.presetSelect.value);
        }
      });
    };

    const ensureAudioStarted = async (reason = 'play-click') => {
      if (audioEngineRef.current !== placeholderEngine && audioEngineRef.current) {
        return audioEngineRef.current;
      }
      if (audioInitPromise) {
        return audioInitPromise;
      }
      audioInitPromise = (async () => {
        console.log('[AudioGate] ensureAudioStarted begin', reason);
        try {
          const engine = await createAudioEngine({ strictSf2: true });
          audioEngineRef.current = engine;
          syncPresetsToEngine(engine);
          console.log('[AudioGate] audio engine ready (gesture-gated)', reason, 'engine=', engine.name);
          if (typeof updateEngineIndicator === 'function') {
            updateEngineIndicator();
          }
          return engine;
        } catch (err) {
          console.error('Failed to initialise audio engine:', err);
          toast.showToast('Audio disabled: failed to initialize the SF2 synth.');
          const nullEngine = new NullAudioEngine();
          await nullEngine.init();
          nullEngine.name = 'Audio Disabled';
          audioEngineRef.current = nullEngine;
          if (typeof updateEngineIndicator === 'function') {
            updateEngineIndicator();
          }
          return nullEngine;
        }
      })();
      return audioInitPromise;
    };
    const restoredGraph = graphStore.loadFromStorage();
    let syncGraphStoreFromUi = () => {};
    let isRestoringGraph = false;
    // Build transport bar
    const transport = document.getElementById('transport');
    // Play/Stop button
    const playButton = document.createElement('button');
    playButton.textContent = 'Play';
    transport.appendChild(playButton);
    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    transport.appendChild(stopButton);
    const v9DemoSelect = document.createElement('select');
    const v9DemoButton = document.createElement('button');
    v9DemoButton.textContent = 'Load V9 Demo';
    transport.appendChild(v9DemoSelect);
    transport.appendChild(v9DemoButton);
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
    nameSpan.textContent = ` Engine: ${audioEngineRef.current.name}`;
    engineIndicator.appendChild(nameSpan);
    const statusSpan = document.createElement('span');
    statusSpan.className = 'engine-status';
    engineIndicator.appendChild(statusSpan);
    const progressSpan = document.createElement('span');
    progressSpan.className = 'engine-progress';
    engineIndicator.appendChild(progressSpan);
    transport.appendChild(engineIndicator);
    let sf2ProgressListenersBound = false;
    const bindSf2ProgressListeners = () => {
      const engine = audioEngineRef.current;
      if (sf2ProgressListenersBound || engine?.name !== 'SF2 Engine') return;
      sf2ProgressListenersBound = true;
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
    };

    // Helper to update the status and program indicator.
    function updateEngineIndicator() {
      // Update status: only meaningful for Sf2Engine which exposes
      // ``status`` property; default engines omit it.
      const engine = audioEngineRef.current;
      nameSpan.textContent = ` Engine: ${engine?.name || 'Audio not started'}`;
      const status = engine?.status || '';
      let statusText = '';
      if (engine?.name === 'SF2 Engine') {
        statusText = status === 'Active' ? ' SF2: Active' : ' SF2: Fallback';
      }
      // Determine current program for the melodic lane (note).  We
      // inspect the NodeCard preset select for the note lane and
      // parse the program number if present (gm:bank:program).  If
      // parsing fails the value is shown verbatim.  Only displayed
      // when using the SF2 Engine.
      let programText = '';
      if (engine?.name === 'SF2 Engine') {
        const noteCard = nodeCards.find(c => c.lane === 'note');
        if (noteCard) {
          const presetId = noteCard.presetSelect.value;
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
      bindSf2ProgressListeners();
    }
    // Note: updateEngineIndicator() cannot be called until the
    // NodeCards array has been created.  It will be invoked after
    // NodeCard construction later in this function.
    bindSf2ProgressListeners();
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
    if (nodeStackEl) {
      const lanes = [
        { lane: 'kick', displayName: 'Kick' },
        { lane: 'snare', displayName: 'Snare' },
        { lane: 'hat', displayName: 'Hat' },
        // Add a melodic lane for pitched sequences.  The backend maps the
        // 'note' lane to MIDI note 60 by default; users can specify
        // different note numbers in the script.
        { lane: 'note', displayName: 'Piano' },
      ];
      for (const ln of lanes) {
        const card = ln.lane === 'note'
          ? new NoteWorkspaceCard({
            displayName: ln.displayName,
            presets,
            onGraphChange: () => syncGraphStoreFromUi(),
          })
          : new NodeCard({
            lane: ln.lane,
            displayName: ln.displayName,
            presets,
            onGraphChange: () => syncGraphStoreFromUi(),
          });
        nodeCards.push(card);
        nodeStackEl.appendChild(card.element);
        // Set the initial preset on the audio engine based on the default selection
        const currentEngine = audioEngineRef.current;
        if (currentEngine !== placeholderEngine && typeof currentEngine?.setPreset === 'function') {
          currentEngine.setPreset(ln.lane, card.presetSelect.value);
        }
        // When the user changes the preset drop‑down update the audio engine
        card.presetSelect.addEventListener('change', () => {
          const engine = audioEngineRef.current;
          if (engine !== placeholderEngine && typeof engine?.setPreset === 'function') {
            engine.setPreset(ln.lane, card.presetSelect.value);
          }
          // Update the engine indicator when the melodic lane preset changes
          if (typeof updateEngineIndicator === 'function') {
            updateEngineIndicator();
          }
        });
      }
    }
    // After creating all node cards update the engine indicator to
    // reflect the initial program on the melodic lane.
    if (typeof updateEngineIndicator === 'function') {
      updateEngineIndicator();
    }

    const buildGraphStateFromUi = () => {
      const baseState = graphStore.getState();
      const nodes = [];
      const edges = [];
      const buildPorts = () => ({ inputs: [], outputs: [] });

      for (const card of nodeCards) {
        if (card.lane === 'note') {
          continue;
        }
        nodes.push({
          id: card.lane,
          type: 'lane',
          params: {
            kind: 'lane',
            lane: card.lane,
            text: card.latchedText,
            enabled: !card.muteCheckbox.checked,
          },
          ui: { x: 0, y: 0 },
          ports: buildPorts(),
        });
      }

      const noteCard = nodeCards.find(card => card.lane === 'note');
      if (noteCard && Array.isArray(noteCard.blocks)) {
        for (const block of noteCard.blocks) {
          if (block.kind === 'theory') {
            nodes.push({
              id: block.id,
              type: 'theory',
              params: {
                kind: 'theory',
                title: block.title,
                text: block.latchedText,
                enabled: block.enabled,
                lastParsedGrid: block.lastParsedGrid,
              },
              ui: { x: 0, y: 0 },
              ports: buildPorts(),
            });
          } else if (block.kind === 'render') {
            nodes.push({
              id: block.id,
              type: 'render',
              params: {
                kind: 'render',
                title: block.title,
                enabled: block.enabled,
                childId: block.childId || null,
                render: { ...block.render },
              },
              ui: { x: 0, y: 0 },
              ports: buildPorts(),
            });
            if (block.childId) {
              edges.push({
                id: `edge-${block.id}-${block.childId}`,
                from: { nodeId: block.id, portId: null },
                to: { nodeId: block.childId, portId: null },
              });
            }
          }
        }
      }

      return {
        nodes,
        edges,
        selection: baseState.selection,
        viewport: baseState.viewport,
      };
    };

    syncGraphStoreFromUi = ({ recordHistory = !isRestoringGraph } = {}) => {
      graphStore.setGraph(buildGraphStateFromUi(), { recordHistory });
    };

    const applyGraphStateToUi = (graphState) => {
      if (!graphState || !Array.isArray(graphState.nodes)) {
        return;
      }
      const laneNodes = graphState.nodes.filter(node => node.type === 'lane');
      for (const card of nodeCards) {
        if (card.lane === 'note') {
          continue;
        }
        const laneNode = laneNodes.find(node => node.params?.lane === card.lane || node.id === card.lane);
        if (laneNode) {
          card.latchedText = laneNode.params?.text || card.latchedText;
          card.pendingText = null;
          card.scriptInput.value = card.latchedText;
          card.updateStatus('Latched');
          card.muteCheckbox.checked = laneNode.params?.enabled === false;
        }
      }

      const noteCard = nodeCards.find(card => card.lane === 'note');
      if (noteCard) {
        const renderLinks = new Map();
        for (const edge of graphState.edges || []) {
          if (edge?.from?.nodeId && edge?.to?.nodeId) {
            renderLinks.set(edge.from.nodeId, edge.to.nodeId);
          }
        }
        const theoryNodes = graphState.nodes.filter(node => node.type === 'theory');
        const renderNodes = graphState.nodes.filter(node => node.type === 'render');
        const blocks = [
          ...theoryNodes.map((node, index) => ({
            id: node.id,
            kind: 'theory',
            title: node.params?.title || `Theory ${index + 1}`,
            enabled: node.params?.enabled !== false,
            latchedText: node.params?.text || '',
            lastParsedGrid: node.params?.lastParsedGrid || '1/4',
          })),
          ...renderNodes.map((node, index) => ({
            id: node.id,
            kind: 'render',
            title: node.params?.title || `Render ${index + 1}`,
            enabled: node.params?.enabled !== false,
            childId: renderLinks.get(node.id) || node.params?.childId || null,
            render: node.params?.render || {
              strumEnabled: false,
              spreadMs: 20,
              direction: 'DUDUDUDU',
              percEnabled: false,
              hatPattern: '........',
              kickPattern: '........',
              snarePattern: '........',
            },
          })),
        ];
        if (blocks.length > 0) {
          noteCard.loadWorkspace({ blocks });
        }
      }
    };

    if (restoredGraph?.nodes?.length) {
      isRestoringGraph = true;
      applyGraphStateToUi(restoredGraph);
      isRestoringGraph = false;
    }
    syncGraphStoreFromUi({ recordHistory: false });

    const executionsMount = document.getElementById('executionsPanel');
    const executionsPanel = createExecutionsPanel();
    if (executionsMount) {
      executionsMount.appendChild(executionsPanel.element);
    }

    const flowStore = createFlowGraphStore();
    flowStore.load();
    const updatePlayButtonState = (state) => {
      const nextState = state || flowStore.getState?.() || {};
      const startId = nextState.runtime?.activeStartNodeId
        || (nextState.nodes || []).find(node => node.type === 'start')?.id
        || null;
      const canPlay = isStartPlayable(nextState.nodes || [], nextState.edges || [], startId);
      playButton.disabled = !canPlay;
      playButton.title = canPlay
        ? 'Start playback from the Start node.'
        : 'Add a Start node connected to a Thought to enable playback.';
    };
    const flowCanvasMount = document.getElementById('flowCanvas');
    const flowPaletteMount = document.getElementById('flowPalette');
    const flowInspectorMount = document.getElementById('flowInspector');
    let startFlowPlayback = () => {};
    let stopFlowPlayback = () => {};
    const flowCanvas = createFlowCanvas({
      store: flowStore,
      toast,
      onStartPlayback: (startNodeId) => startFlowPlayback(startNodeId),
      onStopPlayback: () => stopFlowPlayback(),
    });
    if (flowCanvasMount) {
      const rivuletLab = createRivuletLab({ store: flowStore, audioEngine: audioEngineRef.current });
      flowCanvasMount.parentElement?.insertBefore(rivuletLab.element, flowCanvasMount);
      flowCanvasMount.appendChild(flowCanvas.element);
    }
    const addNodeAtCenter = (type) => {
      const center = flowCanvas.getViewportCenter();
      flowStore.addNode(type, { ui: center });
    };
    const flowPalette = createFlowPalette({ store: flowStore, onAddNode: addNodeAtCenter });
    if (flowPaletteMount) {
      flowPaletteMount.appendChild(flowPalette.element);
    }
    const flowInspector = createFlowInspector({ store: flowStore });
    if (flowInspectorMount) {
      flowInspectorMount.appendChild(flowInspector.element);
    }
    updatePlayButtonState(flowStore.getState());
    flowStore.subscribe(updatePlayButtonState);
    const v9Demos = [
      { id: 'moonlight', label: 'Moonlight Opening Loop', url: '/docs/demos/v9/moonlight_loop_v9.json' },
      { id: 'parallel', label: 'Parallel Fan-out', url: '/docs/demos/v9/parallel_fanout_v9.json' },
      { id: 'join', label: 'Join Barrier', url: '/docs/demos/v9/join_barrier_v9.json' },
    ];
    v9DemoSelect.innerHTML = '';
    for (const demo of v9Demos) {
      const opt = document.createElement('option');
      opt.value = demo.id;
      opt.textContent = demo.label;
      v9DemoSelect.appendChild(opt);
    }
    v9DemoButton.addEventListener('click', async () => {
      const selected = v9Demos.find(demo => demo.id === v9DemoSelect.value);
      if (!selected) {
        return;
      }
      try {
        const response = await fetch(selected.url);
        if (!response.ok) {
          return;
        }
        const demoGraph = await response.json();
        const thoughtNode = (demoGraph.nodes || []).find(node => node.type === 'thought');
        flowStore.setState({
          ...DEFAULT_STATE,
          ...demoGraph,
          selection: thoughtNode ? { nodes: [thoughtNode.id], edges: [] } : { nodes: [], edges: [] },
        });
      } catch (error) {
        console.error('Failed to load demo', error);
      }
    });
    const transportScheduler = createTransportScheduler({
      audioEngineRef,
      nodeCards,
      graphStore,
      flowStore,
      executionsPanel,
      bpmInput,
      seedInput,
      playButton,
      stopButton,
      latchButton,
      useNodeGraph: USE_NODE_GRAPH,
      ensureAudioStarted,
    });
    startFlowPlayback = (startNodeId) => transportScheduler.startPlayback({ activeStartNodeId: startNodeId });
    stopFlowPlayback = () => transportScheduler.stopPlayback();
}

main().catch(err => {
  console.error(err);
});
