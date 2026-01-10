import {
  createStepFooter,
  createStepSection,
  createValueRow,
} from '../wizardStepFactory.js';

export function createCommitStep({
  summary,
  onCommit,
  onBack,
  showBack,
} = {}) {
  const { section } = createStepSection({
    title: 'Commit',
    description: 'Review the selections before applying.',
  });

  const list = document.createElement('div');
  list.className = 'thought-wizard-summary';
  (summary || []).forEach((entry) => {
    list.appendChild(createValueRow({
      labelText: entry.label,
      valueText: entry.value,
    }));
  });
  section.appendChild(list);

  section.appendChild(createStepFooter({
    canContinue: true,
    onContinue: onCommit,
    onBack,
    showBack,
    continueLabel: 'Apply Thought',
  }));
  return section;
}
