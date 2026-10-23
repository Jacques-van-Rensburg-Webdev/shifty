// Small DOM helper: el('button', { class: 'button', text: 'Save', onClick }, children).
// Props: class, text, on<Event> listeners; anything else becomes an attribute.
// null, undefined and false props or children are skipped; true sets an empty attribute.

export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (name === 'class') node.className = value;
    else if (name === 'text') node.textContent = value;
    else if (name.startsWith('on')) node.addEventListener(name.slice(2).toLowerCase(), value);
    else node.setAttribute(name, value === true ? '' : value);
  }
  node.append(...[children].flat().filter((child) => child != null && child !== false));
  return node;
}

// Clears the container and renders it again, keeping focus on the control
// (marked with data-focus-key) that was used.
export function redraw(container, render) {
  const focusKey = document.activeElement?.dataset?.focusKey;
  container.replaceChildren();
  render(container);
  if (focusKey) container.querySelector(`[data-focus-key="${focusKey}"]`)?.focus();
}
