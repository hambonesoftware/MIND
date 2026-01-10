import { getNodeDefinition } from '../../state/nodeRegistry.js';
import { insertMoonlightTrebleTemplate } from '../../templates/moonlightTreble.js';
import { focusScope } from './components/focusScope.js';
import { buildField } from './components/fields.js';
import { renderJoinEditor, renderCounterEditor, renderSwitchEditor } from './panels/nodeEditors.js';
import { renderThoughtSummary } from './panels/thoughtSummaryPanel.js';

export function createFlowInspector({ store, onEditThought } = {}) {
  const panel = document.createElement('section');
  panel.className = 'flow-panel flow-inspector';

  const header = document.createElement('div');
  header.className = 'flow-panel-header';
  header.textContent = 'Inspector';
  panel.appendChild(header);

  const content = document.createElement('div');
  content.className = 'flow-inspector-content';
  panel.appendChild(content);

  const captureFocusState = () => {
    const active = document.activeElement;
    if (!active || !content.contains(active)) {
      return null;
    }
    const key = active.dataset?.focusKey || null;
    const selectionStart = typeof active.selectionStart === 'number' ? active.selectionStart : null;
    const selectionEnd = typeof active.selectionEnd === 'number' ? active.selectionEnd : null;
    return { key, selectionStart, selectionEnd };
  };

  const restoreFocusState = (state) => {
    if (!state || !state.key) {
      return;
    }
    const targets = Array.from(content.querySelectorAll('[data-focus-key]'));
    const match = targets.find(el => el.dataset.focusKey === state.key);
    if (!match) {
      return;
    }
    match.focus({ preventScroll: true });
    if (typeof match.setSelectionRange === 'function' && state.selectionStart !== null && state.selectionEnd !== null) {
      const length = typeof match.value === 'string' ? match.value.length : 0;
      const start = Math.min(state.selectionStart, length);
      const end = Math.min(state.selectionEnd, length);
      try {
        match.setSelectionRange(start, end);
      } catch (error) {
        // ignore selection errors
      }
    }
  };

  const renderEmpty = () => {
    focusScope.set('empty');
    content.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'flow-inspector-empty';
    empty.textContent = 'Select a node or edge to inspect its properties.';
    content.appendChild(empty);

    const templates = document.createElement('div');
    templates.className = 'flow-inspector-templates';
    const title = document.createElement('div');
    title.className = 'flow-inspector-title';
    title.textContent = 'Templates';
    templates.appendChild(title);

    const templateButton = document.createElement('button');
    templateButton.type = 'button';
    templateButton.className = 'flow-branch-add';
    templateButton.textContent = 'Insert Moonlight Treble (Bars 1–16)';
    templateButton.addEventListener('click', () => {
      insertMoonlightTrebleTemplate(store);
    });
    templates.appendChild(templateButton);
    content.appendChild(templates);
  };

  const renderNode = (node, state) => {
    focusScope.set(node?.id || 'node');
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

    if (node.type === 'switch') {
      content.appendChild(renderSwitchEditor({ node, state, store }));
    } else if (node.type === 'counter') {
      content.appendChild(renderCounterEditor({ node, store }));
    } else if (node.type === 'join') {
      content.appendChild(renderJoinEditor({ node, state, store }));
    } else if (node.type === 'thought') {
      content.appendChild(renderThoughtSummary({ node, onEditThought }));
    } else {
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
    focusScope.set(edge?.id || 'edge');
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
    const previousFocus = captureFocusState();
    let rendered = false;
    const selection = state.selection || { nodes: [], edges: [] };
    if (selection.nodes.length > 0) {
      const node = state.nodes.find(item => item.id === selection.nodes[0]);
      if (node) {
        renderNode(node, state);
        rendered = true;
      }
    }
    if (selection.edges.length > 0) {
      const edge = state.edges.find(item => item.id === selection.edges[0]);
      if (edge) {
        const nodeMap = new Map(state.nodes.map(node => [node.id, node]));
        renderEdge(edge, nodeMap);
        rendered = true;
      }
    }
    if (!rendered) {
      renderEmpty();
    }
    restoreFocusState(previousFocus);
  };

  update(store.getState());
  const unsubscribe = store.subscribe(update);

  return {
    element: panel,
    destroy: () => unsubscribe(),
  };
}
