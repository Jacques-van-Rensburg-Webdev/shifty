// Shift calculations. No HTML here.
// A shift: { type: 'C' | 'O' | 'X' | 'M', start: 'HH:MM', end: 'HH:MM' | null, plannedStart, plannedEnd,
//           started, completed, barOpen, barClose, tips }
// Shifts are scheduled with a start time only; end is set when the shift is ended (completed shifts
// always have one). Older shifts may have a planned end.
// If end is at or before start, the shift runs past midnight; it belongs to the day it starts.

export const SHIFT_TYPES = { C: 'Closing', O: 'Opening', X: 'Other', M: 'Meeting' };

// Start time filled in when adding a shift of each type (a meeting has none).
export const DEFAULT_START = { C: '18:00', O: '11:00', X: '17:00' };

// Which bar time a type logs: an opening shift logs bar open, a meeting neither.
export function barKind(type) {
  if (type === 'M') return null;
  return type === 'O' ? 'open' : 'close';
}

// A meeting has no tips.
export function hasTips(shift) {
  return shift.type !== 'M';
}

const DAY_MINUTES = 24 * 60;

export function toMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function hasEnd(shift) {
  return Boolean(shift.end);
}

export function endsNextDay({ start, end }) {
  return Boolean(end) && toMinutes(end) <= toMinutes(start);
}

// Only for shifts with an end (see hasEnd).
export function shiftMinutes(shift) {
  const minutes = toMinutes(shift.end) - toMinutes(shift.start);
  return minutes <= 0 ? minutes + DAY_MINUTES : minutes;
}

// Minutes from the shift's start to `time`, capped at the shift's length.
function minutesIntoShift(shift, time) {
  let minutes = toMinutes(time) - toMinutes(shift.start);
  if (minutes < 0) minutes += DAY_MINUTES;
  return Math.min(minutes, shiftMinutes(shift));
}

// Non-tip time: a meeting is all non-tip; an opening shift from its start to bar open;
// a closing or other shift from bar close to its end. No bar time logged, or no end yet, counts as 0.
export function nonTipMinutes(shift) {
  if (!shift.end) return 0;
  if (shift.type === 'M') return shiftMinutes(shift);
  if (barKind(shift.type) === 'open') return shift.barOpen ? minutesIntoShift(shift, shift.barOpen) : 0;
  return shift.barClose ? shiftMinutes(shift) - minutesIntoShift(shift, shift.barClose) : 0;
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
