import {
  createLockToggle,
  createOptionGrid,
  createStepFooter,
  createStepSection,
} from '../wizardStepFactory.js';

export const ROLE_OPTIONS = [
  { value: 'lead', label: 'Lead', description: 'Carries the melodic spotlight.' },
  { value: 'harmony', label: 'Harmony', description: 'Supports chords and texture.' },
  { value: 'bass', label: 'Bass', description: 'Anchors the low end.' },
  { value: 'drums', label: 'Drums', description: 'Focuses on rhythmic drive.' },
  { value: 'fx', label: 'FX', description: 'Adds transitions and accents.' },
];

export function createRoleStep({
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
    title: 'Role',
    description: 'Pick the musical role this Thought should play.',
  });

  section.appendChild(createOptionGrid({ options: ROLE_OPTIONS, value, onSelect }));
  section.appendChild(createLockToggle({ locked, onToggle: onToggleLock }));
  section.appendChild(createStepFooter({
    canContinue,
    onContinue,
    onBack,
    showBack,
  }));
  return section;
}
