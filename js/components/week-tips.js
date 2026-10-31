// Home: "This week's tips". The predicted total (ink card), then one row per shift this week:
// tips earned, an estimate, or "no estimate yet". Returns grid children (each carries its span).

import { el } from '../dom.js';
import { DAYS, addDays, formatRange, fromKey } from '../dates.js';
import { SHIFT_TYPES } from '../shifts.js';
import { formatEuro } from '../format.js';
import { weekTips } from '../week-tips.js';
import { moneyCard, payTotal } from './money-card.js';

function summary(w) {
  const parts = [`${formatEuro(w.earned)} earned`];
  if (w.expected > 0) parts.push(`about ${formatEuro(w.expected)} still to come`);
  let text = parts.join(' + ');
  if (w.noEstimate) text += `. ${w.noEstimate} ${w.noEstimate === 1 ? 'shift has' : 'shifts have'} no estimate yet`;
  return text;
}

function shiftRow({ key, shift, kind, amount, label }, todayKey) {
  const date = fromKey(key);
  const notes = [key === todayKey && 'today', kind === 'estimate' && `estimate, ${label}`, kind === 'none' && 'no estimate yet'];
  return {
    label: `${DAYS[date.getDay()].slice(0, 3)} ${date.getDate()} · ${SHIFT_TYPES[shift.type]}`,
    note: notes.filter(Boolean).join(' · ') || null,
    noteBelow: true,
    value: kind === 'estimate' ? `≈ ${formatEuro(amount)}` : (kind === 'none' ? '–' : formatEuro(amount)),
  };
}

export function renderWeekTips({ shifts, date, todayKey }) {
  const w = weekTips(shifts, date);
  const first = fromKey(w.firstKey);
  return [
    el('h3', { class: 'group-label span-4', text: `This week's tips · ${formatRange(first, addDays(first, 6))}` }),
    payTotal({ label: 'Predicted tips', value: formatEuro(w.predicted), note: summary(w) }),
    w.rows.length
      ? moneyCard(w.rows.map((row) => shiftRow(row, todayKey)))
      : moneyCard([{ label: 'No shifts this week', value: '' }]),
    el('p', {
      class: 'sofar-note span-4',
      text: 'Estimates use last month\'s shifts on the same weekday. They change to the real tips as you add them.',
    }),
  ];
}
