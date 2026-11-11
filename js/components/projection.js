// Pay: projected pay for the whole month. The projected total (ink card) with a one-line note,
// then one row per shift still to come with its estimated hours, tips and pay before deductions.
// Returns grid children (each carries its span).

import { el } from '../dom.js';
import { formatDayNum, fromKey } from '../dates.js';
import { hasTips, typeName } from '../shifts.js';
import { formatEuro, formatHours } from '../format.js';
import { t } from '../i18n.js';
import { moneyCard, payTotal } from './money-card.js';

function summary(p, completedTotal) {
  if (!p.upcoming.length) return t('proj.allDone');
  let text = t('proj.summary', {
    completed: formatEuro(completedTotal), more: formatEuro(p.total - completedTotal), count: p.upcoming.length,
  });
  if (p.noEstimate) text += t('proj.noEstimate', { count: p.noEstimate });
  return text;
}

function shiftRow({ key, shift, minutes, tips, gross, hasEstimate }, rate) {
  const label = `${formatDayNum(fromKey(key))} · ${typeName(shift.type)}`;
  if (!hasEstimate) return { label, note: t('note.noEstimate'), noteBelow: true, value: '–' };

  const parts = [`≈ ${formatHours(minutes)}`, hasTips(shift) && t('proj.tipsPart', { amount: formatEuro(tips) })];
  return {
    label,
    note: parts.filter(Boolean).join(' + '),
    noteBelow: true,
    value: rate || hasTips(shift) ? `≈ ${formatEuro(gross)}` : '–',
  };
}

export function renderProjection({ projection, completedTotal, monthName, rate }) {
  const p = projection;
  const total = payTotal({ label: t('proj.label', { month: monthName }), value: formatEuro(p.total), note: summary(p, completedTotal) });
  if (!p.upcoming.length) return [total];
  return [
    total,
    moneyCard(p.upcoming.map((u) => shiftRow(u, rate))),
    el('p', { class: 'sofar-note span-4', text: t('proj.note') }),
  ];
}
