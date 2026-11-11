// Pay screen: hourly rate, estimated pay and its breakdown, the month's projection, the deductions
// estimate from last month's gross (the only place each contribution is listed), the tips deduction
// setting and the month's completed shifts.
// The month shown is kept in memory (view-month.js) while you switch tabs.
// German payroll terms (SV-Brutto, Minijob, Übergangsbereich, KV, RV, AV, PV, LSt) stay German in
// every language: they are what the payslip says.

import { el, redraw } from '../dom.js';
import { addMonths, endOfMonth, formatMonth, monthName, toKey, today } from '../dates.js';
import { formatEuro, formatHours, formatMinusEuro, formatPercent, formatRate } from '../format.js';
import { LST_LABEL, RATES, deductions } from '../deductions.js';
import { monthPay } from '../pay-calc.js';
import { monthProjection } from '../month-projection.js';
import { getSettings, getShifts, updateSettings } from '../storage.js';
import { getViewMonth, setViewMonth } from '../view-month.js';
import { t } from '../i18n.js';
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
  if (rate) dedNote = ded.band === 'mini' ? t('pay.minijobNone') : t('pay.estimate');
  return [
    {
      label: t('pay.basePay'),
      note: rate ? `${formatHours(pay.minutes)} × ${formatEuro(rate)}/h` : t('pay.addRate'),
      noteBelow: true,
      value: rate ? formatEuro(pay.base) : t('pay.setRate'),
    },
    { label: t('pay.deductionsRow'), note: dedNote, value: rate ? formatMinusEuro(ded.total) : '—', kind: 'sub' },
    { label: t('pay.tips'), value: formatEuro(pay.tips) },
    { label: t('pay.tipDeduction'), note: formatPercent(tipPercent), value: formatMinusEuro(pay.tipDeduction), kind: 'sub' },
    { label: t('pay.total'), value: formatEuro(pay.total), kind: 'total' },
  ];
}

function deductionRows(gross, prevName) {
  const ded = deductions(gross);
  return [
    { label: t('ded.gross', { month: prevName }), value: formatEuro(gross) },
    { label: 'SV-Brutto', note: BAND_LABELS[ded.band], value: formatEuro(ded.svBase) },
    { label: 'Sozialversicherung', value: formatMinusEuro(ded.sv) },
    { label: 'KV', note: formatRate(RATES.kv), value: formatMinusEuro(ded.kv), kind: 'sub' },
    { label: 'RV', note: formatRate(RATES.rv), value: formatMinusEuro(ded.rv), kind: 'sub' },
    { label: 'AV', note: formatRate(RATES.av), value: formatMinusEuro(ded.av), kind: 'sub' },
    { label: 'PV', note: formatRate(RATES.pv), value: formatMinusEuro(ded.pv), kind: 'sub' },
    { label: 'LSt', note: LST_LABEL, value: formatMinusEuro(ded.lst) },
    { label: t('ded.net', { month: prevName }), value: formatEuro(ded.net), kind: 'net' },
  ];
}

export function render(container) {
  const rerender = () => redraw(container, render);

  const settings = getSettings();
  const { rate, tipPercent, grossByMonth } = settings;
  const month = getViewMonth();
  const monthLabel = monthName(month.getMonth());
  const prev = addMonths(month, -1);
  const prevName = monthName(prev.getMonth());
  const prevKey = toKey(prev).slice(0, 7);
  const gross = grossByMonth[prevKey] ?? null;
  const pay = monthPay(getShifts(), toKey(month), toKey(endOfMonth(month)), settings);
  const projection = monthProjection(getShifts(), toKey(month), toKey(endOfMonth(month)), settings);

  container.append(el('div', { class: 'grid' }, [
    el('h2', { class: 'section-title span-4', text: t('pay.title') }),
    ...periodNav({
      label: formatMonth(month),
      prevLabel: t('nav.prevMonth'),
      nextLabel: t('nav.nextMonth'),
      onMove: (step) => { setViewMonth(addMonths(month, step)); rerender(); },
    }),

    ...saveField({
      id: 'hourly-rate',
      label: t('pay.rateLabel'),
      value: rate || null,
      buttonText: rate ? t('pay.updateRate') : t('pay.saveRate'),
      isValid: (v) => v > 0,
      onSave: (v) => { updateSettings({ rate: round2(v) }); rerender(); },
    }),
    payTotal({
      label: t('pay.estimated', { month: monthLabel }),
      value: formatEuro(pay.total),
      note: rate
        ? t('pay.estimatedNote', { hours: formatHours(pay.minutes), rate: formatEuro(rate) })
        : t('pay.tipsOnly'),
    }),
    moneyCard(breakdownRows(pay, rate, tipPercent)),

    ...renderProjection({ projection, completedTotal: pay.total, monthName: monthLabel, rate }),

    groupLabel(t('ded.heading')),
    ...saveField({
      id: 'prev-gross',
      label: t('ded.grossLabel', { month: prevName }),
      value: gross,
      buttonText: gross != null ? t('ded.updateGross') : t('ded.saveGross'),
      isValid: (v) => v >= 0,
      onSave: (v) => { updateSettings({ grossByMonth: { ...grossByMonth, [prevKey]: round2(v) } }); rerender(); },
    }),
    moneyCard(deductionRows(gross || 0, prevName)),
    note(t('ded.note')),

    groupLabel(t('tipsDed.heading')),
    ...saveField({
      id: 'tip-percent',
      label: t('tipsDed.label'),
      value: tipPercent,
      buttonText: t('tipsDed.update'),
      isValid: (v) => v >= 0 && v <= 100,
      onSave: (v) => { updateSettings({ tipPercent: Math.round(v * 10) / 10 }); rerender(); },
      decimals: null,
      placeholder: '5',
    }),

    groupLabel(t('completed.heading')),
    completedShifts(pay.rows, toKey(today())),
    note(t('pay.note')),
  ]));
}
