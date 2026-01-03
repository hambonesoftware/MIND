export function createToastManager({ parent = document.body } = {}) {
  const container = document.createElement('div');
  container.className = 'toast-container';
  parent.appendChild(container);

  const showToast = (message, { tone = 'error', duration = 2600 } = {}) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${tone}`;
    toast.textContent = message;
    container.appendChild(toast);

    const removeToast = () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    };

    const timeout = setTimeout(removeToast, duration);
    toast.addEventListener('click', () => {
      clearTimeout(timeout);
      removeToast();
    });
  };

  return { element: container, showToast };
}
