export function createStepStrip({ steps = [], onChange } = {}) {
  let localSteps = Array.isArray(steps) ? [...steps] : [];
  const cells = [];

  const element = document.createElement('div');
  element.className = 'melody-step-strip';

  const hasActiveNoteBefore = (index) => {
    let active = false;
    for (let idx = 0; idx < index; idx += 1) {
      const value = localSteps[idx];
      if (value === '-') {
        continue;
      }
      if (value === '.') {
        active = false;
        continue;
      }
      active = true;
    }
    return active;
  };

  const applyVisuals = () => {
    element.style.gridTemplateColumns = `repeat(${localSteps.length || 1}, 1fr)`;
    for (let idx = 0; idx < cells.length; idx += 1) {
      const cell = cells[idx];
      const step = localSteps[idx];
      cell.className = 'melody-step';
      cell.title = `Step ${idx + 1}`;
      cell.textContent = '';
      if (step === '-') {
        cell.classList.add('melody-step-hold');
      } else if (step && step !== '.') {
        cell.classList.add('melody-step-on');
        cell.textContent = step;
      }
    }
  };

  const propagate = () => {
    applyVisuals();
    if (typeof onChange === 'function') {
      onChange([...localSteps]);
    }
  };

  const setSteps = (nextSteps = []) => {
    localSteps = [...nextSteps];
    element.innerHTML = '';
    cells.length = 0;
    localSteps.forEach((_, index) => {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.detail > 1) {
          return;
        }
        const current = localSteps[index];
        const next = current && current !== '.' && current !== '-' ? '.' : '9';
        localSteps[index] = next;
        propagate();
      });
      cell.addEventListener('dblclick', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (!hasActiveNoteBefore(index)) {
          localSteps[index] = '.';
        } else {
          localSteps[index] = localSteps[index] === '-' ? '.' : '-';
        }
        propagate();
      });
      cell.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        localSteps[index] = '.';
        propagate();
      });
      cells.push(cell);
      element.appendChild(cell);
    });
    applyVisuals();
  };

  setSteps(localSteps);

  return {
    element,
    setSteps,
  };
}
