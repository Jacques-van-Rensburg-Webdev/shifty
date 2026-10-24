// The day panel's time rows: Started (Start), Ended (End), and Bar opened at or Bar closed at.
// Each returns grid children: a label (columns 1–4), a time field (1–2) and a button (3–4).

import { el } from '../dom.js';
import { updateShift } from '../storage.js';
import { barKind } from '../shifts.js';
import { currentTime, keepCurrent } from '../live-time.js';
import { pickerField } from './picker-field.js';

const fieldLabel = (id, text) => el('label', { class: 'field-label span-4', for: id, text });

// A time field that shows the logged time, or the current time (kept up to date) until it's logged.
function timeInput(id, shift, logged, loggedValue) {
  const live = Boolean(shift) && !logged;
  const input = el('input', {
    id, type: 'time', class: 'input field-input',
    value: live ? currentTime() : loggedValue, disabled: !shift || logged,
  });
  if (live) keepCurrent(input);
  return input;
}

// Start logs the real start time (the scheduled start is kept). Tapping Started undoes it.
export function startedRow(key, shift, onChange) {
  const started = Boolean(shift?.started);
  const input = timeInput('start-time', shift, started, shift?.start);
  // Start can't equal the end of an ended shift (that would count as 24 hours).
  const canStart = () => Boolean(input.value) && input.value !== shift.end;
  const button = el('button', {
    type: 'button',
    class: 'button button-complete button-compact button-block span-2',
    'aria-pressed': String(started),
    'data-focus-key': 'log-start',
    disabled: !shift || (!started && !canStart()),
    text: started ? 'Started' : 'Start',
    onClick: () => {
      if (started) {
        updateShift(key, { started: false, start: shift.plannedStart ?? shift.start, plannedStart: null });
      } else {
        if (!canStart()) return;
        updateShift(key, { started: true, plannedStart: shift.plannedStart ?? shift.start, start: input.value });
      }
      onChange();
    },
  });
  if (shift && !started) input.addEventListener('input', () => { button.disabled = !canStart(); });
  return [fieldLabel('start-time', 'Started'), pickerField(input), button];
}

// End sets the end time and completes the shift (any planned end is kept). Tapping Ended undoes it.
export function endedRow(key, shift, onChange) {
  const completed = Boolean(shift?.completed);
  const input = timeInput('finish-time', shift, completed, shift?.end);
  // End can't equal the start (that would count as 24 hours).
  const canEnd = () => Boolean(input.value) && input.value !== shift.start;
  const button = el('button', {
    type: 'button',
    class: 'button button-complete button-compact button-block span-2',
    'aria-pressed': String(completed),
    'data-focus-key': 'log-complete',
    disabled: !shift || (!completed && !canEnd()),
    text: completed ? 'Ended' : 'End',
    onClick: () => {
      if (completed) {
        updateShift(key, { completed: false, end: shift.plannedEnd ?? null, plannedEnd: null });
      } else {
        if (!canEnd()) return;
        updateShift(key, { completed: true, plannedEnd: shift.plannedEnd ?? shift.end ?? null, end: input.value });
      }
      onChange();
    },
  });
  if (shift && !completed) input.addEventListener('input', () => { button.disabled = !canEnd(); });
  return [fieldLabel('finish-time', 'Ended'), pickerField(input), button];
}

// Bar opened at (Opening) or Bar closed at (Closing, Other); a meeting has neither.
const BAR_ROWS = {
  open: { field: 'barOpen', label: 'Bar opened at', log: 'Log bar open', update: 'Update open' },
  close: { field: 'barClose', label: 'Bar closed at', log: 'Log bar close', update: 'Update close' },
};

// Shows the saved bar time; if none yet, the current time when live (today), otherwise the
// shift's start (bar open) or end (bar close).
export function barRow(key, shift, isLive, onChange) {
  const kind = barKind(shift?.type ?? 'C');
  if (!kind) return [];
  const row = BAR_ROWS[kind];
  const saved = shift?.[row.field];
  const fallback = kind === 'open' ? shift?.start : shift?.end;
  const live = Boolean(shift) && !saved && isLive;
  const input = el('input', {
    id: 'bar-time', type: 'time', class: 'input field-input',
    value: live ? currentTime() : shift && (saved || fallback), disabled: !shift,
  });
  if (live) keepCurrent(input);
  const button = el('button', {
    type: 'button',
    class: 'button button-primary button-compact button-block span-2',
    'data-focus-key': 'bar-time',
    disabled: !shift,
    text: saved ? row.update : row.log,
    onClick: () => {
      const time = input.value || fallback;
      if (!time) return;
      updateShift(key, { [row.field]: time });
      onChange();
    },
  });
  return [fieldLabel('bar-time', row.label), pickerField(input), button];
}
