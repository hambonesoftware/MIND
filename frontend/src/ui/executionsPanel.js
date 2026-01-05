export function createExecutionsPanel() {
  const panel = document.createElement('section');
  panel.className = 'executions-panel';

  const title = document.createElement('div');
  title.className = 'executions-title';
  title.textContent = 'Executions / Logs';
  panel.appendChild(title);

  const grid = document.createElement('div');
  grid.className = 'executions-grid';
  panel.appendChild(grid);

  const buildField = (label) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'executions-field';
    const labelEl = document.createElement('div');
    labelEl.className = 'executions-label';
    labelEl.textContent = label;
    const valueEl = document.createElement('div');
    valueEl.className = 'executions-value';
    valueEl.textContent = '--';
    wrapper.appendChild(labelEl);
    wrapper.appendChild(valueEl);
    grid.appendChild(wrapper);
    return valueEl;
  };

  const transportValue = buildField('Transport');
  const barBeatValue = buildField('Bar / Beat');
  const sinksValue = buildField('Active Render Sinks');
  const scheduleValue = buildField('Schedule Window');
  const nowPlayingValue = buildField('Now Playing');
  const traceValue = buildField('Runtime Trace');
  const diagnosticsValue = buildField('Diagnostics');

  const update = ({
    transportState,
    barBeat,
    renderSinks,
    scheduleWindow,
    nowPlaying,
    debugTrace,
    diagnostics,
  } = {}) => {
    transportValue.textContent = transportState || '--';
    barBeatValue.textContent = barBeat || '--';
    const sinksText = Array.isArray(renderSinks) && renderSinks.length > 0
      ? renderSinks.join(', ')
      : 'None';
    sinksValue.textContent = sinksText;
    scheduleValue.textContent = scheduleWindow || '--';
    nowPlayingValue.textContent = nowPlaying || 'None';
    const traceText = Array.isArray(debugTrace) && debugTrace.length > 0
      ? debugTrace.join(' | ')
      : 'None';
    traceValue.textContent = traceText;
    const diagnosticsText = Array.isArray(diagnostics) && diagnostics.length > 0
      ? diagnostics.map(item => `${item.level || 'info'}: ${item.message}`).join(' | ')
      : 'None';
    diagnosticsValue.textContent = diagnosticsText;
  };

  return { element: panel, update };
}
