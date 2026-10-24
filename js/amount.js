// Amounts typed by hand. No HTML here.
// Money fields are text fields with the decimal pad (inputmode="decimal"), because Safari's
// number fields reject the comma that a German iPhone keypad shows.

// "12,50" or "12.50" -> 12.5; "1.171,60" or "1,171.60" -> 1171.6; spaces and "€" are ignored.
// The last separator is the decimal point when 1–2 digits follow it; earlier separators must be
// thousands groups of 3 digits, all the same character. Anything else -> NaN.
export function parseAmount(text) {
  const v = String(text ?? '').replace(/[\s€]/g, '');
  if (!/^\d[\d.,]*\d$|^\d$/.test(v)) return NaN;

  const last = Math.max(v.lastIndexOf(','), v.lastIndexOf('.'));
  if (last === -1) return Number(v);

  const tail = v.slice(last + 1);
  let whole = v;
  let decimals = '';
  if (tail.length <= 2) {
    whole = v.slice(0, last);
    decimals = tail;
  } else if (tail.length !== 3) {
    return NaN;
  }

  const separators = whole.match(/[.,]/g) || [];
  if (separators.length) {
    const decimalSeparator = decimals ? v[last] : null;
    if (new Set(separators).size > 1 || separators[0] === decimalSeparator) return NaN;
    if (!/^\d{1,3}([.,]\d{3})+$/.test(whole)) return NaN;
  }
  return Number(whole.replace(/[.,]/g, '') + (decimals ? `.${decimals}` : ''));
}

// A saved number shown in a field with a comma: (14.5, 2) -> "14,50"; (2.5) -> "2,5"; null -> "".
export function formatAmountInput(value, decimals = null) {
  if (value == null) return '';
  const text = decimals == null ? String(value) : value.toFixed(decimals);
  return text.replace('.', ',');
}
