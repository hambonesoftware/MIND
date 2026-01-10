import {
  createLockToggle,
  createOptionGrid,
  createStepFooter,
  createStepSection,
} from '../wizardStepFactory.js';

export function createStyleStep({
  options,
  value,
  locked,
  seedValue,
  onSelect,
  onToggleLock,
  onSeedChange,
  onReroll,
  onContinue,
  onBack,
  canContinue,
  showBack,
} = {}) {
  const { section } = createStepSection({
    title: 'Style',
    description: 'Select the genre palette for this Thought.',
  });

  section.appendChild(createOptionGrid({ options, value, onSelect }));

  const seedRow = document.createElement('div');
  seedRow.className = 'thought-wizard-seed-row';
  const seedLabel = document.createElement('label');
  seedLabel.className = 'thought-wizard-seed-label';
  seedLabel.textContent = 'Seed';
  const seedInput = document.createElement('input');
  seedInput.type = 'number';
  seedInput.value = Number.isFinite(seedValue) ? seedValue : 1;
  seedInput.addEventListener('change', () => {
    const next = Number.parseInt(seedInput.value, 10);
    if (Number.isFinite(next) && typeof onSeedChange === 'function') {
      onSeedChange(next);
    }
  });
  seedLabel.appendChild(seedInput);
  seedRow.appendChild(seedLabel);
  const rerollButton = document.createElement('button');
  rerollButton.type = 'button';
  rerollButton.className = 'thought-wizard-secondary';
  rerollButton.textContent = 'Reroll';
  rerollButton.addEventListener('click', () => {
    if (typeof onReroll === 'function') {
      onReroll();
    }
  });
  seedRow.appendChild(rerollButton);
  section.appendChild(seedRow);

  section.appendChild(createLockToggle({ locked, onToggle: onToggleLock }));
  section.appendChild(createStepFooter({
    canContinue,
    onContinue,
    onBack,
    showBack,
  }));
  return section;
}
