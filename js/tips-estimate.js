// Estimated tips for a shift that isn't completed yet. No HTML here.
// Uses up to the last 8 completed shifts before it on the same weekday and of the same type
// (or of any type on that weekday if there are none): their average tips per shift. Shifts are
// scheduled with a start time only, so there is no planned length to scale by.

import { DAYS, fromKey } from './dates.js';
import { SHIFT_TYPES, hasTips } from './shifts.js';

const LAST = 8;

// Newest first: completed shifts before `key` on `weekday`, optionally of one type. Meetings
// (no tips) are never used.
function pastShifts(shifts, key, weekday, type) {
  return Object.entries(shifts)
    .filter(([k, s]) => k < key && s.completed && hasTips(s)
      && fromKey(k).getDay() === weekday && (!type || s.type === type))
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, LAST)
    .map(([, s]) => s);
}

// -> { amount, count, label } e.g. label "average of 5 Thursday closing shifts", or null.
export function estimateTips(shifts, key, shift) {
  if (shift.completed || !hasTips(shift)) return null;
  const weekday = fromKey(key).getDay();
  let past = pastShifts(shifts, key, weekday, shift.type);
  const sameType = past.length > 0;
  if (!sameType) past = pastShifts(shifts, key, weekday, null);
  if (!past.length) return null;

  const perShift = past.reduce((sum, s) => sum + (s.tips || 0), 0) / past.length;
  const kind = sameType ? `${DAYS[weekday]} ${SHIFT_TYPES[shift.type].toLowerCase()}` : DAYS[weekday];
  return {
    amount: Math.round(perShift * 100) / 100,
    count: past.length,
    label: `average of ${past.length} ${kind} ${past.length === 1 ? 'shift' : 'shifts'}`,
  };
}
