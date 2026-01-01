import { parseScript, compileSession, getPresets } from './api/client.js';
import { createAudioEngine } from './audio/audioEngine.js';

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
    let defaultPreset = '';
    if (lane === 'note') {
      defaultPreset = presets.find(p => p.id.toLowerCase().includes('piano'))?.id || '';
    }
    if (!defaultPreset) {
      defaultPreset = presets.find(p => p.id.toLowerCase().includes(lane))?.id || presets[0]?.id || '';
    }
    // Compose the default script.  For melodic lanes include a default
    // note specification so users see how to specify pitches.  For
    // drum lanes retain the simple form.
    if (lane === 'note') {
      // Use C4 as the default pitch when none is provided.  The
      // ``notes`` keyword accepts colon‑separated note names or MIDI
      // numbers.  This makes the presence of chords explicit to the
      // user.  To explore melodic stepping, add a ``sequence``
      // argument such as sequence="C4 D4 E4 G4" or sequence="60 62 64 67".
      this.latchedText = `beat(${lane}, "${defaultPattern}", grid="1/4", bars="1-16", preset="${defaultPreset}", notes="C4")`;
    } else {
      this.latchedText = `beat(${lane}, "${defaultPattern}", grid="1/4", bars="1-16", preset="${defaultPreset}")`;
    }
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
    const steps = { '1/4': 4, '1/8': 8, '1/16': 16 }[grid] || 4;
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

/**
 * Entry point: build the UI and wire up the runtime.
 */
async function main() {
    // Fetch preset list from API
    const presetResp = await getPresets();
    const presets = presetResp.presets || [];
    // Create audio engine
    const audioEngine = await createAudioEngine();
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
      // inspect the NodeCard preset select for the note lane and
      // parse the program number if present (gm:bank:program).  If
      // parsing fails the value is shown verbatim.  Only displayed
      // when using the SF2 Engine.
      let programText = '';
      if (audioEngine.name === 'SF2 Engine') {
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
        nodes: nodeCards.map(c => c.toNodeInput()),
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
      compileCurrentBar();
      intervalId = setInterval(() => {
        const now = performance.now();
        const bpm = parseFloat(bpmInput.value || '80');
        const barDur = (60 / bpm) * 4 * 1000; // in ms
        const elapsed = now - barStartTime;
        const progress = elapsed / barDur;
        // update playhead
        nodeCards.forEach(c => c.updatePlayhead(progress % 1));
        if (elapsed >= barDur) {
          // Move to next bar
          barIndex = (barIndex + 1) % 16;
          barStartTime = now;
          // At the boundary latch pending nodes
          nodeCards.forEach(c => c.latch());
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
    }

    playButton.addEventListener('click', startPlayback);
    stopButton.addEventListener('click', stopPlayback);
    latchButton.addEventListener('click', () => {
      nodeCards.forEach(c => c.latch());
    });
}

main().catch(err => {
  console.error(err);
});
