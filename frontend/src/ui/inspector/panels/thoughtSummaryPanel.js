import { normalizeMusicThoughtParams } from '../../music/normalizeThought.js';
import { normalizeThoughtIntent } from '../../music/thoughtIntentNormalize.js';

export function renderThoughtSummary({ node, onEditThought }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'flow-thought-summary';
  const canon = normalizeMusicThoughtParams(node.params || {});
  const intent = normalizeThoughtIntent(canon);

  const summaryList = document.createElement('div');
  summaryList.className = 'flow-thought-summary-list';
  const rows = [
    { label: 'Goal', value: intent.goal },
    { label: 'Role', value: intent.role },
    { label: 'Style', value: intent.styleId },
    { label: 'Mood', value: intent.moodId },
    { label: 'Motion', value: intent.motionId },
    { label: 'Density', value: Number.isFinite(intent.density) ? `${Math.round(intent.density * 100)}%` : '—' },
    { label: 'Harmony', value: intent.harmonyBehavior },
    { label: 'Sound', value: intent.soundColor },
    { label: 'Seed', value: String(intent.seed) },
  ];
  rows.forEach((row) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'flow-thought-summary-row';
    const label = document.createElement('div');
    label.className = 'flow-thought-summary-label';
    label.textContent = row.label;
    const value = document.createElement('div');
    value.className = 'flow-thought-summary-value';
    value.textContent = row.value || '—';
    rowEl.appendChild(label);
    rowEl.appendChild(value);
    summaryList.appendChild(rowEl);
  });
  wrapper.appendChild(summaryList);

  const actionRow = document.createElement('div');
  actionRow.className = 'flow-thought-summary-actions';
  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.className = 'flow-panel-action';
  editButton.textContent = 'Edit Thought';
  editButton.addEventListener('click', () => {
    if (typeof onEditThought === 'function') {
      onEditThought(node.id);
    }
  });
  actionRow.appendChild(editButton);
  wrapper.appendChild(actionRow);
  return wrapper;
}
