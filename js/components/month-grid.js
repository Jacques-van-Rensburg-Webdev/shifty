// Month view: a 7-day grid (Monday first) inside one block spanning columns 1–4.
// Each day cell is 72 tall: date 24, shift badge 24, start hour 16.

import { el } from '../dom.js';
import { MONTHS, WEEKDAY_INITIALS, daysInMonth, toKey } from '../dates.js';
import { SHIFT_TYPES } from '../shifts.js';
import { formatTimeRange } from '../format.js';
import { shiftBadge } from './shift-badge.js';

function dayLabel(day, month, year, isToday, shift) {
  let label = `${day} ${MONTHS[month]} ${year}`;
  if (isToday) label += ', today';
  if (shift) label += `, ${SHIFT_TYPES[shift.type]} ${formatTimeRange(shift)}`;
  return label;
}

export function renderMonthGrid({ month, selectedKey, todayKey, shifts, onSelect }) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const offset = (new Date(year, m, 1).getDay() + 6) % 7;
  const blank = () => el('div', { class: 'cal-blank' });

  const cells = Array.from({ length: offset }, blank);
  for (let day = 1; day <= daysInMonth(year, m); day += 1) {
    const key = toKey(new Date(year, m, day));
    const shift = shifts[key];
    const isToday = key === todayKey;
    const isSelected = key === selectedKey;
    cells.push(el('button', {
      type: 'button',
      class: ['cal-day', isToday && 'is-today', isSelected && 'is-selected'].filter(Boolean).join(' '),
      'aria-pressed': String(isSelected),
      'aria-label': dayLabel(day, m, year, isToday, shift),
      'data-focus-key': `day-${key}`,
      onClick: () => onSelect(key),
    }, [
      el('span', { class: 'cal-num' }, [el('span', { text: String(day) })]),
      shift && shiftBadge(key, shift, todayKey),
      shift && el('span', { class: 'cal-hour', text: shift.start.slice(0, 2) }),
    ]));
  }
  while (cells.length % 7) cells.push(blank());

  return el('div', { class: 'cal span-4' }, [
    el('div', { class: 'cal-head', 'aria-hidden': 'true' }, WEEKDAY_INITIALS.map((initial) => el('div', { text: initial }))),
    el('div', { class: 'cal-body' }, cells),
  ]);
}
