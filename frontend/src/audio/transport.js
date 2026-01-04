import { compileSession } from '../api/client.js';
import { buildCompilePayload } from '../state/compilePayload.js';

const TICK_INTERVAL_MS = 25;
const LOOKAHEAD_SEC = 0.2;
const BEATS_PER_BAR = 4;

function toNumber(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
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

export function createTransportScheduler({
  audioEngine,
  nodeCards,
  graphStore,
  flowStore,
  executionsPanel,
  bpmInput,
  seedInput,
  playButton,
  stopButton,
  latchButton,
  useNodeGraph,
  loopBars = 16,
}) {
  const loopBeats = loopBars * BEATS_PER_BAR;
  let isPlaying = false;
  let tickHandle = null;
  let startTimeSec = 0;
  let scheduledThroughBeat = 0;
  let lastBeat = 0;
  let currentBarIndex = 0;
  let lastBarIndex = 0;
  const barEvents = new Map();
  let runtimeState = null;
  let lastDebugTrace = [];
  let compileQueue = Promise.resolve();
  let playbackSession = 0;

  const describeRenderSinks = () => {
    const noteCard = nodeCards.find(card => card.lane === 'note');
    if (!noteCard || !Array.isArray(noteCard.blocks)) {
      return [];
    }
    const renderBlocks = noteCard.blocks.filter(
      block => block.kind === 'render' && block.enabled,
    );
    return renderBlocks.map(block => {
      const modes = [];
      if (block.render?.strumEnabled) {
        modes.push('strum');
      }
      if (block.render?.percEnabled) {
        modes.push('perc');
      }
      const modeText = modes.length ? ` [${modes.join('+')}]` : '';
      const childText = block.childId ? ` → ${block.childId}` : ' (no child)';
      return `${block.title}${childText}${modeText}`;
    });
  };

  const formatScheduleWindow = (windowStartBeat, windowEndBeat) => {
    if (!isPlaying) {
      return `Idle (lookahead ${Math.round(LOOKAHEAD_SEC * 1000)}ms)`;
    }
    return `Beats ${windowStartBeat.toFixed(2)}–${windowEndBeat.toFixed(2)}`;
  };

  const updateExecutionsPanel = (
    windowStartBeat = 0,
    windowEndBeat = 0,
    diagnostics = [],
  ) => {
    const transportState = isPlaying
      ? `Playing (${audioEngine.name})`
      : `Stopped (${audioEngine.name})`;
    const barBeat = isPlaying
      ? `Bar ${currentBarIndex + 1} • Beat ${lastBeat.toFixed(2)}`
      : 'Idle';
    executionsPanel.update({
      transportState,
      barBeat,
      renderSinks: describeRenderSinks(),
      scheduleWindow: formatScheduleWindow(windowStartBeat, windowEndBeat),
      debugTrace: lastDebugTrace,
      diagnostics,
    });
  };

  const updateUiForEvents = (events) => {
    const byLane = {};
    for (const ev of events) {
      if (!byLane[ev.lane]) byLane[ev.lane] = [];
      byLane[ev.lane].push(ev);
    }
    for (const card of nodeCards) {
      card.updateSteps(byLane[card.lane] || []);
    }
  };

  const updateUiForBar = (targetBar) => {
    updateUiForEvents(barEvents.get(targetBar) || []);
  };

  const buildGraphInputs = () => {
    const graphState = graphStore.getState();
    const graphNodes = graphState.nodes || [];
    const graphEdges = graphState.edges || [];
    const renderLinks = new Map(
      graphEdges
        .filter(edge => edge?.from?.nodeId && edge?.to?.nodeId)
        .map(edge => [edge.from.nodeId, edge.to.nodeId]),
    );
    const laneNodes = graphNodes
      .filter(node => node.type === 'lane')
      .map(node => ({
        id: node.id,
        kind: 'theory',
        enabled: node.params?.enabled !== false,
        text: node.params?.text || '',
      }))
      .sort((a, b) => a.id.localeCompare(b.id));
    const noteNodes = graphNodes
      .filter(node => node.type !== 'lane')
      .map(node => {
        if (node.type === 'render') {
          const renderParams = node.params?.render || {};
          return {
            id: node.id,
            kind: 'render',
            enabled: node.params?.enabled !== false,
            childId: renderLinks.get(node.id) || node.params?.childId || null,
            render: {
              strum: {
                enabled: renderParams.strumEnabled ?? false,
                spreadMs: renderParams.spreadMs ?? 0,
                directionByStep: renderParams.direction ?? '',
              },
              perc: {
                enabled: renderParams.percEnabled ?? false,
                hat: renderParams.hatPattern ?? '',
                kick: renderParams.kickPattern ?? '',
                snare: renderParams.snarePattern ?? '',
              },
            },
          };
        }
        return {
          id: node.id,
          kind: 'theory',
          enabled: node.params?.enabled !== false,
          text: node.params?.text || '',
        };
      });
    const edges = graphEdges.map(edge => ({
      id: edge.id,
      from: { nodeId: edge.from?.nodeId, portId: edge.from?.portId || null },
      to: { nodeId: edge.to?.nodeId, portId: edge.to?.portId || null },
    }));
    const legacyNodes = nodeCards.map(card => card.toNodeInput());
    const nodes = [...laneNodes, ...noteNodes];
    const incoming = new Set(
      edges.map(edge => edge.to?.nodeId).filter(Boolean),
    );
    const startNodeIds = nodes
      .filter(node => node.enabled && !incoming.has(node.id))
      .map(node => node.id);
    return { laneNodes, noteNodes, edges, startNodeIds, legacyNodes };
  };

  const recordBarEvents = (events, beatDur) => {
    for (const ev of events) {
      let absoluteBeat = null;
      if (typeof ev.tBeat === 'number' && Number.isFinite(ev.tBeat)) {
        absoluteBeat = ev.tBeat;
      } else if (typeof ev.audioTime === 'number' && Number.isFinite(ev.audioTime)) {
        absoluteBeat = (ev.audioTime - startTimeSec) / beatDur;
      }
      if (absoluteBeat === null) {
        continue;
      }
      const bar = ((Math.floor(absoluteBeat / BEATS_PER_BAR) % loopBars) + loopBars) % loopBars;
      const beatInBar = ((absoluteBeat % BEATS_PER_BAR) + BEATS_PER_BAR) % BEATS_PER_BAR;
      const entry = { ...ev, tBeat: beatInBar };
      if (!barEvents.has(bar)) {
        barEvents.set(bar, []);
      }
      barEvents.get(bar).push(entry);
    }
  };

  const requestWindow = async ({
    beatStartInLoop,
    beatEndInLoop,
    cycleStartBeat,
    beatDur,
    sessionId,
  }) => {
    if (!isPlaying || sessionId !== playbackSession) {
      return;
    }
    const seed = parseInt(seedInput.value || '0', 10);
    const bpm = toNumber(bpmInput.value, 80);
    const graphInputs = buildGraphInputs();
    const barStart = Math.floor(beatStartInLoop / BEATS_PER_BAR);
    const barEnd = Math.max(barStart, Math.floor((beatEndInLoop - 0.001) / BEATS_PER_BAR));
    const flowGraph = flowStore.getState();
    const activeStartNodeId = flowGraph.runtime?.activeStartNodeId || null;
    const startNodeIds = useNodeGraph
      ? (activeStartNodeId ? [activeStartNodeId] : [])
      : graphInputs.startNodeIds;
    try {
      for (let barOffset = barStart; barOffset <= barEnd; barOffset += 1) {
        const barIndex = ((barOffset % loopBars) + loopBars) % loopBars;
        const req = buildCompilePayload({
          seed,
          bpm,
          barIndex,
          beatStart: beatStartInLoop,
          beatEnd: beatEndInLoop,
          flowGraph,
          runtimeState,
          laneNodes: graphInputs.laneNodes,
          noteNodes: graphInputs.noteNodes,
          edges: graphInputs.edges,
          startNodeIds,
          legacyNodes: graphInputs.legacyNodes,
          useNodeGraph,
        });
        const res = await compileSession(req);
        if (!isPlaying || sessionId !== playbackSession) {
          return;
        }
        const events = Array.isArray(res.events) ? res.events : [];
        const diagnostics = Array.isArray(res.diagnostics) ? res.diagnostics : [];
        if (diagnostics.some(item => item.level === 'error')) {
          console.error('Runtime diagnostics', diagnostics);
        }
        lastDebugTrace = Array.isArray(res.debugTrace) ? res.debugTrace : [];
        if (res.runtimeState) {
          runtimeState = res.runtimeState;
        }
        if (typeof flowStore?.setRuntimeState === 'function') {
          flowStore.setRuntimeState({ runtimeState, debugTrace: lastDebugTrace });
        }
        const scheduled = events.map(ev => {
          if (typeof ev.audioTime === 'number' && Number.isFinite(ev.audioTime)) {
            return ev;
          }
          if (typeof ev.tBeat === 'number' && Number.isFinite(ev.tBeat)) {
            const absoluteBeat = cycleStartBeat + barOffset * BEATS_PER_BAR + ev.tBeat;
            return { ...ev, audioTime: startTimeSec + absoluteBeat * beatDur };
          }
          return ev;
        });
        recordBarEvents(scheduled, beatDur);
        audioEngine.schedule(scheduled, 0);
        if (currentBarIndex === barIndex) {
          updateUiForEvents(barEvents.get(currentBarIndex) || []);
        }
        updateExecutionsPanel(windowStartBeat, windowEndBeat, diagnostics);
      }
    } catch (err) {
      console.error('Compile error', err);
    }
  };

  const tickScheduler = () => {
    if (!isPlaying) {
      return;
    }
    const bpm = toNumber(bpmInput.value, 80);
    if (typeof audioEngine.setBpm === 'function') {
      audioEngine.setBpm(bpm);
    }
    const beatDur = 60 / bpm;
    const nowSec = getAudioTime(audioEngine);
    const elapsedSec = nowSec - startTimeSec;
    const absoluteBeat = elapsedSec / beatDur;
    const windowStartBeat = Math.max(absoluteBeat, scheduledThroughBeat);
    const windowEndBeat = absoluteBeat + LOOKAHEAD_SEC / beatDur;

    currentBarIndex = Math.floor(absoluteBeat / BEATS_PER_BAR) % loopBars;
    lastBeat = ((absoluteBeat % BEATS_PER_BAR) + BEATS_PER_BAR) % BEATS_PER_BAR;
    const progress = (lastBeat / BEATS_PER_BAR) % 1;
    nodeCards.forEach(c => c.updatePlayhead(progress));

    if (currentBarIndex !== lastBarIndex) {
      barEvents.delete(lastBarIndex);
      lastBarIndex = currentBarIndex;
      nodeCards.forEach(c => c.latch());
      updateUiForBar(currentBarIndex);
    }

    if (windowEndBeat > windowStartBeat) {
      let windowStart = windowStartBeat;
      const work = async () => {
        while (windowStart < windowEndBeat) {
          const cycleStartBeat = Math.floor(windowStart / loopBeats) * loopBeats;
          const cycleEndBeat = cycleStartBeat + loopBeats;
          const segmentEnd = Math.min(windowEndBeat, cycleEndBeat);
          const beatStartInLoop = windowStart - cycleStartBeat;
          const beatEndInLoop = segmentEnd - cycleStartBeat;
          await requestWindow({
            beatStartInLoop,
            beatEndInLoop,
            cycleStartBeat,
            beatDur,
            sessionId: playbackSession,
          });
          windowStart = segmentEnd;
        }
      };
      scheduledThroughBeat = windowEndBeat;
      compileQueue = compileQueue
        .then(work)
        .catch(err => {
          console.error('Compile error', err);
          updateExecutionsPanel(windowStartBeat, windowEndBeat, [
            { level: 'error', message: 'Compile request failed.' },
          ]);
        });
    } else {
      updateExecutionsPanel(windowStartBeat, windowEndBeat);
    }
  };

  const startPlayback = ({ activeStartNodeId } = {}) => {
    if (isPlaying) return;
    playbackSession += 1;
    isPlaying = true;
    currentBarIndex = 0;
    lastBarIndex = 0;
    lastBeat = 0;
    barEvents.clear();
    runtimeState = null;
    lastDebugTrace = [];
    compileQueue = Promise.resolve();
    if (typeof flowStore?.setPlaybackState === 'function') {
      const fallbackStartNodeId = flowStore.getState?.().runtime?.activeStartNodeId || null;
      flowStore.setPlaybackState({
        isPlaying: true,
        activeStartNodeId: activeStartNodeId ?? fallbackStartNodeId,
      });
    }
    if (typeof flowStore?.setRuntimeState === 'function') {
      flowStore.setRuntimeState({ runtimeState: null, debugTrace: [] });
    }
    audioEngine.start();
    nodeCards.forEach(c => c.latch());
    startTimeSec = getAudioTime(audioEngine);
    scheduledThroughBeat = 0;
    updateUiForBar(currentBarIndex);
    updateExecutionsPanel(0, 0);
    tickHandle = setInterval(tickScheduler, TICK_INTERVAL_MS);
  };

  const stopPlayback = () => {
    if (!isPlaying) return;
    isPlaying = false;
    playbackSession += 1;
    if (tickHandle) {
      clearInterval(tickHandle);
      tickHandle = null;
    }
    audioEngine.stop();
    barEvents.clear();
    nodeCards.forEach(c => c.updatePlayhead(0));
    runtimeState = null;
    lastDebugTrace = [];
    compileQueue = Promise.resolve();
    if (typeof flowStore?.setPlaybackState === 'function') {
      const currentStartNodeId = flowStore.getState?.().runtime?.activeStartNodeId || null;
      flowStore.setPlaybackState({ isPlaying: false, activeStartNodeId: currentStartNodeId });
    }
    if (typeof flowStore?.setRuntimeState === 'function') {
      flowStore.setRuntimeState({ runtimeState: null, debugTrace: [] });
    }
    updateExecutionsPanel(0, 0);
  };

  playButton.addEventListener('click', startPlayback);
  stopButton.addEventListener('click', stopPlayback);
  latchButton.addEventListener('click', () => {
    nodeCards.forEach(c => c.latch());
  });

  updateExecutionsPanel(0, 0);

  return {
    startPlayback,
    stopPlayback,
  };
}
