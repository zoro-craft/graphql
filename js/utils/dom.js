/**
 * Build an HTML element.
 *
 * @param {string} tag - element name, e.g. "div".
 * @param {object} [options]
 * @param {string} [options.className]  - CSS class(es) to apply.
 * @param {string} [options.text]       - text content.
 * @param {object} [options.attributes] - attribute name/value map.
 * @param {Node[]} [options.children]   - child nodes to append.
 * @param {object} [options.events]     - event name -> handler map.
 * @returns {Element}
 */
export function createElement(tag, options = {}) {
  const element = document.createElement(tag);

  if (options.className) {
    element.className = options.className;
  }
  if (options.text !== undefined) {
    element.textContent = options.text;
  }
  for (const [name, value] of Object.entries(options.attributes || {})) {
    element.setAttribute(name, value);
  }
  for (const child of options.children || []) {
    element.append(child);
  }
  for (const [name, handler] of Object.entries(options.events || {})) {
    element.addEventListener(name, handler);
  }
  return element;
}

// Replace a container's content with a simple placeholder message.
export function showEmptyState(container, message) {
  container.textContent = '';
  container.append(createElement('p', { className: 'state-message', text: message }));
}