// Week view: seven 56pt rows, Monday to Sunday. Day on the left; "Off" or the shift on the right.

import { el } from '../dom.js';
import { addDays, formatShortDay, toKey } from '../dates.js';
import { SHIFT_TYPES } from '../shifts.js';
import { formatTimeRange } from '../format.js';
import { shiftBadge } from './shift-badge.js';

export function renderWeekList({ weekStart, selectedKey, todayKey, shifts, onSelect }) {
  const rows = [];
  for (let i = 0; i < 7; i += 1) {
    const date = addDays(weekStart, i);
    const key = toKey(date);
    const shift = shifts[key];
    const isToday = key === todayKey;
    const isSelected = key === selectedKey;
    const label = formatShortDay(date);
    const summary = shift ? `${SHIFT_TYPES[shift.type]} ${formatTimeRange(shift)}` : 'off';

    rows.push(el('button', {
      type: 'button',
      class: ['week-row', isToday && 'is-today', isSelected && 'is-selected'].filter(Boolean).join(' '),
      'aria-pressed': String(isSelected),
      'aria-label': `${label}${isToday ? ', today' : ''}, ${summary}`,
      'data-focus-key': `day-${key}`,
      onClick: () => onSelect(key),
    }, [
      el('span', { class: 'week-day', text: label }),
      shift
        ? el('span', { class: 'week-shift' }, [
          shiftBadge(key, shift, todayKey),
          el('span', { class: 'week-shift-text' }, [
            el('span', { class: 'week-type', text: SHIFT_TYPES[shift.type] }),
            el('span', { class: 'week-time', text: formatTimeRange(shift) }),
          ]),
        ])
        : el('span', { class: 'week-off', text: 'Off' }),
    ]));
  }
  return el('div', { class: 'week-card span-4' }, rows);
}
