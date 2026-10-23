// Date helpers. Days are stored by key 'YYYY-MM-DD' (local time).
// Weeks run Monday to Sunday.

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEKDAY_INITIALS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const shortMonth = (date) => MONTHS[date.getMonth()].slice(0, 3);
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

// "Mon 20 Oct"
export function formatShortDay(date) {
  return `${DAYS[date.getDay()].slice(0, 3)} ${date.getDate()} ${shortMonth(date)}`;
}

// "Wednesday, 22 October"
export function formatLongDay(date) {
  return `${DAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// "October 2026"
export function formatMonth(date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

// "19 Oct – 25 Oct"
export function formatRange(start, end) {
  return `${start.getDate()} ${shortMonth(start)} – ${end.getDate()} ${shortMonth(end)}`;
}
