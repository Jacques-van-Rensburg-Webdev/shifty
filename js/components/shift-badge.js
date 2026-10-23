// One-letter shift-type badge (C / O / X), faded once past or completed.

import { el } from '../dom.js';
import { isFaded } from '../shifts.js';

export function shiftBadge(key, shift, todayKey) {
  const faded = isFaded(key, shift, todayKey) ? ' is-faded' : '';
  return el('span', {
    class: `shift-badge badge-${shift.type.toLowerCase()}${faded}`,
    'aria-hidden': 'true',
    text: shift.type,
  });
}
