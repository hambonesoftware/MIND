import { listNodeTypes, getNodeDefinition } from '../state/nodeRegistry.js';

function groupByCategory(types) {
  return types.reduce((acc, type) => {
    const definition = getNodeDefinition(type);
    const category = definition?.category || 'Misc';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ type, definition });
    return acc;
  }, {});
}

export function createFlowPalette({ store, onAddNode, onClearWorkspace } = {}) {
  const panel = document.createElement('section');
  panel.className = 'flow-panel flow-palette';

  const header = document.createElement('div');
  header.className = 'flow-panel-header';
  header.textContent = 'Node Palette';

  const actions = document.createElement('div');
  actions.className = 'flow-panel-actions';
  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'flow-panel-action';
  clearButton.textContent = 'Clear Workspace';
  clearButton.title = 'Remove all nodes and edges from the stream workspace.';
  clearButton.addEventListener('click', () => {
    const confirmClear = window.confirm('Clear all nodes and edges from this workspace?');
    if (!confirmClear) {
      return;
    }
    if (typeof onClearWorkspace === 'function') {
      onClearWorkspace();
    } else if (store?.clear) {
      store.clear();
    }
  });
  actions.appendChild(clearButton);
  header.appendChild(actions);
  panel.appendChild(header);

  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search nodes...';
  search.className = 'flow-search';
  panel.appendChild(search);

  const list = document.createElement('div');
  list.className = 'flow-palette-list';
  panel.appendChild(list);

  const renderList = () => {
    const query = search.value.trim().toLowerCase();
    list.innerHTML = '';
    const types = listNodeTypes();
    const grouped = groupByCategory(types);
    const order = {
      'Musical Thoughts': 0,
      'Logic Thoughts': 1,
    };
    Object.keys(grouped)
      .sort((a, b) => (order[a] ?? 99) - (order[b] ?? 99) || a.localeCompare(b))
      .forEach((category) => {
        const section = document.createElement('div');
        section.className = 'flow-palette-section';
        const title = document.createElement('div');
        title.className = 'flow-palette-title';
        title.textContent = category;
        section.appendChild(title);
        const items = grouped[category]
          .filter(({ type, definition }) => {
            const label = definition?.label || type;
            if (!query) {
              return true;
            }
            return type.toLowerCase().includes(query) || label.toLowerCase().includes(query);
          })
          .sort((a, b) => a.type.localeCompare(b.type));
        for (const { type, definition } of items) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'flow-palette-item';
          button.textContent = definition?.label || type;
          button.addEventListener('click', () => {
            if (typeof onAddNode === 'function') {
              onAddNode(type);
            } else if (store) {
              store.addNode(type);
            }
          });
          section.appendChild(button);
        }
        list.appendChild(section);
      });
  };

  search.addEventListener('input', renderList);
  renderList();

  return { element: panel, refresh: renderList };
}
