// frontend/src/audio/spessa/SpessaSynthWorker.js
//
// Worker entry for SpessaSynth WorkerSynthesizerCore.

const SPESSA_LIB_URL = '/assets/vendor/spessasynth/index.js';

const spessaModulePromise = import(/* @vite-ignore */ SPESSA_LIB_URL);

let core = null;

function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  return error.message || String(error);
}

self.onmessage = async (event) => {
  if (!core) {
    const mod = await spessaModulePromise;
    const WorkerSynthesizerCore = mod?.WorkerSynthesizerCore;
    if (!WorkerSynthesizerCore) {
      throw new Error('SpessaSynth worker missing WorkerSynthesizerCore export');
    }
    const port = event.ports?.[0];
    if (!port) {
      throw new Error('SpessaSynth worker missing MessagePort');
    }
    core = new WorkerSynthesizerCore(event.data, port, self.postMessage.bind(self));
    return;
  }

  try {
    core.handleMessage(event.data);
  } catch (error) {
    console.error('[SpessaSynthWorker] handleMessage failed:', getErrorMessage(error));
  }
};
