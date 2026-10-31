// The completed shifts a planned shift is estimated from. No HTML here.
// Last month's shifts (the calendar month before the shift's month) on the same weekday and of the
// same type, or of any type on that weekday if there are none. Meetings are only compared with
// meetings, and other shifts never with meetings.

import { DAYS, MONTHS, addMonths, endOfMonth, fromKey, startOfMonth, toKey } from './dates.js';
import { SHIFT_TYPES } from './shifts.js';

// -> { shifts, label } e.g. label "4 Friday closing shifts in October", or null.
export function pastShifts(shifts, key, shift) {
  const date = fromKey(key);
  const weekday = date.getDay();
  const month = addMonths(startOfMonth(date), -1);
  const firstKey = toKey(month);
  const lastKey = toKey(endOfMonth(month));
  const isMeeting = shift.type === 'M';

  const candidates = Object.entries(shifts)
    .filter(([k, s]) => k >= firstKey && k <= lastKey && s.completed
      && fromKey(k).getDay() === weekday && (s.type === 'M') === isMeeting)
    .map(([, s]) => s);
  let past = candidates.filter((s) => s.type === shift.type);
  const sameType = past.length > 0;
  if (!sameType) past = candidates;
  if (!past.length) return null;

  const kind = sameType ? `${DAYS[weekday]} ${SHIFT_TYPES[shift.type].toLowerCase()}` : DAYS[weekday];
  return {
    shifts: past,
    label: `${past.length} ${kind} ${past.length === 1 ? 'shift' : 'shifts'} in ${MONTHS[month.getMonth()]}`,
  };
}
