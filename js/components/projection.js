// Pay: projected pay for the whole month. The projected total (ink card) with a one-line note,
// then one row per shift still to come with its estimated hours, tips and pay before deductions.
// Returns grid children (each carries its span).

import { el } from '../dom.js';
import { DAYS, fromKey } from '../dates.js';
import { SHIFT_TYPES, hasTips } from '../shifts.js';
import { formatEuro, formatHours } from '../format.js';
import { moneyCard, payTotal } from './money-card.js';

function summary(p, completedTotal) {
  if (!p.upcoming.length) return 'All of this month\'s shifts are completed.';
  const count = p.upcoming.length;
  let text = `${formatEuro(completedTotal)} completed + ≈ ${formatEuro(p.total - completedTotal)}`
    + ` from ${count} ${count === 1 ? 'shift' : 'shifts'} to come`;
  if (p.noEstimate) text += ` (${p.noEstimate} without an estimate)`;
  return text;
}

function shiftRow({ key, shift, minutes, tips, gross, hasEstimate }, rate) {
  const date = fromKey(key);
  const label = `${DAYS[date.getDay()].slice(0, 3)} ${date.getDate()} · ${SHIFT_TYPES[shift.type]}`;
  if (!hasEstimate) return { label, note: 'no estimate yet', noteBelow: true, value: '–' };

  const parts = [`≈ ${formatHours(minutes)}`, hasTips(shift) && `${formatEuro(tips)} tips`];
  return {
    label,
    note: parts.filter(Boolean).join(' + '),
    noteBelow: true,
    value: rate || hasTips(shift) ? `≈ ${formatEuro(gross)}` : '–',
  };
}

export function renderProjection({ projection, completedTotal, monthName, rate }) {
  const p = projection;
  const total = payTotal({ label: `Projected pay, ${monthName}`, value: formatEuro(p.total), note: summary(p, completedTotal) });
  if (!p.upcoming.length) return [total];
  return [
    total,
    moneyCard(p.upcoming.map((u) => shiftRow(u, rate))),
    el('p', {
      class: 'sofar-note span-4',
      text: '≈ is the average of your completed shifts on the same weekday, before deductions.',
    }),
  ];
}
