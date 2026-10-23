// Print-only summary of a month or week: title, totals and a table of the shifts.
// Shown only when printing (see @media print in styles.css).

import { el } from '../dom.js';
import { formatLongDay, formatShortDay, fromKey, today } from '../dates.js';
import { SHIFT_TYPES, shiftMinutes, totals } from '../shifts.js';
import { formatEuro, formatHours, formatTimeRange } from '../format.js';

const COLUMNS = ['Date', 'Type', 'Time', 'Length', 'Status', 'Tips', 'Bar close'];

function totalsTable(t) {
  const rows = [
    ['Hours worked', formatHours(t.minutes)],
    ['Shifts', String(t.count)],
    ['Tips earned', formatEuro(t.tips)],
    ['Non-tip hours', formatHours(t.nonTip)],
  ];
  return el('table', { class: 'print-table print-totals' }, [
    el('tbody', {}, rows.map(([label, value]) => el('tr', {}, [
      el('th', { scope: 'row', text: label }),
      el('td', { text: value }),
    ]))),
  ]);
}

function shiftsTable(entries) {
  return el('table', { class: 'print-table' }, [
    el('thead', {}, [el('tr', {}, COLUMNS.map((name) => el('th', { scope: 'col', text: name })))]),
    el('tbody', {}, entries.map(([key, shift]) => el('tr', {}, [
      el('td', { text: formatShortDay(fromKey(key)) }),
      el('td', { text: SHIFT_TYPES[shift.type] }),
      el('td', { text: formatTimeRange(shift) }),
      el('td', { text: formatHours(shiftMinutes(shift)) }),
      el('td', { text: shift.completed ? 'Completed' : 'Planned' }),
      el('td', { text: shift.tips > 0 ? formatEuro(shift.tips) : '–' }),
      el('td', { text: shift.barClose || '–' }),
    ]))),
  ]);
}

// title: "October 2026" or "19 Oct – 25 Oct 2026"; emptyText: shown when there are no shifts.
export function buildSummary({ title, firstKey, lastKey, todayKey, shifts, emptyText }) {
  const entries = Object.entries(shifts)
    .filter(([key]) => key >= firstKey && key <= lastKey)
    .sort(([a], [b]) => a.localeCompare(b));
  const made = today();

  return el('section', { class: 'print-summary' }, [
    el('h1', { class: 'print-title', text: `SHIFTY – ${title}` }),
    el('div', { class: 'print-stripe', 'aria-hidden': 'true' }),
    el('p', { class: 'print-meta', text: `Made ${formatLongDay(made)} ${made.getFullYear()}` }),
    el('h2', { class: 'print-heading', text: 'So far' }),
    totalsTable(totals(shifts, firstKey, lastKey, todayKey)),
    el('p', {
      class: 'print-meta',
      text: 'Hours and shifts count completed shifts up to today; tips count as soon as they are added.',
    }),
    el('h2', { class: 'print-heading', text: 'Shifts' }),
    entries.length ? shiftsTable(entries) : el('p', { text: emptyText }),
  ]);
}
