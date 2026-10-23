// Shift calculations. No HTML here.
// A shift: { type: 'C' | 'O' | 'X', start: 'HH:MM', end: 'HH:MM', plannedEnd, completed, barClose, tips }
// If end is at or before start, the shift runs past midnight; it belongs to the day it starts.

export const SHIFT_TYPES = { C: 'Closing', O: 'Opening', X: 'Other' };

const DAY_MINUTES = 24 * 60;

export function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function endsNextDay({ start, end }) {
  return toMinutes(end) <= toMinutes(start);
}

export function shiftMinutes(shift) {
  const minutes = toMinutes(shift.end) - toMinutes(shift.start);
  return minutes <= 0 ? minutes + DAY_MINUTES : minutes;
}

// Time from bar close to the end of the shift (start to bar close is tip time).
// No bar close logged counts as 0.
export function nonTipMinutes(shift) {
  if (!shift.barClose) return 0;
  const start = toMinutes(shift.start);
  const end = start + shiftMinutes(shift);
  let barClose = toMinutes(shift.barClose);
  if (barClose < start) barClose += DAY_MINUTES;
  return Math.max(0, end - Math.min(barClose, end));
}

// Badges fade once the day has passed or the shift is completed.
export function isFaded(key, shift, todayKey) {
  return key < todayKey || shift.completed;
}

// Totals for days firstKey..lastKey, up to today. Hours and shifts count completed
// shifts only; tips count as soon as they are added.
export function totals(shifts, firstKey, lastKey, todayKey) {
  const last = lastKey < todayKey ? lastKey : todayKey;
  const result = { minutes: 0, count: 0, tips: 0, nonTip: 0 };
  for (const [key, shift] of Object.entries(shifts)) {
    if (key < firstKey || key > last) continue;
    result.tips += shift.tips || 0;
    if (!shift.completed) continue;
    result.minutes += shiftMinutes(shift);
    result.count += 1;
    result.nonTip += nonTipMinutes(shift);
  }
  return result;
}
