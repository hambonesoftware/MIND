import {
  createLockToggle,
  createStepFooter,
  createStepSection,
} from '../wizardStepFactory.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function createDensityStep({
  value,
  locked,
  onSelect,
  onToggleLock,
  onContinue,
  onBack,
  canContinue,
  showBack,
} = {}) {
  const { section } = createStepSection({
    title: 'Density',
    description: 'Adjust how busy the pattern feels.',
  });

  const row = document.createElement('div');
  row.className = 'thought-wizard-density-row';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '1';
  slider.step = '0.05';
  slider.value = Number.isFinite(value) ? String(value) : '0.5';

  const meter = document.createElement('div');
  meter.className = 'thought-wizard-density-meter';
  const valueLabel = document.createElement('span');
  valueLabel.textContent = `${Math.round(clamp(Number(slider.value), 0, 1) * 100)}%`; 
  meter.appendChild(valueLabel);

  slider.addEventListener('input', () => {
    const next = clamp(Number.parseFloat(slider.value), 0, 1);
    valueLabel.textContent = `${Math.round(next * 100)}%`;
    if (typeof onSelect === 'function') {
      onSelect(next);
    }
  });

  row.appendChild(slider);
  row.appendChild(meter);
  section.appendChild(row);

  section.appendChild(createLockToggle({ locked, onToggle: onToggleLock }));
  section.appendChild(createStepFooter({
    canContinue,
    onContinue,
    onBack,
    showBack,
  }));
  return section;
}
