// Solid, flat icons from the design reference (24 × 24, currentColor).

const PATHS = {
  prev: '<path d="M15.5 5v14L8 12z"/>',
  next: '<path d="M8.5 5v14L16 12z"/>',
  edit: '<path d="M6.6 14.4 14.4 6.6l3 3-7.8 7.8z"/><path d="M15.6 5.4 17 4l3 3-1.4 1.4z"/><path d="M5.9 15.3l2.8 2.8L4 20z"/>',
  delete: '<path d="M9 3h6v2H9z"/><path d="M4 5.5h16v2H4z"/><path d="M6 9h12l-1.2 12H7.2zM9.8 11v8h1.4v-8zM12.8 11v8h1.4v-8z"/>',
  clock: '<path d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zm0 2.5a7.5 7.5 0 1 1 0 15a7.5 7.5 0 1 1 0-15z"/><path d="M11 6.5h2v5.1l3.2 2.3-1.2 1.6-4-2.9z"/>',
  calendar: '<path d="M7 2h2v2h6V2h2v2h3v18H4V4h3zM6 9v11h12V9z"/><path d="M8 11h3v3H8z"/>',
};

export function icon(name) {
  const template = document.createElement('template');
  template.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true">${PATHS[name]}</svg>`;
  return template.content.firstElementChild;
}
