import { getNodeDefinition } from '../state/nodeRegistry.js';

function buildField({ label, type, value, onChange }) {
  const wrapper = document.createElement('label');
  wrapper.className = 'flow-field';
  const title = document.createElement('span');
  title.className = 'flow-field-label';
  title.textContent = label;
  const input = document.createElement('input');
  input.className = 'flow-field-input';
  input.type = type === 'number' ? 'number' : 'text';
  input.value = value ?? '';
  input.addEventListener('input', () => {
    const nextValue = type === 'number'
      ? Number(input.value)
      : input.value;
    onChange(nextValue);
  });
  wrapper.appendChild(title);
  wrapper.appendChild(input);
  return wrapper;
}

export function createFlowInspector({ store } = {}) {
  const panel = document.createElement('section');
  panel.className = 'flow-panel flow-inspector';

  const header = document.createElement('div');
  header.className = 'flow-panel-header';
  header.textContent = 'Inspector';
  panel.appendChild(header);

  const content = document.createElement('div');
  content.className = 'flow-inspector-content';
  panel.appendChild(content);

  const renderEmpty = () => {
    content.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'flow-inspector-empty';
    empty.textContent = 'Select a node or edge to inspect its properties.';
    content.appendChild(empty);
  };

  const renderNode = (node) => {
    content.innerHTML = '';
    const definition = getNodeDefinition(node.type);
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = definition?.label || node.type;
    content.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'flow-inspector-meta';
    meta.textContent = `ID: ${node.id}`;
    content.appendChild(meta);

    const schema = definition?.paramSchema || {};
    const params = node.params || {};
    const fields = Object.keys(schema);
    if (fields.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'flow-inspector-empty';
      empty.textContent = 'No configurable parameters for this node.';
      content.appendChild(empty);
    } else {
      const form = document.createElement('div');
      form.className = 'flow-inspector-form';
      fields.forEach((key) => {
        const field = buildField({
          label: key,
          type: schema[key]?.type || 'string',
          value: params[key],
          onChange: (value) => {
            store.updateNode(node.id, {
              params: {
                ...params,
                [key]: value,
              },
            });
          },
        });
        form.appendChild(field);
      });
      content.appendChild(form);
    }

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'flow-danger';
    deleteButton.textContent = 'Delete Node';
    deleteButton.addEventListener('click', () => {
      store.removeNode(node.id);
    });
    content.appendChild(deleteButton);
  };

  const renderEdge = (edge, nodeMap) => {
    content.innerHTML = '';
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = 'Edge';
    content.appendChild(title);
    const fromNode = nodeMap.get(edge.from.nodeId);
    const toNode = nodeMap.get(edge.to.nodeId);
    const details = document.createElement('div');
    details.className = 'flow-inspector-meta';
    details.textContent = `From ${fromNode?.type || edge.from.nodeId}:${edge.from.portId} → ${toNode?.type || edge.to.nodeId}:${edge.to.portId}`;
    content.appendChild(details);
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'flow-danger';
    deleteButton.textContent = 'Delete Edge';
    deleteButton.addEventListener('click', () => {
      store.removeEdge(edge.id);
    });
    content.appendChild(deleteButton);
  };

  const update = (state) => {
    const selection = state.selection || { nodes: [], edges: [] };
    if (selection.nodes.length > 0) {
      const node = state.nodes.find(item => item.id === selection.nodes[0]);
      if (node) {
        renderNode(node);
        return;
      }
    }
    if (selection.edges.length > 0) {
      const edge = state.edges.find(item => item.id === selection.edges[0]);
      if (edge) {
        const nodeMap = new Map(state.nodes.map(node => [node.id, node]));
        renderEdge(edge, nodeMap);
        return;
      }
    }
    renderEmpty();
  };

  update(store.getState());
  const unsubscribe = store.subscribe(update);

  return {
    element: panel,
    destroy: () => unsubscribe(),
  };
}
