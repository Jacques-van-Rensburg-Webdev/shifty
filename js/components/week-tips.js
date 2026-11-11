// Home: "This week's tips". One card: a row per shift this week (tips earned, or "≈" an estimate,
// or "–" when there's nothing to estimate from) and a "Predicted tips" total row.
// Returns grid children (each carries its span).

import { el } from '../dom.js';
import { addDays, formatDayNum, formatRange, fromKey } from '../dates.js';
import { typeName } from '../shifts.js';
import { formatEuro } from '../format.js';
import { weekTips } from '../week-tips.js';
import { t } from '../i18n.js';
import { moneyCard } from './money-card.js';

function shiftRow({ key, shift, kind, amount }, todayKey) {
  const notes = [key === todayKey && t('note.today'), kind === 'none' && t('note.noEstimate')];
  return {
    label: `${formatDayNum(fromKey(key))} · ${typeName(shift.type)}`,
    note: notes.filter(Boolean).join(' · ') || null,
    noteBelow: true,
    value: kind === 'estimate' ? `≈ ${formatEuro(amount)}` : (kind === 'none' ? '–' : formatEuro(amount)),
  };
}

export function renderWeekTips({ shifts, date, todayKey }) {
  const w = weekTips(shifts, date);
  const first = fromKey(w.firstKey);
  const rows = w.rows.length
    ? w.rows.map((row) => shiftRow(row, todayKey))
    : [{ label: t('weekTips.none'), value: '' }];
  return [
    el('h3', { class: 'group-label span-4', text: `${t('weekTips.heading')} · ${formatRange(first, addDays(first, 6))}` }),
    moneyCard([
      ...rows,
      { label: t('weekTips.predicted'), value: w.expected > 0 ? `≈ ${formatEuro(w.predicted)}` : formatEuro(w.predicted), kind: 'total' },
    ]),
  ];
}
