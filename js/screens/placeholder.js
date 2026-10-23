// Temporary screen used until a screen has real content:
// a section title and a "Coming soon" card.

export function renderPlaceholder(container, title) {
  const grid = document.createElement('div');
  grid.className = 'grid';

  // Content, columns 1–4, at 0
  const heading = document.createElement('h2');
  heading.className = 'section-title span-4';
  heading.textContent = title;

  // Content, columns 1–4, space-2 below
  const card = document.createElement('section');
  card.className = 'card span-4';

  const text = document.createElement('p');
  text.className = 'text-muted';
  text.textContent = 'Coming soon';

  card.append(text);
  grid.append(heading, card);
  container.append(grid);
}
