const GRID_STEP_MAP = {
  '1/4': 4,
  '1/8': 8,
  '1/12': 12,
  '1/16': 16,
  '1/24': 24,
};

function getStepsPerBar(grid = '1/16') {
  return GRID_STEP_MAP[grid] || GRID_STEP_MAP['1/16'];
}

function normalizeRhythm(rhythm, stepsPerBar) {
  const raw = typeof rhythm === 'string' ? rhythm : '';
  const steps = new Array(Math.max(stepsPerBar, 1)).fill('.');
  let active = false;
  for (let idx = 0; idx < steps.length; idx += 1) {
    const ch = raw[idx];
    if (ch && /\d/.test(ch)) {
      steps[idx] = ch;
      active = true;
    } else if (ch === '-') {
      if (active) {
        steps[idx] = '-';
      } else {
        steps[idx] = '.';
      }
    } else {
      steps[idx] = '.';
      active = false;
    }
  }
  return steps.join('');
}

function tokenizeNotes(notesString) {
  return (notesString || '').replace(/:/g, ' ').split(/\s+/).filter(Boolean);
}

function listNoteStarts(rhythm) {
  const starts = [];
  const chars = typeof rhythm === 'string' ? rhythm : '';
  for (let idx = 0; idx < chars.length; idx += 1) {
    const ch = chars[idx];
    if (ch && /\d/.test(ch)) {
      starts.push(idx);
    } else if (ch === '.') {
      // no-op, but resets the idea of an active note for sanity
    }
  }
  return starts;
}

function syncNotesToRhythm(notesString, rhythm) {
  const starts = listNoteStarts(rhythm).length;
  const tokens = tokenizeNotes(notesString).slice(0, starts);
  while (tokens.length < starts) {
    tokens.push('');
  }
  return tokens.join(' ');
}

function normalizeBar(bar, stepsPerBar) {
  const rhythm = normalizeRhythm(bar?.rhythm, stepsPerBar);
  return {
    rhythm,
    notes: syncNotesToRhythm(bar?.notes || '', rhythm),
  };
}

function normalizeBars(bars, barCount, stepsPerBar) {
  const total = Math.max(barCount || 1, 1);
  const next = [];
  for (let idx = 0; idx < total; idx += 1) {
    next.push(normalizeBar(bars?.[idx], stepsPerBar));
  }
  return next;
}

function buildPresetRhythmA(stepsPerBar) {
  const steps = new Array(Math.max(stepsPerBar, 1)).fill('.');
  const beat = Math.max(1, Math.round(stepsPerBar / 4));
  const anchors = [0, beat, beat * 2].map(pos => Math.min(pos, stepsPerBar - 1));
  anchors.forEach((pos) => {
    steps[pos] = '9';
  });
  const extension = Math.max(1, Math.round(beat / 2));
  const sustainStart = anchors[2];
  for (let idx = 1; idx <= extension && sustainStart + idx < stepsPerBar - 2; idx += 1) {
    steps[sustainStart + idx] = '-';
  }
  const tailPos = Math.min(
    stepsPerBar - Math.max(2, Math.round(beat / 2)),
    stepsPerBar - 1,
  );
  if (tailPos > sustainStart + extension && tailPos < stepsPerBar) {
    steps[tailPos] = '9';
  }
  return steps.join('');
}

function buildPresetRhythmB(stepsPerBar) {
  const steps = new Array(Math.max(stepsPerBar, 1)).fill('.');
  const beat = Math.max(1, Math.round(stepsPerBar / 4));
  for (let barBeat = 0; barBeat < 4; barBeat += 1) {
    const pos = Math.min(Math.round(barBeat * beat), stepsPerBar - 1);
    steps[pos] = '9';
    const holdLen = Math.max(0, Math.round(beat / 2) - 1);
    for (let idx = 1; idx <= holdLen && pos + idx < stepsPerBar; idx += 1) {
      steps[pos + idx] = '-';
    }
  }
  return steps.join('');
}

export {
  buildPresetRhythmA,
  buildPresetRhythmB,
  getStepsPerBar,
  listNoteStarts,
  normalizeBar,
  normalizeBars,
  normalizeRhythm,
  syncNotesToRhythm,
  tokenizeNotes,
};
