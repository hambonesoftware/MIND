import { buildFocusKey } from './focusScope.js';

export function debounce(fn, delay = 250) {
  let timeout = null;
  let lastArgs = null;
  const debounced = (...args) => {
    lastArgs = args;
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      fn(...lastArgs);
    }, delay);
  };
  debounced.flush = () => {
    if (!timeout) {
      return;
    }
    clearTimeout(timeout);
    timeout = null;
    if (lastArgs) {
      fn(...lastArgs);
    }
  };
  return debounced;
}

export function buildField({ label, type, value, onChange, placeholder, helper, focusKey, commitDelay = 250 }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const input = document.createElement('input');
  input.className = 'flow-field-input';
  input.type = type === 'number' ? 'number' : 'text';
  input.value = value ?? '';
  if (placeholder) {
    input.placeholder = placeholder;
  }
  const keyBase = focusKey || label;
  const scopedKey = buildFocusKey(keyBase);
  if (scopedKey) {
    input.dataset.focusKey = scopedKey;
  }
  const commit = debounce((nextValue) => {
    onChange(nextValue);
  }, commitDelay);
  input.addEventListener('input', () => {
    const nextValue = type === 'number'
      ? Number(input.value)
      : input.value;
    commit(nextValue);
  });
  input.addEventListener('blur', () => {
    if (typeof commit.flush === 'function') {
      commit.flush();
    }
  });
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  if (helper) {
    const help = document.createElement('span');
    help.className = 'flow-field-help';
    help.textContent = helper;
    wrapper.appendChild(help);
  }
  return wrapper;
}

export function buildToggle({ label, checked, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-toggle';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  input.addEventListener('change', () => onChange(input.checked));
  const title = document.createElement('span');
  title.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(title);
  return wrapper;
}

export function buildSelect({ label, value, options, onChange, focusKey }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const select = document.createElement('select');
  select.className = 'flow-field-input';
  const keyBase = focusKey || label;
  const scopedKey = buildFocusKey(keyBase);
  if (scopedKey) {
    select.dataset.focusKey = scopedKey;
  }
  const resolvedValue = value ?? '';
  options.forEach((option) => {
    const entry = document.createElement('option');
    entry.value = option.value;
    entry.textContent = option.label || option.value;
    if (option.value === resolvedValue) {
      entry.selected = true;
    }
    select.appendChild(entry);
  });
  select.addEventListener('change', () => onChange(select.value));
  wrapper.appendChild(title);
  wrapper.appendChild(select);
  return wrapper;
}

export function buildTextarea({ label, value, onChange, placeholder, helper, focusKey, commitDelay = 250 }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const input = document.createElement('textarea');
  input.className = 'flow-field-input flow-field-textarea';
  input.value = value ?? '';
  if (placeholder) {
    input.placeholder = placeholder;
  }
  const keyBase = focusKey || label;
  const scopedKey = buildFocusKey(keyBase);
  if (scopedKey) {
    input.dataset.focusKey = scopedKey;
  }
  const commit = debounce(onChange, commitDelay);
  input.addEventListener('input', () => {
    commit(input.value);
  });
  input.addEventListener('blur', () => {
    if (typeof commit.flush === 'function') {
      commit.flush();
    }
  });
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  if (helper) {
    const help = document.createElement('span');
    help.className = 'flow-field-help';
    help.textContent = helper;
    wrapper.appendChild(help);
  }
  return wrapper;
}

export function buildCheckbox({ label, checked, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field flow-field-row';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = Boolean(checked);
  input.addEventListener('change', () => {
    onChange(input.checked);
  });
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(title);
  return wrapper;
}
