// assets/vendor/spessasynth/spessasynth_worker.js
//
// Worker entry for SpessaSynth WorkerSynthesizerCore.

import { WorkerSynthesizerCore } from '/assets/vendor/spessasynth/index.js';

let core = null;

function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  if (typeof error === 'string') return error;
  return error.message || String(error);
}

self.onmessage = (event) => {
  if (!core) {
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
