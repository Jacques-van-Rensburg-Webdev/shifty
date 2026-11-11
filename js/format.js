// Display formats, following the current language (i18n.js):
// English €2,345.60 · 5% · decimal point; German and Spanish 2.345,60 € · 5 % · decimal comma.

import { getLanguage } from './i18n.js';

const options = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
const NUMBER = {
  en: new Intl.NumberFormat('en-GB', options),
  de: new Intl.NumberFormat('de-DE', options),
  es: new Intl.NumberFormat('de-DE', options), // Spain groups thousands with a point too
};

const isEnglish = () => getLanguage() === 'en';
const number = (n) => NUMBER[getLanguage()].format(n);

export const decimalSeparator = () => (isEnglish() ? '.' : ',');

// Exact hours and minutes: 90 -> "1:30 h", 390 -> "6:30 h", 0 -> "0:00 h"
export function formatHours(minutes) {
  const total = Math.round(minutes);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')} h`;
}

// 2345.6 -> "€2,345.60" / "2.345,60 €"; -120 -> "−€120.00" / "−120,00 €"
export function formatEuro(amount) {
  const sign = amount < 0 ? '−' : '';
  const n = number(Math.abs(amount));
  return isEnglish() ? `${sign}€${n}` : `${sign}${n} €`;
}

// A deduction: 98.76 -> "−€98.76"; nothing -> "€0.00"
export function formatMinusEuro(amount) {
  return amount > 0 ? `−${formatEuro(amount)}` : formatEuro(0);
}

// 5 -> "5%" / "5 %", 14.6 -> "14.6%" / "14,6 %"
export function formatPercent(value) {
  const text = String(value).replace('.', decimalSeparator());
  return isEnglish() ? `${text}%` : `${text} %`;
}

// Contribution rates: [14.6, 3.2] -> "14.60 + 3.20%" / "14,60 + 3,20 %"
export function formatRate(parts) {
  return `${parts.map(number).join(' + ')}${isEnglish() ? '%' : ' %'}`;
}

// "18:00–02:00", or "18:00" for a shift that has no end yet.
export function formatTimeRange(shift) {
  return shift.end ? `${shift.start}–${shift.end}` : shift.start;
}
