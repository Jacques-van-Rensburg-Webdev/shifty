// Projected pay for a whole month: completed shifts at their real hours and tips, plus every other
// shift at its estimated hours (hours-estimate.js) and tips (tips entered, else tips-estimate.js).
// No HTML here.
// A shift with nothing to estimate from counts as 0 h and €0, and is counted in noEstimate.

import { hasTips, shiftMinutes } from './shifts.js';
import { estimateMinutes } from './hours-estimate.js';
import { estimateTips } from './tips-estimate.js';
import { payFor } from './pay-calc.js';

const round2 = (v) => Math.round(v * 100) / 100;

// -> { ...payFor(...), done: { minutes, tips }, toCome: { minutes, tips }, noEstimate,
//      upcoming: [{ key, shift, minutes, minutesLabel, tips, tipsLabel, gross, hasEstimate }] }
export function monthProjection(shifts, firstKey, lastKey, settings) {
  const inMonth = Object.entries(shifts)
    .filter(([key]) => key >= firstKey && key <= lastKey)
    .sort(([a], [b]) => a.localeCompare(b));

  const done = { minutes: 0, tips: 0 };
  const toCome = { minutes: 0, tips: 0 };
  const upcoming = [];
  for (const [key, shift] of inMonth) {
    if (shift.completed) {
      done.minutes += shiftMinutes(shift);
      done.tips += shift.tips || 0;
      continue;
    }
    const hours = estimateMinutes(shifts, key, shift);
    const tipsEstimate = shift.tips > 0 ? null : estimateTips(shifts, key, shift);
    const minutes = hours ? hours.minutes : 0;
    let tips = 0;
    let tipsLabel = null;
    if (shift.tips > 0) {
      tips = shift.tips;
      tipsLabel = 'tips entered';
    } else if (tipsEstimate) {
      tips = tipsEstimate.amount;
      tipsLabel = tipsEstimate.label;
    }
    toCome.minutes += minutes;
    toCome.tips += tips;
    upcoming.push({
      key,
      shift,
      minutes,
      minutesLabel: hours && hours.label,
      tips,
      tipsLabel,
      gross: round2((minutes / 60) * settings.rate + tips),
      hasEstimate: Boolean(hours) && (Boolean(tipsLabel) || !hasTips(shift)),
    });
  }

  done.tips = round2(done.tips);
  toCome.tips = round2(toCome.tips);
  return {
    ...payFor(done.minutes + toCome.minutes, done.tips + toCome.tips, settings),
    done,
    toCome,
    noEstimate: upcoming.filter((u) => !u.hasEstimate).length,
    upcoming,
  };
}
