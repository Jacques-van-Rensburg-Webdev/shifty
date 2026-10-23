// ◀ label ▶ navigation: 48 × 48 buttons in columns 1 and 4, label in 2–3.

import { el } from '../dom.js';
import { icon } from '../icons.js';

// unit: 'month' or 'week' (for the button labels); onMove(-1 | 1).
export function periodNav({ label, unit, isRange = false, onMove }) {
  const button = (step) => el('button', {
    type: 'button',
    class: `button nav-button span-1${step > 0 ? ' nav-button-end' : ''}`,
    'aria-label': `${step > 0 ? 'Next' : 'Previous'} ${unit}`,
    'data-focus-key': `nav-${step}`,
    onClick: () => onMove(step),
  }, [icon(step > 0 ? 'next' : 'prev')]);

  return [
    button(-1),
    el('h3', { class: `month-label span-2${isRange ? ' is-range' : ''}`, 'aria-live': 'polite', text: label }),
    button(1),
  ];
}
