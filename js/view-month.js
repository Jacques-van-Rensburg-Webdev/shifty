// The month shown on the Pay tab, kept in memory while you switch tabs.
// Opens on the current month.

import { startOfMonth, today } from './dates.js';

let month = null;

export function getViewMonth() {
  if (!month) month = startOfMonth(today());
  return month;
}

export function setViewMonth(date) {
  month = startOfMonth(date);
}
