// "So far" totals card: hours worked, shifts, tips earned, non-tip hours.
// Hours and shifts count completed shifts only; tips count as soon as they are added.

import { el } from '../dom.js';
import { formatEuro, formatHours } from '../format.js';
import { t } from '../i18n.js';

const row = (label, value) => el('div', { class: 'sofar-row' }, [
  el('span', { class: 'sofar-label', text: label }),
  el('span', { class: 'sofar-value', text: value }),
]);

export function renderSoFar({ heading, totals }) {
  return [
    el('h3', { class: 'group-label span-4', text: heading }),
    el('div', { class: 'sofar-card span-4' }, [
      row(t('soFar.hours'), formatHours(totals.minutes)),
      row(t('soFar.shifts'), String(totals.count)),
      row(t('soFar.tips'), formatEuro(totals.tips)),
      row(t('soFar.nonTip'), formatHours(totals.nonTip)),
    ]),
  ];
}
