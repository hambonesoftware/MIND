import { buildCheckbox, buildField, buildSelect } from '../components/fields.js';

export function renderSwitchEditor({ node, state, store }) {
  const params = node.params || {};
  const branches = Array.isArray(params.branches) ? params.branches : [];
  const defaultBranch = params.defaultBranch || 'default';
  const updateParams = (next) => {
    store.updateNode(node.id, {
      params: {
        ...params,
        ...next,
      },
    });
  };

  const form = document.createElement('div');
  form.className = 'flow-inspector-form';
  form.appendChild(buildField({
    label: 'label',
    type: 'string',
    value: params.label,
    onChange: value => updateParams({ label: value }),
  }));
  form.appendChild(buildSelect({
    label: 'mode',
    value: params.mode || 'first',
    options: [
      { value: 'first', label: 'First match' },
      { value: 'all', label: 'All matches' },
    ],
    onChange: value => updateParams({ mode: value }),
  }));
  form.appendChild(buildField({
    label: 'manualSelection',
    type: 'string',
    value: params.manualSelection || '',
    onChange: value => updateParams({ manualSelection: value }),
  }));
  const branchOptions = [
    { value: 'default', label: 'Default' },
    ...branches.map(branch => ({
      value: branch.id,
      label: branch.label || branch.id,
    })),
  ];
  form.appendChild(buildSelect({
    label: 'defaultBranch',
    value: defaultBranch,
    options: branchOptions,
    onChange: value => updateParams({ defaultBranch: value }),
  }));

  const table = document.createElement('div');
  table.className = 'flow-branch-table';
  branches.forEach((branch, index) => {
    const row = document.createElement('div');
    row.className = 'flow-branch-row';
    const focusKeyFor = suffix => `${node.id}-branch-${branch.id || index}-${suffix}`;
    const rowHeader = document.createElement('div');
    rowHeader.className = 'flow-branch-header';
    rowHeader.textContent = branch.id;
    row.appendChild(rowHeader);

    const labelField = buildField({
      label: 'label',
      type: 'string',
      value: branch.label || '',
      focusKey: focusKeyFor('label'),
      onChange: (value) => {
        const nextBranches = branches.map((item, idx) => (
          idx === index ? { ...item, label: value } : item
        ));
        updateParams({ branches: nextBranches });
      },
    });
    row.appendChild(labelField);

    const condition = branch.condition || { type: 'always', value: true };
    row.appendChild(buildSelect({
      label: 'condition',
      value: condition.type || 'always',
      options: [
        { value: 'always', label: 'Always' },
        { value: 'counter', label: 'Counter' },
        { value: 'barIndex', label: 'Bar Index' },
        { value: 'manual', label: 'Manual' },
        { value: 'random', label: 'Random' },
      ],
      onChange: (value) => {
        const nextBranches = branches.map((item, idx) => (
          idx === index
            ? { ...item, condition: { type: value, value: condition.value ?? 0 } }
            : item
        ));
        updateParams({ branches: nextBranches });
      },
    }));

    if (condition.type === 'counter') {
      row.appendChild(buildField({
        label: 'counterId',
        type: 'string',
        value: condition.counterId || '',
        focusKey: focusKeyFor('counterId'),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, counterId: value } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
      row.appendChild(buildSelect({
        label: 'operator',
        value: condition.op || '>=',
        options: ['==', '!=', '>=', '<=', '>', '<'].map(op => ({ value: op, label: op })),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, op: value } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
      row.appendChild(buildField({
        label: 'value',
        type: 'number',
        value: condition.value ?? 0,
        focusKey: focusKeyFor('counter-value'),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, value } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
    } else if (condition.type === 'barIndex') {
      row.appendChild(buildSelect({
        label: 'operator',
        value: condition.op || '>=',
        options: ['==', '!=', '>=', '<=', '>', '<'].map(op => ({ value: op, label: op })),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, op: value } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
      row.appendChild(buildField({
        label: 'value',
        type: 'number',
        value: condition.value ?? 0,
        focusKey: focusKeyFor('bar-index'),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, value } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
    } else if (condition.type === 'manual') {
      row.appendChild(buildField({
        label: 'value',
        type: 'string',
        value: condition.value || '',
        focusKey: focusKeyFor('manual-value'),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, value } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
    } else if (condition.type === 'random') {
      row.appendChild(buildField({
        label: 'threshold',
        type: 'number',
        value: condition.threshold ?? 0.5,
        focusKey: focusKeyFor('threshold'),
        onChange: (value) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, threshold: value } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
    } else if (condition.type === 'always') {
      row.appendChild(buildCheckbox({
        label: 'value',
        checked: condition.value !== false,
        onChange: (checked) => {
          const nextBranches = branches.map((item, idx) => (
            idx === index
              ? { ...item, condition: { ...condition, value: checked } }
              : item
          ));
          updateParams({ branches: nextBranches });
        },
      }));
    }

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'flow-branch-remove';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
      const nextBranches = branches.filter((_, idx) => idx !== index);
      const nextDefault = nextBranches.some(b => b.id === defaultBranch) ? defaultBranch : 'default';
      updateParams({ branches: nextBranches, defaultBranch: nextDefault });
    });
    row.appendChild(removeButton);

    table.appendChild(row);
  });

  const addButton = document.createElement('button');
  addButton.type = 'button';
  addButton.className = 'flow-branch-add';
  addButton.textContent = 'Add branch';
  addButton.addEventListener('click', () => {
    const index = branches.length + 1;
    const nextBranch = {
      id: `branch-${index}`,
      label: `Branch ${index}`,
      condition: { type: 'always', value: true },
    };
    updateParams({ branches: [...branches, nextBranch] });
  });

  const layout = document.createElement('div');
  layout.className = 'flow-inspector-stack';
  layout.appendChild(form);
  layout.appendChild(table);
  layout.appendChild(addButton);
  return layout;
}

export function renderCounterEditor({ node, store }) {
  const params = node.params || {};
  const updateParams = (next) => {
    store.updateNode(node.id, {
      params: {
        ...params,
        ...next,
      },
    });
  };
  const form = document.createElement('div');
  form.className = 'flow-inspector-form';
  form.appendChild(buildField({
    label: 'label',
    type: 'string',
    value: params.label,
    onChange: value => updateParams({ label: value }),
  }));
  form.appendChild(buildField({
    label: 'start',
    type: 'number',
    value: params.start ?? 0,
    onChange: value => updateParams({ start: value }),
  }));
  form.appendChild(buildField({
    label: 'step',
    type: 'number',
    value: params.step ?? 1,
    onChange: value => updateParams({ step: value }),
  }));
  form.appendChild(buildCheckbox({
    label: 'reset on play',
    checked: params.resetOnPlay !== false,
    onChange: checked => updateParams({ resetOnPlay: checked }),
  }));
  return form;
}

export function renderJoinEditor({ node, state, store }) {
  const params = node.params || {};
  const updateParams = (next) => {
    store.updateNode(node.id, {
      params: {
        ...params,
        ...next,
      },
    });
  };
  const incoming = (state.edges || []).filter(edge => edge.to?.nodeId === node.id);
  const form = document.createElement('div');
  form.className = 'flow-inspector-form';
  form.appendChild(buildField({
    label: 'label',
    type: 'string',
    value: params.label,
    onChange: value => updateParams({ label: value }),
  }));
  form.appendChild(buildSelect({
    label: 'quantize',
    value: params.quantize || 'next-bar',
    options: [
      { value: 'next-bar', label: 'Next bar' },
      { value: 'immediate', label: 'Immediate' },
    ],
    onChange: value => updateParams({ quantize: value }),
  }));
  const summary = document.createElement('div');
  summary.className = 'flow-inspector-meta';
  summary.textContent = `Incoming connections: ${incoming.length}`;
  form.appendChild(summary);
  return form;
}
