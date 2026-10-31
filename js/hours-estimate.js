// Estimated length of a shift that isn't completed yet. No HTML here.
// A shift with a planned end uses that; otherwise the average length of last month's shifts on the
// same weekday (see past-shifts.js).

import { hasEnd, shiftMinutes } from './shifts.js';
import { pastShifts } from './past-shifts.js';

// -> { minutes, label } e.g. label "average of 4 Friday closing shifts in October", or null.
export function estimateMinutes(shifts, key, shift) {
  if (shift.completed) return null;
  if (hasEnd(shift)) return { minutes: shiftMinutes(shift), label: 'planned end' };
  const past = pastShifts(shifts, key, shift);
  if (!past) return null;

  const average = past.shifts.reduce((sum, s) => sum + shiftMinutes(s), 0) / past.shifts.length;
  return { minutes: Math.round(average), label: `average of ${past.label}` };
}
