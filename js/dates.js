// Date helpers. Days are stored by key 'YYYY-MM-DD' (local time).
// Weeks run Monday to Sunday. Names and date patterns come from the current language (i18n.js).

import { t } from './i18n.js';

export const dayName = (weekday) => t('date.days')[weekday];     // "Wednesday"
export const dayShort = (weekday) => t('date.daysShort')[weekday]; // "Wed" / "Mi." / "mié"
export const monthName = (month) => t('date.months')[month];      // "October"
const monthShort = (month) => t('date.monthsShort')[month];       // "Oct"
export const weekdayInitials = () => t('date.initials');          // Monday first

const pad = (n) => String(n).padStart(2, '0');

export function toKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function fromKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isValidKey(key) {
  return /^\d{4}-\d{2}-\d{2}$/.test(key || '') && toKey(fromKey(key)) === key;
}

export function today() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function addDays(date, n) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n);
}

export function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

// Same day number n months away, clamped to the end of that month (31 Jan + 1 = 28/29 Feb).
export function addMonths(date, n) {
  const first = new Date(date.getFullYear(), date.getMonth() + n, 1);
  const day = Math.min(date.getDate(), daysInMonth(first.getFullYear(), first.getMonth()));
  return new Date(first.getFullYear(), first.getMonth(), day);
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function startOfWeek(date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}

// "Mon 20 Oct" · "Mo. 20. Okt." · "lun 20 oct"
export function formatShortDay(date) {
  return t('date.shortDay', { wd: dayShort(date.getDay()), d: date.getDate(), mon: monthShort(date.getMonth()) });
}

// "Mon 20" · "Mo. 20." · "lun 20"
export function formatDayNum(date) {
  return t('date.dayNum', { wd: dayShort(date.getDay()), d: date.getDate() });
}

// "Wednesday, 22 October" · "Mittwoch, 22. Oktober" · "miércoles, 22 de octubre"
export function formatLongDay(date) {
  return t('date.longDay', { weekday: dayName(date.getDay()), d: date.getDate(), month: monthName(date.getMonth()) });
}

// "October 2026" · "Oktober 2026" · "octubre de 2026"
export function formatMonth(date) {
  return t('date.month', { month: monthName(date.getMonth()), year: date.getFullYear() });
}

// "19 Oct – 25 Oct" · "19. Okt. – 25. Okt." · "19 oct – 25 oct"
export function formatRange(start, end) {
  return t('date.range', {
    d1: start.getDate(), m1: monthShort(start.getMonth()), d2: end.getDate(), m2: monthShort(end.getMonth()),
  });
}
