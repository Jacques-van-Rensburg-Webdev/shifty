// Display formats: decimal comma, euro amounts, shift times.

const EURO = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// 390 minutes -> "6,5 h"
export function formatHours(minutes) {
  const hours = Math.round(minutes / 6) / 10;
  return `${String(hours).replace('.', ',')} h`;
}

// 2345.6 -> "€2.345,60"; -120 -> "−€120,00"
export function formatEuro(amount) {
  return amount < 0 ? `−€${EURO.format(-amount)}` : `€${EURO.format(amount)}`;
}

// A deduction: 98.76 -> "−€98,76"; nothing -> "€0,00"
export function formatMinusEuro(amount) {
  return amount > 0 ? `−${formatEuro(amount)}` : formatEuro(0);
}

// 5 -> "5 %", 14.6 -> "14,6 %"
export function formatPercent(value) {
  return `${String(value).replace('.', ',')} %`;
}

// "18:00–00:30"
export function formatTimeRange(shift) {
  return `${shift.start}–${shift.end}`;
}
