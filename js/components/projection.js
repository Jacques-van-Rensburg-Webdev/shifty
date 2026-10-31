// Pay: "Projected for the month". The projected total (ink card), its breakdown, then one row per
// shift still to come with its estimated hours and tips. Returns grid children (each carries its span).

import { el } from '../dom.js';
import { DAYS, fromKey } from '../dates.js';
import { SHIFT_TYPES, hasTips } from '../shifts.js';
import { formatEuro, formatHours, formatMinusEuro, formatPercent } from '../format.js';
import { moneyCard, payTotal } from './money-card.js';

function summary(p, completedTotal) {
  if (!p.upcoming.length) return 'All of this month\'s shifts are completed.';
  const count = p.upcoming.length;
  let text = `${formatEuro(completedTotal)} from completed shifts + about ${formatEuro(p.total - completedTotal)}`
    + ` from ${count} ${count === 1 ? 'shift' : 'shifts'} still to come`;
  if (p.noEstimate) text += `. ${p.noEstimate} ${p.noEstimate === 1 ? 'shift has' : 'shifts have'} no estimate yet`;
  return text;
}

function breakdownRows(p, rate, tipPercent) {
  return [
    { label: 'Hours', note: `${formatHours(p.done.minutes)} done + ≈ ${formatHours(p.toCome.minutes)}`, noteBelow: true, value: formatHours(p.minutes) },
    { label: 'Base pay', note: rate ? `× ${formatEuro(rate)}/h` : 'Add your hourly rate', value: rate ? formatEuro(p.base) : 'Set rate' },
    { label: 'Tax and other deductions', note: rate && 'estimate', value: rate ? formatMinusEuro(p.deductions.total) : '—', kind: 'sub' },
    { label: 'Tips', note: `${formatEuro(p.done.tips)} earned + ≈ ${formatEuro(p.toCome.tips)}`, noteBelow: true, value: formatEuro(p.tips) },
    { label: 'Tips deduction', note: formatPercent(tipPercent), value: formatMinusEuro(p.tipDeduction), kind: 'sub' },
    { label: 'Projected pay', value: formatEuro(p.total), kind: 'total' },
  ];
}

function shiftRow({ key, shift, minutes, minutesLabel, tips, tipsLabel, gross, hasEstimate }, rate) {
  const date = fromKey(key);
  const label = `${DAYS[date.getDay()].slice(0, 3)} ${date.getDate()} · ${SHIFT_TYPES[shift.type]}`;
  if (!hasEstimate) return { label, note: 'no estimate yet', noteBelow: true, value: '–' };

  const amounts = [`≈ ${formatHours(minutes)}`, hasTips(shift) && `${formatEuro(tips)} tips`];
  const sources = [...new Set([minutesLabel, tipsLabel].filter(Boolean))];
  return {
    label,
    note: [amounts.filter(Boolean).join(' + '), ...sources].join(' · '),
    noteBelow: true,
    value: rate || hasTips(shift) ? `≈ ${formatEuro(gross)}` : '–',
  };
}

export function renderProjection({ projection, completedTotal, monthName, rate, tipPercent }) {
  const p = projection;
  return [
    el('h3', { class: 'group-label span-4', text: 'Projected for the month' }),
    payTotal({ label: `Projected pay, ${monthName}`, value: formatEuro(p.total), note: summary(p, completedTotal) }),
    moneyCard(breakdownRows(p, rate, tipPercent)),
    p.upcoming.length
      ? moneyCard(p.upcoming.map((u) => shiftRow(u, rate)))
      : moneyCard([{ label: 'No shifts still to come', value: '' }]),
    el('p', {
      class: 'sofar-note span-4',
      text: 'Shifts still to come use the average hours and tips of last month\'s shifts on the same weekday. '
        + 'Each shift shows its pay before deductions. They change to the real figures as you complete them.',
    }),
  ];
}
