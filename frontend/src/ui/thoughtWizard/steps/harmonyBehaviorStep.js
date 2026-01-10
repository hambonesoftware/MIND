import {
  createLockToggle,
  createOptionGrid,
  createStepFooter,
  createStepSection,
} from '../wizardStepFactory.js';

export const HARMONY_BEHAVIOR_OPTIONS = [
  { value: 'auto', label: 'Auto', description: 'Let the resolver decide the harmony approach.' },
  { value: 'steady', label: 'Steady', description: 'Hold a consistent harmonic bed.' },
  { value: 'active', label: 'Active', description: 'Encourage more harmonic movement.' },
  { value: 'sparse', label: 'Sparse', description: 'Leave more space between chords.' },
];

export function createHarmonyBehaviorStep({
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
    title: 'Harmony Behavior',
    description: 'Guide how harmony fills the space.',
  });

  section.appendChild(createOptionGrid({ options: HARMONY_BEHAVIOR_OPTIONS, value, onSelect }));
  section.appendChild(createLockToggle({ locked, onToggle: onToggleLock }));
  section.appendChild(createStepFooter({
    canContinue,
    onContinue,
    onBack,
    showBack,
  }));
  return section;
}
