import { THOUGHT_INTENT_KEYS } from '../../music/immutables.js';

export const LOCKS_KEY = THOUGHT_INTENT_KEYS.LOCKS;

export function createStepSection({ title, description } = {}) {
  const section = document.createElement('section');
  section.className = 'thought-wizard-step';
  const header = document.createElement('div');
  header.className = 'thought-wizard-step-header';
  const titleEl = document.createElement('h3');
  titleEl.className = 'thought-wizard-step-title';
  titleEl.textContent = title;
  header.appendChild(titleEl);
  if (description) {
    const desc = document.createElement('p');
    desc.className = 'thought-wizard-step-description';
    desc.textContent = description;
    header.appendChild(desc);
  }
  section.appendChild(header);
  return { section, header };
}

export function createOptionGrid({ options = [], value, onSelect } = {}) {
  const grid = document.createElement('div');
  grid.className = 'thought-wizard-option-grid';
  options.forEach((option) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'thought-wizard-option';
    if (option.value === value) {
      button.classList.add('is-selected');
    }
    const label = document.createElement('div');
    label.className = 'thought-wizard-option-label';
    label.textContent = option.label;
    button.appendChild(label);
    if (option.description) {
      const description = document.createElement('div');
      description.className = 'thought-wizard-option-description';
      description.textContent = option.description;
      button.appendChild(description);
    }
    button.addEventListener('click', () => {
      if (typeof onSelect === 'function') {
        onSelect(option.value);
      }
    });
    grid.appendChild(button);
  });
  return grid;
}

export function createLockToggle({ locked, onToggle } = {}) {
  const wrapper = document.createElement('label');
  wrapper.className = 'thought-wizard-lock-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(locked);
  input.addEventListener('change', () => {
    if (typeof onToggle === 'function') {
      onToggle(input.checked);
    }
  });
  const text = document.createElement('span');
  text.textContent = 'Lock this choice';
  wrapper.appendChild(input);
  wrapper.appendChild(text);
  return wrapper;
}

export function createStepFooter({ canContinue, onContinue, onBack, continueLabel = 'Continue', showBack = false } = {}) {
  const footer = document.createElement('div');
  footer.className = 'thought-wizard-step-footer';
  if (showBack) {
    const backButton = document.createElement('button');
    backButton.type = 'button';
    backButton.className = 'thought-wizard-secondary';
    backButton.textContent = 'Back';
    backButton.addEventListener('click', () => {
      if (typeof onBack === 'function') {
        onBack();
      }
    });
    footer.appendChild(backButton);
  }
  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'thought-wizard-primary';
  continueButton.textContent = continueLabel;
  continueButton.disabled = !canContinue;
  continueButton.addEventListener('click', () => {
    if (typeof onContinue === 'function') {
      onContinue();
    }
  });
  footer.appendChild(continueButton);
  return footer;
}

export function createValueRow({ labelText, valueText } = {}) {
  const row = document.createElement('div');
  row.className = 'thought-wizard-value-row';
  const label = document.createElement('div');
  label.className = 'thought-wizard-value-label';
  label.textContent = labelText;
  const value = document.createElement('div');
  value.className = 'thought-wizard-value';
  value.textContent = valueText;
  row.appendChild(label);
  row.appendChild(value);
  return row;
}
