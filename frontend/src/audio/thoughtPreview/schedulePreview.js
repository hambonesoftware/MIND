import { compileSession } from '../../api/client.js';
import { buildCompilePayload } from '../../state/compilePayload.js';
import { buildPreviewGraph } from './buildPreviewGraph.js';

const BEATS_PER_BAR = 4;
const DEFAULT_BPM = 80;
const MIN_BPM = 30;
const MAX_BPM = 300;
const DEFAULT_SEED = 0;
const UPDATE_DEBOUNCE_MS = 250;

const clampNumber = (value, min, max, fallback) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, numeric));
};

const getAudioTime = (engine) => {
  if (!engine) {
    return 0;
  }
  if (typeof engine.getCurrentTime === 'function') {
    return engine.getCurrentTime();
  }
  if (typeof engine.currentTime === 'number') {
    return engine.currentTime;
  }
  return 0;
};

export function createThoughtPreviewController({
  audioEngineRef,
  ensureAudioStarted,
  bpmInput,
  seedInput,
  getPreviewData,
  onStatusChange,
} = {}) {
  let isPlaying = false;
  let loopTimer = null;
  let updateTimer = null;
  let playbackToken = 0;

  const clearTimer = (timer) => {
    if (timer) {
      window.clearTimeout(timer);
    }
  };

  const stopTimers = () => {
    clearTimer(loopTimer);
    loopTimer = null;
    clearTimer(updateTimer);
    updateTimer = null;
  };

  const stopAudio = () => {
    const engine = audioEngineRef?.current;
    if (engine && typeof engine.stop === 'function') {
      engine.stop();
    }
  };

  const getBpm = () => clampNumber(bpmInput?.value, MIN_BPM, MAX_BPM, DEFAULT_BPM);
  const getSeed = () => clampNumber(seedInput?.value, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, DEFAULT_SEED);

  const scheduleCycle = async (token) => {
    const previewData = getPreviewData?.();
    if (!previewData || !audioEngineRef?.current) {
      return;
    }
    const { thoughtId, params, ui } = previewData;
    if (!params) {
      return;
    }
    const durationBars = Math.max(1, Number(params.durationBars) || 1);
    const bpm = getBpm();
    const seed = getSeed();
    const beatDuration = 60 / bpm;
    const engine = audioEngineRef?.current;
    const startTime = getAudioTime(engine);
    const flowGraph = buildPreviewGraph({ thoughtId, params, ui });
    const scheduled = [];
    let runtimeState = null;

    for (let barIndex = 0; barIndex < durationBars; barIndex += 1) {
      const req = buildCompilePayload({
        seed,
        bpm,
        barIndex,
        beatStart: 0,
        beatEnd: BEATS_PER_BAR,
        flowGraph,
        runtimeState,
      });
      const res = await compileSession(req);
      if (!isPlaying || token !== playbackToken) {
        return;
      }
      runtimeState = res.runtimeState || runtimeState;
      const events = Array.isArray(res.events) ? res.events : [];
      events.forEach((event) => {
        if (typeof event.tBeat !== 'number') {
          return;
        }
        scheduled.push({
          ...event,
          audioTime: startTime + (barIndex * BEATS_PER_BAR + event.tBeat) * beatDuration,
        });
      });
    }

    if (!isPlaying || token !== playbackToken) {
      return;
    }
    if (engine && typeof engine.schedule === 'function' && scheduled.length > 0) {
      engine.schedule(scheduled, 0);
    }

    const durationMs = (durationBars * BEATS_PER_BAR * 60 * 1000) / bpm;
    loopTimer = window.setTimeout(() => scheduleCycle(token), durationMs);
  };

  const start = async () => {
    const previewData = getPreviewData?.();
    if (!previewData) {
      return;
    }
    if (typeof ensureAudioStarted === 'function') {
      await ensureAudioStarted('thought-preview');
    }
    const engine = audioEngineRef?.current;
    if (engine && typeof engine.start === 'function') {
      engine.start();
    }
    playbackToken += 1;
    isPlaying = true;
    stopTimers();
    onStatusChange?.(true);
    scheduleCycle(playbackToken);
  };

  const stop = () => {
    if (!isPlaying) {
      return;
    }
    playbackToken += 1;
    isPlaying = false;
    stopTimers();
    stopAudio();
    onStatusChange?.(false);
  };

  const restart = async () => {
    if (!isPlaying) {
      return;
    }
    stop();
    await start();
  };

  const requestUpdate = () => {
    if (!isPlaying) {
      return;
    }
    clearTimer(updateTimer);
    updateTimer = window.setTimeout(() => {
      updateTimer = null;
      restart();
    }, UPDATE_DEBOUNCE_MS);
  };

  return {
    start,
    stop,
    requestUpdate,
    isPlaying: () => isPlaying,
  };
}
