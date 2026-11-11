// Pay screen: hourly rate, estimated pay and its breakdown, the month's projection, the deductions
// estimate from last month's gross (the only place each contribution is listed), the tips deduction
// setting and the month's completed shifts.
// The month shown is kept in memory (view-month.js) while you switch tabs.

import { el, redraw } from '../dom.js';
import { MONTHS, addMonths, endOfMonth, formatMonth, toKey, today } from '../dates.js';
import { formatEuro, formatHours, formatMinusEuro, formatPercent } from '../format.js';
import { RATE_LABELS, deductions } from '../deductions.js';
import { monthPay } from '../pay-calc.js';
import { monthProjection } from '../month-projection.js';
import { getSettings, getShifts, updateSettings } from '../storage.js';
import { getViewMonth, setViewMonth } from '../view-month.js';
import { periodNav } from '../components/period-nav.js';
import { saveField } from '../components/save-field.js';
import { moneyCard, payTotal } from '../components/money-card.js';
import { completedShifts } from '../components/completed-shifts.js';
import { renderProjection } from '../components/projection.js';

const round2 = (v) => Math.round(v * 100) / 100;
const groupLabel = (text) => el('h3', { class: 'group-label span-4', text });
const note = (text) => el('p', { class: 'sofar-note span-4', text });
const BAND_LABELS = { mini: 'Minijob', midi: 'Übergangsbereich' };

// Base pay, the deductions total (each contribution is listed in the Deductions card), tips and
// the tips deduction, then the total.
function breakdownRows(pay, rate, tipPercent) {
  const ded = pay.deductions;
  let dedNote = null;
  if (rate) dedNote = ded.band === 'mini' ? 'Minijob: none' : 'estimate';
  return [
    {
      label: 'Base pay',
      note: rate ? `${formatHours(pay.minutes)} × ${formatEuro(rate)}/h` : 'Add your hourly rate',
      noteBelow: true,
      value: rate ? formatEuro(pay.base) : 'Set rate',
    },
    { label: 'Tax and other deductions', note: dedNote, value: rate ? formatMinusEuro(ded.total) : '—', kind: 'sub' },
    { label: 'Tips', value: formatEuro(pay.tips) },
    { label: 'Tips deduction', note: formatPercent(tipPercent), value: formatMinusEuro(pay.tipDeduction), kind: 'sub' },
    { label: 'Total estimated pay', value: formatEuro(pay.total), kind: 'total' },
  ];
}

function deductionRows(gross, prevName) {
  const ded = deductions(gross);
  return [
    { label: `Gross pay, ${prevName}`, value: formatEuro(gross) },
    { label: 'SV-Brutto', note: BAND_LABELS[ded.band], value: formatEuro(ded.svBase) },
    { label: 'Sozialversicherung', value: formatMinusEuro(ded.sv) },
    { label: 'KV', note: RATE_LABELS.kv, value: formatMinusEuro(ded.kv), kind: 'sub' },
    { label: 'RV', note: RATE_LABELS.rv, value: formatMinusEuro(ded.rv), kind: 'sub' },
    { label: 'AV', note: RATE_LABELS.av, value: formatMinusEuro(ded.av), kind: 'sub' },
    { label: 'PV', note: RATE_LABELS.pv, value: formatMinusEuro(ded.pv), kind: 'sub' },
    { label: 'LSt', note: RATE_LABELS.lst, value: formatMinusEuro(ded.lst) },
    { label: `Net pay, ${prevName}`, value: formatEuro(ded.net), kind: 'net' },
  ];
}

export function render(container) {
  const rerender = () => redraw(container, render);

  const settings = getSettings();
  const { rate, tipPercent, grossByMonth } = settings;
  const month = getViewMonth();
  const monthName = MONTHS[month.getMonth()];
  const prev = addMonths(month, -1);
  const prevName = MONTHS[prev.getMonth()];
  const prevKey = toKey(prev).slice(0, 7);
  const gross = grossByMonth[prevKey] ?? null;
  const pay = monthPay(getShifts(), toKey(month), toKey(endOfMonth(month)), settings);
  const projection = monthProjection(getShifts(), toKey(month), toKey(endOfMonth(month)), settings);

  container.append(el('div', { class: 'grid' }, [
    el('h2', { class: 'section-title span-4', text: 'Pay' }),
    ...periodNav({
      label: formatMonth(month),
      unit: 'month',
      onMove: (step) => { setViewMonth(addMonths(month, step)); rerender(); },
    }),

    ...saveField({
      id: 'hourly-rate',
      label: 'Hourly rate (€)',
      value: rate || null,
      buttonText: rate ? 'Update rate' : 'Save rate',
      isValid: (v) => v > 0,
      onSave: (v) => { updateSettings({ rate: round2(v) }); rerender(); },
    }),
    payTotal({
      label: `Estimated pay, ${monthName}`,
      value: formatEuro(pay.total),
      note: rate
        ? `${formatHours(pay.minutes)} completed at ${formatEuro(rate)}/h`
        : 'Tips only. Add your hourly rate to include base pay.',
    }),
    moneyCard(breakdownRows(pay, rate, tipPercent)),

    ...renderProjection({ projection, completedTotal: pay.total, monthName, rate }),

    groupLabel('Deductions'),
    ...saveField({
      id: 'prev-gross',
      label: `Gross pay, ${prevName} (€)`,
      value: gross,
      buttonText: gross != null ? 'Update gross' : 'Save gross',
      isValid: (v) => v >= 0,
      onSave: (v) => { updateSettings({ grossByMonth: { ...grossByMonth, [prevKey]: round2(v) } }); rerender(); },
    }),
    moneyCard(deductionRows(gross || 0, prevName)),
    note('Based on tax class 4, no children, no church tax and a 1,60 % Zusatzbeitrag. Between €603 and €2.000 the Übergangsbereich applies, so contributions are worked out on a reduced base. LSt is estimated from the 2026 tariff. Tips are tax-free and not included.'),

    groupLabel('Tips deduction'),
    ...saveField({
      id: 'tip-percent',
      label: 'Deduction (%)',
      value: tipPercent,
      buttonText: 'Update %',
      isValid: (v) => v >= 0 && v <= 100,
      onSave: (v) => { updateSettings({ tipPercent: Math.round(v * 10) / 10 }); rerender(); },
      decimals: null,
      placeholder: '5',
    }),

    groupLabel('Completed shifts'),
    completedShifts(pay.rows, toKey(today())),
    note('Estimates only. Check your payslip for the real figures.'),
  ]));
}
