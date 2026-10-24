// Display formats: decimal comma, euro amounts, shift times.

const EURO = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// Exact hours and minutes: 90 -> "1:30 h", 390 -> "6:30 h", 0 -> "0:00 h"
export function formatHours(minutes) {
  const total = Math.round(minutes);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')} h`;
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

// "18:00–02:00", or "18:00" for a shift that has no end yet.
export function formatTimeRange(shift) {
  return shift.end ? `${shift.start}–${shift.end}` : shift.start;
}
