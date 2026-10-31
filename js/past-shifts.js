// The completed shifts a planned shift is estimated from. No HTML here.
// Every completed shift on the same weekday (all months, this one included) of the same type, or of
// any type on that weekday if there are none. Meetings are only compared with meetings, and other
// shifts never with meetings.

import { DAYS, fromKey } from './dates.js';
import { SHIFT_TYPES } from './shifts.js';

// -> { shifts, label } e.g. label "12 Friday closing shifts", or null.
export function pastShifts(shifts, key, shift) {
  const weekday = fromKey(key).getDay();
  const isMeeting = shift.type === 'M';

  const candidates = Object.entries(shifts)
    .filter(([k, s]) => s.completed && fromKey(k).getDay() === weekday && (s.type === 'M') === isMeeting)
    .map(([, s]) => s);
  let past = candidates.filter((s) => s.type === shift.type);
  const sameType = past.length > 0;
  if (!sameType) past = candidates;
  if (!past.length) return null;

  const kind = sameType ? `${DAYS[weekday]} ${SHIFT_TYPES[shift.type].toLowerCase()}` : DAYS[weekday];
  return { shifts: past, label: `${past.length} ${kind} ${past.length === 1 ? 'shift' : 'shifts'}` };
}
