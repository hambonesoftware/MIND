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

  const update = ({
    transportState,
    barBeat,
    renderSinks,
    scheduleWindow,
  } = {}) => {
    transportValue.textContent = transportState || '--';
    barBeatValue.textContent = barBeat || '--';
    const sinksText = Array.isArray(renderSinks) && renderSinks.length > 0
      ? renderSinks.join(', ')
      : 'None';
    sinksValue.textContent = sinksText;
    scheduleValue.textContent = scheduleWindow || '--';
  };

  return { element: panel, update };
}
