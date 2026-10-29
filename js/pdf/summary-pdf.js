// The month / week summary as a PDF file: title with the red / dark-red rule, the date it was
// made, the "So far" totals and a table of the shifts (continued on more pages if needed, with
// the column heads repeated). No HTML here. Colours are the app's ink, red and dark red.

import { createPdf, PAGE } from './pdf-writer.js';
import { formatLongDay, formatShortDay, fromKey, today } from '../dates.js';
import { SHIFT_TYPES, hasEnd, shiftMinutes, totals } from '../shifts.js';
import { formatEuro, formatHours, formatTimeRange } from '../format.js';

const INK = '#16161a';
const RED = '#d61c1c';
const RED_DARK = '#990000';
const MUTED = '#4d4d4d';
const RULE = '#a3a3a3';

const MARGIN = 45; // 16 mm
const RIGHT = PAGE.width - MARGIN;
const ROW = 18;
const BOTTOM = PAGE.height - MARGIN - 20; // room for the footer

// Shift table columns: [heading, x]
const COLUMNS = [['Date', 0], ['Type', 72], ['Time', 132], ['Length', 210], ['Status', 262], ['Tips', 330], ['Bar', 400]];

// "open 11:20", "close 01:30" or "–".
function barText(shift) {
  if (shift.barOpen) return `open ${shift.barOpen}`;
  return shift.barClose ? `close ${shift.barClose}` : '–';
}

const status = (shift) => {
  if (shift.completed) return 'Completed';
  return shift.started ? 'Started' : 'Planned';
};

function shiftCells(key, shift) {
  return [
    formatShortDay(fromKey(key)),
    SHIFT_TYPES[shift.type],
    formatTimeRange(shift),
    hasEnd(shift) ? formatHours(shiftMinutes(shift)) : '–',
    status(shift),
    shift.tips > 0 ? formatEuro(shift.tips) : '–',
    barText(shift),
  ];
}

// title: "October 2026" or "19 Oct – 25 Oct 2026". Returns the file's bytes.
export function buildSummaryPdf({ title, firstKey, lastKey, todayKey, shifts, emptyText }) {
  const pdf = createPdf();
  const fullTitle = `SHIFTY – ${title}`.toUpperCase();
  let page = pdf.addPage();
  let y = MARGIN;

  // ---------- Title, rule, made date
  y += 22;
  page.text(MARGIN, y, fullTitle, { size: 20, bold: true, color: INK });
  y += 10;
  page.rect(MARGIN, y, RIGHT - MARGIN, 4, RED);
  page.rect(MARGIN, y + 4, RIGHT - MARGIN, 4, RED_DARK);
  y += 22;
  const made = today();
  page.text(MARGIN, y, `Made ${formatLongDay(made)} ${made.getFullYear()}`, { size: 9, color: MUTED });

  const heading = (text) => {
    y += 30;
    page.text(MARGIN, y, text.toUpperCase(), { size: 13, bold: true, color: INK });
    y += 8;
  };

  // ---------- So far
  heading('So far');
  const t = totals(shifts, firstKey, lastKey, todayKey);
  [['Hours worked', formatHours(t.minutes)], ['Shifts', String(t.count)], ['Tips earned', formatEuro(t.tips)],
    ['Non-tip hours', formatHours(t.nonTip)]].forEach(([label, value]) => {
    y += ROW;
    page.text(MARGIN, y - 5, label, { size: 10, bold: true, color: INK });
    page.text(MARGIN + 240, y - 5, value, { size: 10, color: INK, align: 'right' });
    page.line(MARGIN, y, MARGIN + 240, y, { color: RULE });
  });
  y += 16;
  page.text(MARGIN, y, 'Hours and shifts count completed shifts up to today; tips count as soon as they are added.', { size: 8, color: MUTED });

  // ---------- Shifts
  heading('Shifts');
  const entries = Object.entries(shifts)
    .filter(([key]) => key >= firstKey && key <= lastKey)
    .sort(([a], [b]) => a.localeCompare(b));

  const tableHead = () => {
    y += ROW;
    COLUMNS.forEach(([name, x]) => page.text(MARGIN + x, y - 5, name.toUpperCase(), { size: 8, bold: true, color: INK }));
    page.line(MARGIN, y, RIGHT, y, { width: 1, color: INK });
  };

  if (!entries.length) {
    y += ROW;
    page.text(MARGIN, y, emptyText, { size: 10, color: INK });
  } else {
    tableHead();
    entries.forEach(([key, shift]) => {
      if (y + ROW > BOTTOM) {
        page = pdf.addPage();
        y = MARGIN + 10;
        page.text(MARGIN, y, `${fullTitle} (continued)`, { size: 9, bold: true, color: MUTED });
        y += 8;
        tableHead();
      }
      y += ROW;
      shiftCells(key, shift).forEach((text, i) => page.text(MARGIN + COLUMNS[i][1], y - 5, text, { size: 9, color: INK }));
      page.line(MARGIN, y, RIGHT, y, { color: RULE });
    });
  }

  return { bytes: pdf.toBytes(), pages: pdf.pageCount() };
}
