// Estimated tips for a shift that isn't completed yet. No HTML here.
// The average tips per shift of last month's shifts on the same weekday (see past-shifts.js).
// Shifts are scheduled with a start time only, so there is no planned length to scale by.

import { hasTips } from './shifts.js';
import { pastShifts } from './past-shifts.js';

// -> { amount, count, label } e.g. label "average of 4 Thursday closing shifts in September", or null.
export function estimateTips(shifts, key, shift) {
  if (shift.completed || !hasTips(shift)) return null;
  const past = pastShifts(shifts, key, shift);
  if (!past) return null;

  const perShift = past.shifts.reduce((sum, s) => sum + (s.tips || 0), 0) / past.shifts.length;
  return {
    amount: Math.round(perShift * 100) / 100,
    count: past.shifts.length,
    label: `average of ${past.label}`,
  };
}
