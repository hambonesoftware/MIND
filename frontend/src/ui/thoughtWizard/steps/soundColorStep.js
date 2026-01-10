import {
  createLockToggle,
  createOptionGrid,
  createStepFooter,
  createStepSection,
} from '../wizardStepFactory.js';

export const SOUND_COLOR_OPTIONS = [
  { value: 'auto', label: 'Auto', description: 'Follow the style defaults.' },
  { value: 'warm', label: 'Warm', description: 'Rounded and mellow tone.' },
  { value: 'bright', label: 'Bright', description: 'Crisp and forward tone.' },
  { value: 'dark', label: 'Dark', description: 'Subdued and shadowy tone.' },
  { value: 'airy', label: 'Airy', description: 'Light and spacious tone.' },
  { value: 'gritty', label: 'Gritty', description: 'Textured and rough tone.' },
];

export function createSoundColorStep({
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
    title: 'Sound Color',
    description: 'Choose the tonal color for this Thought.',
  });

  section.appendChild(createOptionGrid({ options: SOUND_COLOR_OPTIONS, value, onSelect }));
  section.appendChild(createLockToggle({ locked, onToggle: onToggleLock }));
  section.appendChild(createStepFooter({
    canContinue,
    onContinue,
    onBack,
    showBack,
  }));
  return section;
}
