import {
  createLockToggle,
  createOptionGrid,
  createStepFooter,
  createStepSection,
} from '../wizardStepFactory.js';

export function createMotionStep({
  options,
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
    title: 'Motion',
    description: 'Set how the notes move through time.',
  });

  section.appendChild(createOptionGrid({ options, value, onSelect }));
  section.appendChild(createLockToggle({ locked, onToggle: onToggleLock }));
  section.appendChild(createStepFooter({
    canContinue,
    onContinue,
    onBack,
    showBack,
  }));
  return section;
}
