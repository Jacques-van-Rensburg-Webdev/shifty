// "So far" totals card: hours worked, shifts, tips earned, non-tip hours.

import { el } from '../dom.js';
import { formatEuro, formatHours } from '../format.js';

const row = (label, value) => el('div', { class: 'sofar-row' }, [
  el('span', { class: 'sofar-label', text: label }),
  el('span', { class: 'sofar-value', text: value }),
]);

export function renderSoFar({ heading, totals }) {
  return [
    el('h3', { class: 'group-label span-4', text: heading }),
    el('div', { class: 'sofar-card span-4' }, [
      row('Hours worked', formatHours(totals.minutes)),
      row('Shifts', String(totals.count)),
      row('Tips earned', formatEuro(totals.tips)),
      row('Non-tip hours', formatHours(totals.nonTip)),
    ]),
    el('p', {
      class: 'sofar-note span-4',
      text: 'Hours and shifts count completed shifts only; tips count as soon as they are added.',
    }),
  ];
}
