// This week's tips (Monday–Sunday): earned so far, still expected, and the predicted total.
// No HTML here.
// - Earned: tips entered on this week's shifts, completed or not.
// - Expected: for each shift without tips that isn't completed, the same estimate the day panel
//   shows (tips-estimate.js). When there's nothing to estimate from, it adds nothing.
// - Meetings (no tips) are left out. A completed shift without tips counts as €0 earned.

import { addDays, startOfWeek, toKey } from './dates.js';
import { hasTips } from './shifts.js';
import { estimateTips } from './tips-estimate.js';

const round = (n) => Math.round(n * 100) / 100;

// -> { firstKey, lastKey, earned, expected, predicted, noEstimate,
//      rows: [{ key, shift, kind: 'earned' | 'estimate' | 'none', amount, label }] }
export function weekTips(shifts, date) {
  const first = startOfWeek(date);
  const firstKey = toKey(first);
  const lastKey = toKey(addDays(first, 6));
  const rows = Object.entries(shifts)
    .filter(([key, shift]) => key >= firstKey && key <= lastKey && hasTips(shift))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, shift]) => {
      if (shift.tips > 0 || shift.completed) return { key, shift, kind: 'earned', amount: shift.tips || 0 };
      const estimate = estimateTips(shifts, key, shift);
      return estimate
        ? { key, shift, kind: 'estimate', amount: estimate.amount, label: estimate.label }
        : { key, shift, kind: 'none', amount: 0 };
    });

  const sum = (kind) => round(rows.filter((r) => r.kind === kind).reduce((total, r) => total + r.amount, 0));
  const earned = sum('earned');
  const expected = sum('estimate');
  return {
    firstKey,
    lastKey,
    earned,
    expected,
    predicted: round(earned + expected),
    noEstimate: rows.filter((r) => r.kind === 'none').length,
    rows,
  };
}
