import { getPresets } from './api/client.js';
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
import { createThoughtWizardModal } from './ui/thoughtWizard/thoughtWizardModal.js';
import { createToastManager } from './ui/toast.js';
import { createRivuletLab } from './ui/rivuletLab.js';
import { NodeCard, NoteWorkspaceCard } from './ui/nodeCards.js';

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
    const thoughtWizard = createThoughtWizardModal({
      store: flowStore,
      audioEngineRef,
      ensureAudioStarted,
      bpmInput,
      seedInput,
    });
    document.body.appendChild(thoughtWizard.element);
    const openThoughtWizard = (nodeId, { isNew = false } = {}) => {
      if (!nodeId) {
        return;
      }
      flowStore.setSelection({ nodes: [nodeId], edges: [] });
      thoughtWizard.open({ nodeId, isNew });
    };
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
    const handleClearWorkspace = () => {
      if (typeof stopFlowPlayback === 'function') {
        stopFlowPlayback();
      }
      flowStore.clear();
      updatePlayButtonState(flowStore.getState());
      if (toast?.showToast) {
        toast.showToast('Stream workspace cleared.');
      }
    };
    const flowCanvas = createFlowCanvas({
      store: flowStore,
      toast,
      onStartPlayback: (startNodeId) => startFlowPlayback(startNodeId),
      onStopPlayback: () => stopFlowPlayback(),
      onEditThought: (nodeId) => openThoughtWizard(nodeId, { isNew: false }),
    });
    if (flowCanvasMount) {
      const rivuletLab = createRivuletLab({ store: flowStore, audioEngine: audioEngineRef.current });
      flowCanvasMount.parentElement?.insertBefore(rivuletLab.element, flowCanvasMount);
      flowCanvasMount.appendChild(flowCanvas.element);
    }
    const addNodeAtCenter = (type) => {
      const center = flowCanvas.getViewportCenter();
      return flowStore.addNode(type, { ui: center });
    };
    const flowPalette = createFlowPalette({
      store: flowStore,
      onAddNode: addNodeAtCenter,
      onClearWorkspace: handleClearWorkspace,
      onOpenThoughtWizard: (nodeId, { isNew } = {}) => openThoughtWizard(nodeId, { isNew }),
    });
    if (flowPaletteMount) {
      flowPaletteMount.appendChild(flowPalette.element);
    }
    const flowInspector = createFlowInspector({
      store: flowStore,
      onEditThought: (nodeId) => openThoughtWizard(nodeId, { isNew: false }),
    });
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
