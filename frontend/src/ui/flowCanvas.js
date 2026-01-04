import { getNodeDefinition, validateConnection } from '../state/nodeRegistry.js';

const EDGE_COLOR = '#3a6ea5';
const EDGE_COLOR_MUTED = '#c7d7ea';

function buildPortLabel(port) {
  if (!port) {
    return '';
  }
  return port.label || port.id;
}

export function createFlowCanvas({ store, toast } = {}) {
  const container = document.createElement('div');
  container.className = 'flow-canvas';

  const zoomControls = document.createElement('div');
  zoomControls.className = 'flow-zoom-controls';

  const zoomOutButton = document.createElement('button');
  zoomOutButton.type = 'button';
  zoomOutButton.className = 'flow-zoom-button';
  zoomOutButton.textContent = '−';
  zoomOutButton.setAttribute('aria-label', 'Zoom out');

  const zoomInButton = document.createElement('button');
  zoomInButton.type = 'button';
  zoomInButton.className = 'flow-zoom-button';
  zoomInButton.textContent = '+';
  zoomInButton.setAttribute('aria-label', 'Zoom in');

  zoomControls.appendChild(zoomInButton);
  zoomControls.appendChild(zoomOutButton);
  container.appendChild(zoomControls);

  const viewportLayer = document.createElement('div');
  viewportLayer.className = 'flow-viewport';

  const edgeSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  edgeSvg.classList.add('flow-edges');
  edgeSvg.setAttribute('viewBox', '0 0 1 1');
  const edgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  edgeGroup.classList.add('flow-edges-group');
  edgeSvg.appendChild(edgeGroup);

  const tempEdge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  tempEdge.classList.add('flow-edge', 'flow-edge-temp');
  tempEdge.setAttribute('stroke', EDGE_COLOR_MUTED);
  tempEdge.setAttribute('fill', 'none');
  tempEdge.setAttribute('stroke-width', '2');
  edgeGroup.appendChild(tempEdge);

  const nodeLayer = document.createElement('div');
  nodeLayer.className = 'flow-nodes';

  viewportLayer.appendChild(edgeSvg);
  viewportLayer.appendChild(nodeLayer);
  container.appendChild(viewportLayer);

  const inlineError = document.createElement('div');
  inlineError.className = 'flow-inline-error';
  inlineError.hidden = true;
  container.appendChild(inlineError);

  const nodeElements = new Map();
  const edgeElements = new Map();
  let currentState = store.getState();
  let connection = null;
  let isPanning = false;
  let panStart = null;
  const ZOOM_MIN = 0.4;
  const ZOOM_MAX = 2;

  const setInlineError = (message) => {
    if (message) {
      inlineError.textContent = message;
      inlineError.hidden = false;
    } else {
      inlineError.hidden = true;
    }
  };

  const getViewportTransform = () => {
    const { x, y, zoom } = currentState.viewport;
    return { x, y, zoom };
  };

  const getPortCenterInGraph = (portEl) => {
    const portRect = portEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const { x, y, zoom } = getViewportTransform();
    const screenX = portRect.left + portRect.width / 2 - containerRect.left;
    const screenY = portRect.top + portRect.height / 2 - containerRect.top;
    return {
      x: (screenX - x) / zoom,
      y: (screenY - y) / zoom,
    };
  };

  const updateViewportTransform = () => {
    const { x, y, zoom } = getViewportTransform();
    nodeLayer.style.transform = `translate(${x}px, ${y}px) scale(${zoom})`;
    edgeGroup.setAttribute('transform', `translate(${x} ${y}) scale(${zoom})`);
  };

  const zoomAtCenter = (nextZoom) => {
    const { zoom, x, y } = getViewportTransform();
    const clampedZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, nextZoom));
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const worldX = (centerX - x) / zoom;
    const worldY = (centerY - y) / zoom;
    const nextX = centerX - worldX * clampedZoom;
    const nextY = centerY - worldY * clampedZoom;
    store.setViewport({ x: nextX, y: nextY, zoom: clampedZoom });
  };

  const handleZoomClick = (direction) => {
    const { zoom } = getViewportTransform();
    const delta = direction === 'in' ? 1.1 : 0.9;
    zoomAtCenter(zoom * delta);
  };

  const drawCurve = (from, to) => {
    const dx = Math.max(60, Math.abs(to.x - from.x));
    const c1 = { x: from.x + dx * 0.45, y: from.y };
    const c2 = { x: to.x - dx * 0.45, y: to.y };
    return `M ${from.x} ${from.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${to.x} ${to.y}`;
  };

  const clearConnection = () => {
    if (connection?.fromPortEl) {
      connection.fromPortEl.classList.remove('flow-port-connecting');
    }
    tempEdge.setAttribute('d', '');
    connection = null;
    setInlineError(null);
  };

  const addEdgePath = (edge) => {
    let entry = edgeElements.get(edge.id);
    if (!entry) {
      const hit = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      hit.classList.add('flow-edge-hit');
      hit.setAttribute('fill', 'none');
      hit.setAttribute('stroke-width', '10');
      hit.dataset.edgeId = edge.id;
      hit.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        store.setSelection({ nodes: [], edges: [edge.id] });
      });
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.classList.add('flow-edge');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-width', '2');
      path.dataset.edgeId = edge.id;
      path.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
        store.setSelection({ nodes: [], edges: [edge.id] });
      });
      edgeElements.set(edge.id, { path, hit });
      edgeGroup.appendChild(hit);
      edgeGroup.appendChild(path);
    }
    const { path, hit } = edgeElements.get(edge.id);
    path.setAttribute('stroke', EDGE_COLOR);
    if (currentState.selection.edges.includes(edge.id)) {
      path.classList.add('flow-edge-selected');
    } else {
      path.classList.remove('flow-edge-selected');
    }
    return { path, hit };
  };

  const renderEdges = () => {
    const edges = currentState.edges || [];
    const activeEdgeIds = new Set(
      (currentState.runtime?.state?.activeTokens || [])
        .map(token => token.viaEdgeId)
        .filter(Boolean),
    );
    const portLookup = new Map();
    for (const nodeEl of nodeLayer.querySelectorAll('[data-port-id]')) {
      const key = `${nodeEl.dataset.nodeId}:${nodeEl.dataset.portId}:${nodeEl.dataset.portDirection}`;
      portLookup.set(key, nodeEl);
    }

    const seen = new Set();
    for (const edge of edges) {
      const sourceKey = `${edge.from.nodeId}:${edge.from.portId}:output`;
      const targetKey = `${edge.to.nodeId}:${edge.to.portId}:input`;
      const sourceEl = portLookup.get(sourceKey);
      const targetEl = portLookup.get(targetKey);
      if (!sourceEl || !targetEl) {
        continue;
      }
      const source = getPortCenterInGraph(sourceEl);
      const target = getPortCenterInGraph(targetEl);
      const { path, hit } = addEdgePath(edge);
      const d = drawCurve(source, target);
      path.setAttribute('d', d);
      hit.setAttribute('d', d);
      if (activeEdgeIds.has(edge.id)) {
        path.classList.add('flow-edge-active');
      } else {
        path.classList.remove('flow-edge-active');
      }
      seen.add(edge.id);
    }
    for (const [edgeId, path] of edgeElements.entries()) {
      if (!seen.has(edgeId)) {
        path.hit.remove();
        path.path.remove();
        edgeElements.delete(edgeId);
      }
    }
  };

  const renderNodes = () => {
    const nodes = currentState.nodes || [];
    const seen = new Set();
    const runtimeState = currentState.runtime?.state || {};
    const debugTrace = currentState.runtime?.debugTrace || [];
    const activeNodeIds = new Set();
    debugTrace.forEach((line) => {
      const match = /^(Start|Thought|Counter|Switch|Join)\\s+([^:]+)/.exec(line);
      if (match) {
        activeNodeIds.add(match[2]);
      }
    });

    const buildPort = (node, port, direction) => {
      const portEl = document.createElement('div');
      portEl.className = `flow-port flow-port-${direction}`;
      portEl.dataset.nodeId = node.id;
      portEl.dataset.portId = port.id;
      portEl.dataset.portDirection = direction;
      const dot = document.createElement('span');
      dot.className = 'flow-port-dot';
      const label = document.createElement('span');
      label.className = 'flow-port-label';
      label.textContent = buildPortLabel(port);
      if (direction === 'input') {
        portEl.appendChild(dot);
        portEl.appendChild(label);
      } else {
        portEl.appendChild(label);
        portEl.appendChild(dot);
      }

      if (direction === 'output') {
        portEl.addEventListener('pointerdown', (event) => {
          event.stopPropagation();
          connection = {
            fromNodeId: node.id,
            fromPortId: port.id,
            fromType: node.type,
            fromPortEl: portEl,
          };
          portEl.classList.add('flow-port-connecting');
          tempEdge.setAttribute('d', '');
        });
      } else {
        portEl.addEventListener('pointerenter', () => {
          if (!connection) {
            return;
          }
          const result = validateConnection({
            fromType: connection.fromType,
            fromPortId: connection.fromPortId,
            toType: node.type,
            toPortId: port.id,
          });
          if (result.ok) {
            portEl.classList.add('flow-port-valid');
            portEl.classList.remove('flow-port-invalid');
            setInlineError(null);
          } else {
            portEl.classList.add('flow-port-invalid');
            portEl.classList.remove('flow-port-valid');
            setInlineError(result.reason);
          }
        });
        portEl.addEventListener('pointerleave', () => {
          portEl.classList.remove('flow-port-valid', 'flow-port-invalid');
          setInlineError(null);
        });
        portEl.addEventListener('pointerup', (event) => {
          if (!connection) {
            return;
          }
          event.stopPropagation();
          const result = validateConnection({
            fromType: connection.fromType,
            fromPortId: connection.fromPortId,
            toType: node.type,
            toPortId: port.id,
          });
          if (!result.ok) {
            if (toast?.showToast) {
              toast.showToast(result.reason, { tone: 'error' });
            }
            clearConnection();
            return;
          }
          try {
            store.addEdge({
              from: { nodeId: connection.fromNodeId, portId: connection.fromPortId },
              to: { nodeId: node.id, portId: port.id },
            });
          } catch (error) {
            if (toast?.showToast) {
              toast.showToast(error.message, { tone: 'error' });
            }
          }
          clearConnection();
        });
      }
      return portEl;
    };

    for (const node of nodes) {
      let nodeEl = nodeElements.get(node.id);
      if (!nodeEl) {
        const definition = getNodeDefinition(node.type);
        nodeEl = document.createElement('div');
        nodeEl.className = 'flow-node';
        nodeEl.dataset.nodeId = node.id;

        const header = document.createElement('div');
        header.className = 'flow-node-header';
        const title = document.createElement('span');
        title.className = 'flow-node-title';
        const icon = {
          start: '▶',
          counter: '#',
          switch: '⇄',
          join: '⨂',
        }[node.type];
        const labelText = node.params?.label || definition?.label || node.type;
        title.textContent = icon ? `${icon} ${labelText}` : labelText;
        const badges = document.createElement('div');
        badges.className = 'flow-node-badges';
        header.appendChild(title);
        header.appendChild(badges);
        header.addEventListener('pointerdown', (event) => {
          if (event.button !== 0) {
            return;
          }
          event.stopPropagation();
          const startX = event.clientX;
          const startY = event.clientY;
          const origin = { ...node.ui };
          const { zoom } = getViewportTransform();
          const onMove = (moveEvent) => {
            const dx = (moveEvent.clientX - startX) / zoom;
            const dy = (moveEvent.clientY - startY) / zoom;
            store.updateNode(node.id, {
              ui: {
                ...origin,
                x: origin.x + dx,
                y: origin.y + dy,
              },
            });
          };
          const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
          };
          window.addEventListener('pointermove', onMove);
          window.addEventListener('pointerup', onUp);
        });
        header.addEventListener('dblclick', (event) => {
          event.stopPropagation();
          store.updateNode(node.id, {
            ui: { ...node.ui, collapsed: !node.ui?.collapsed },
          });
        });

        const body = document.createElement('div');
        body.className = 'flow-node-body';

        const inputs = document.createElement('div');
        inputs.className = 'flow-node-ports flow-node-inputs';
        const outputs = document.createElement('div');
        outputs.className = 'flow-node-ports flow-node-outputs';

        const inputPorts = node.ports?.inputs || [];
        const outputPorts = node.ports?.outputs || [];
        inputPorts.forEach(port => inputs.appendChild(buildPort(node, port, 'input')));
        outputPorts.forEach(port => outputs.appendChild(buildPort(node, port, 'output')));

        body.appendChild(inputs);
        body.appendChild(outputs);
        nodeEl.appendChild(header);
        nodeEl.appendChild(body);
        nodeEl.addEventListener('pointerdown', (event) => {
          event.stopPropagation();
          store.setSelection({ nodes: [node.id], edges: [] });
        });
        nodeElements.set(node.id, nodeEl);
        nodeLayer.appendChild(nodeEl);
      } else {
        const header = nodeEl.querySelector('.flow-node-header');
        if (header) {
          const definition = getNodeDefinition(node.type);
          const title = header.querySelector('.flow-node-title');
          if (title) {
            const icon = {
              start: '▶',
              counter: '#',
              switch: '⇄',
              join: '⨂',
            }[node.type];
            const labelText = node.params?.label || definition?.label || node.type;
            title.textContent = icon ? `${icon} ${labelText}` : labelText;
          }
        }
      }
      const body = nodeEl.querySelector('.flow-node-body');
      const inputs = nodeEl.querySelector('.flow-node-inputs');
      const outputs = nodeEl.querySelector('.flow-node-outputs');
      if (inputs && outputs) {
        inputs.innerHTML = '';
        outputs.innerHTML = '';
        const inputPorts = node.ports?.inputs || [];
        const outputPorts = node.ports?.outputs || [];
        inputPorts.forEach(port => inputs.appendChild(buildPort(node, port, 'input')));
        outputPorts.forEach(port => outputs.appendChild(buildPort(node, port, 'output')));
      }

      const header = nodeEl.querySelector('.flow-node-header');
      const badgeContainer = header?.querySelector('.flow-node-badges');
      if (badgeContainer) {
        badgeContainer.innerHTML = '';
        if (node.type === 'thought') {
          const preset = node.params?.instrumentPreset || 'preset';
          const rhythm = node.params?.rhythmGrid || '1/12';
          const pattern = node.params?.patternType || 'arp';
          const presetBadge = document.createElement('span');
          presetBadge.className = 'flow-node-badge';
          presetBadge.textContent = preset;
          const rhythmBadge = document.createElement('span');
          rhythmBadge.className = 'flow-node-badge';
          rhythmBadge.textContent = `${pattern} • ${rhythm}`;
          badgeContainer.appendChild(presetBadge);
          badgeContainer.appendChild(rhythmBadge);
        }
        if (node.type === 'counter') {
          const value = runtimeState.counters?.[node.id];
          if (value !== undefined) {
            const badge = document.createElement('span');
            badge.className = 'flow-node-badge flow-node-badge-accent';
            badge.textContent = `Value ${value}`;
            badgeContainer.appendChild(badge);
          }
        }
        if (node.type === 'join') {
          const arrived = runtimeState.joins?.[node.id];
          const total = node.ports?.inputs?.length || 0;
          if (Array.isArray(arrived) && total > 0) {
            const badge = document.createElement('span');
            badge.className = 'flow-node-badge flow-node-badge-warn';
            badge.textContent = `Waiting ${arrived.length}/${total}`;
            badgeContainer.appendChild(badge);
          }
        }
      }

      if (node.type === 'switch') {
        const lastRoute = runtimeState.lastSwitchRoutes?.[node.id];
        if (lastRoute) {
          const portEls = nodeEl.querySelectorAll('.flow-port-output');
          portEls.forEach((portEl) => {
            if (portEl.dataset.portId === lastRoute) {
              portEl.classList.add('flow-port-active');
            } else {
              portEl.classList.remove('flow-port-active');
            }
          });
        } else {
          const portEls = nodeEl.querySelectorAll('.flow-port-output');
          portEls.forEach(portEl => portEl.classList.remove('flow-port-active'));
        }
      }
      nodeEl.style.left = `${node.ui?.x || 0}px`;
      nodeEl.style.top = `${node.ui?.y || 0}px`;
      if (currentState.selection.nodes.includes(node.id)) {
        nodeEl.classList.add('flow-node-selected');
      } else {
        nodeEl.classList.remove('flow-node-selected');
      }
      if (activeNodeIds.has(node.id)) {
        nodeEl.classList.add('flow-node-active');
      } else {
        nodeEl.classList.remove('flow-node-active');
      }
      if (node.ui?.collapsed) {
        nodeEl.classList.add('flow-node-collapsed');
      } else {
        nodeEl.classList.remove('flow-node-collapsed');
      }
      seen.add(node.id);
    }

    for (const [nodeId, nodeEl] of nodeElements.entries()) {
      if (!seen.has(nodeId)) {
        nodeEl.remove();
        nodeElements.delete(nodeId);
      }
    }
  };

  const render = () => {
    updateViewportTransform();
    renderNodes();
    requestAnimationFrame(renderEdges);
  };

  const handlePointerMove = (event) => {
    if (connection) {
      const startEl = connection.fromPortEl;
      if (startEl) {
        const from = getPortCenterInGraph(startEl);
        const { x, y, zoom } = getViewportTransform();
        const rect = container.getBoundingClientRect();
        const screenX = event.clientX - rect.left;
        const screenY = event.clientY - rect.top;
        const to = {
          x: (screenX - x) / zoom,
          y: (screenY - y) / zoom,
        };
        tempEdge.setAttribute('d', drawCurve(from, to));
      }
    }
    if (isPanning && panStart) {
      const dx = event.clientX - panStart.x;
      const dy = event.clientY - panStart.y;
      store.setViewport({
        x: panStart.viewport.x + dx,
        y: panStart.viewport.y + dy,
      });
    }
  };

  const handlePointerUp = () => {
    if (connection) {
      clearConnection();
    }
    isPanning = false;
    panStart = null;
  };

  container.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) {
      return;
    }
    if (event.target.closest('.flow-node') || event.target.closest('.flow-port')) {
      return;
    }
    const { x, y } = getViewportTransform();
    isPanning = true;
    panStart = {
      x: event.clientX,
      y: event.clientY,
      viewport: { x, y },
    };
    store.setSelection({ nodes: [], edges: [] });
  });

  const stopZoomPropagation = (event) => {
    event.stopPropagation();
  };

  zoomInButton.addEventListener('pointerdown', stopZoomPropagation);
  zoomOutButton.addEventListener('pointerdown', stopZoomPropagation);
  zoomInButton.addEventListener('click', () => handleZoomClick('in'));
  zoomOutButton.addEventListener('click', () => handleZoomClick('out'));

  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', handlePointerUp);

  const keyHandler = (event) => {
    if (event.key !== 'Delete' && event.key !== 'Backspace') {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'd') {
        const selection = currentState.selection;
        const nodeId = selection.nodes[0];
        const node = currentState.nodes.find(item => item.id === nodeId);
        if (node) {
          store.addNode(node.type, {
            params: { ...node.params },
            ui: {
              ...(node.ui || { x: 0, y: 0 }),
              x: (node.ui?.x || 0) + 24,
              y: (node.ui?.y || 0) + 24,
              collapsed: node.ui?.collapsed,
            },
          });
        }
      }
      return;
    }
    const selection = currentState.selection;
    selection.nodes.forEach(nodeId => store.removeNode(nodeId));
    selection.edges.forEach(edgeId => store.removeEdge(edgeId));
  };
  window.addEventListener('keydown', keyHandler);

  const unsubscribe = store.subscribe((nextState) => {
    currentState = nextState;
    render();
  });

  render();

  const getViewportCenter = () => {
    const { x, y, zoom } = getViewportTransform();
    const rect = container.getBoundingClientRect();
    return {
      x: (rect.width / 2 - x) / zoom,
      y: (rect.height / 2 - y) / zoom,
    };
  };

  const destroy = () => {
    unsubscribe();
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
    window.removeEventListener('keydown', keyHandler);
  };

  return {
    element: container,
    getViewportCenter,
    destroy,
  };
}
