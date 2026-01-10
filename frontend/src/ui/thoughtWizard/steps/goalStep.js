import {
  createLockToggle,
  createOptionGrid,
  createStepFooter,
  createStepSection,
} from '../wizardStepFactory.js';

export const GOAL_OPTIONS = [
  { value: 'driving_groove', label: 'Driving Groove', description: 'Pushes rhythm and momentum forward.' },
  { value: 'cinematic_arc', label: 'Cinematic Arc', description: 'Builds tension and release over time.' },
  { value: 'ambient_drift', label: 'Ambient Drift', description: 'Floats with sustained textures.' },
  { value: 'rhythmic_pulse', label: 'Rhythmic Pulse', description: 'Locks into a repeating pulse.' },
  { value: 'melodic_hook', label: 'Melodic Hook', description: 'Highlights a memorable motif.' },
];

export function createGoalStep({
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
    title: 'Goal',
    description: 'Choose the primary outcome for this Thought.',
  });

  section.appendChild(createOptionGrid({ options: GOAL_OPTIONS, value, onSelect }));
  section.appendChild(createLockToggle({ locked, onToggle: onToggleLock }));
  section.appendChild(createStepFooter({
    canContinue,
    onContinue,
    onBack,
    showBack,
  }));
  return section;
}
