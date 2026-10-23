// Completed shifts card: one 72pt row per shift (badge · date + time · hours + tips).

import { el } from '../dom.js';
import { formatShortDay, fromKey } from '../dates.js';
import { shiftMinutes } from '../shifts.js';
import { formatEuro, formatHours, formatTimeRange } from '../format.js';
import { shiftBadge } from './shift-badge.js';

export function completedShifts(rows, todayKey) {
  const content = rows.length
    ? rows.map(([key, shift]) => el('div', { class: 'sofar-row is-shift' }, [
      el('span', { class: 'pay-shift' }, [
        shiftBadge(key, shift, todayKey),
        el('span', { class: 'pay-shift-text' }, [
          el('span', { class: 'sofar-label', text: formatShortDay(fromKey(key)) }),
          el('span', { class: 'pay-shift-detail', text: formatTimeRange(shift) }),
        ]),
      ]),
      el('span', { class: 'pay-shift-nums' }, [
        el('span', { class: 'sofar-value', text: formatHours(shiftMinutes(shift)) }),
        el('span', { class: 'pay-shift-detail', text: shift.tips > 0 ? `Tips ${formatEuro(shift.tips)}` : 'No tips' }),
      ]),
    ]))
    : [el('div', { class: 'sofar-row' }, [el('span', { class: 'day-card-off', text: 'No completed shifts this month' })])];

  return el('div', { class: 'sofar-card span-4' }, content);
}
