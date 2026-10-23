// Card of label / value rows, and the ink "pay total" card with the red stripe.
// Row: { label, note, noteBelow, value, kind } where kind is
//   undefined (56 row), 'sub' (48, indented, small), 'net' (paper background) or 'total' (ink, 64).

import { el } from '../dom.js';

function row({ label, note, noteBelow = false, value, kind }) {
  const isSub = kind === 'sub';
  const noteEl = note && el('span', { class: 'money-note', text: note });
  const labelEl = noteBelow
    ? el('span', { class: 'money-label-stack' }, [el('span', { class: 'sofar-label', text: label }), noteEl])
    : el('span', { class: isSub ? 'money-sub-label' : 'sofar-label' }, [label, noteEl && ' ', noteEl]);

  return el('div', { class: `sofar-row${kind ? ` is-${kind}` : ''}` }, [
    labelEl,
    el('span', { class: isSub ? 'money-sub-value' : 'sofar-value', text: value }),
  ]);
}

export function moneyCard(rows) {
  return el('div', { class: 'sofar-card span-4' }, rows.filter(Boolean).map(row));
}

export function payTotal({ label, value, note }) {
  return el('div', { class: 'pay-total span-4' }, [
    el('span', { class: 'pay-total-label', text: label }),
    el('span', { class: 'pay-total-value', text: value }),
    el('span', { class: 'pay-total-note', text: note }),
  ]);
}
