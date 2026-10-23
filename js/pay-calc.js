// Estimated pay for a month from its completed shifts. No HTML here.
// Base pay = completed hours × rate; deductions on base pay; tips (completed shifts) less the tips deduction.

import { nonTipMinutes, shiftMinutes } from './shifts.js';
import { deductions } from './deductions.js';

const round2 = (v) => Math.round(v * 100) / 100;

export function monthPay(shifts, firstKey, lastKey, { rate, tipPercent }) {
  const rows = Object.entries(shifts)
    .filter(([key, shift]) => key >= firstKey && key <= lastKey && shift.completed)
    .sort(([a], [b]) => a.localeCompare(b));

  let minutes = 0;
  let tips = 0;
  let nonTip = 0;
  for (const [, shift] of rows) {
    minutes += shiftMinutes(shift);
    tips += shift.tips || 0;
    nonTip += nonTipMinutes(shift);
  }

  const base = round2((minutes / 60) * rate);
  const baseDeductions = deductions(base);
  const netBase = round2(base - baseDeductions.total);
  const tipDeduction = round2((tips * tipPercent) / 100);
  const tipsNet = round2(tips - tipDeduction);

  return {
    rows,
    minutes,
    nonTip,
    base,
    deductions: baseDeductions,
    netBase,
    tips: round2(tips),
    tipDeduction,
    tipsNet,
    total: rate ? round2(netBase + tipsNet) : tipsNet,
  };
}
