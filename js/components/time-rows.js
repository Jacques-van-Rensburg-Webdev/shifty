// The day panel's time rows: Started (Start), Ended (End), and Bar opened at or Bar closed at.
// Each returns grid children: a label (columns 1–4), a time field (1–2) and a button (3–4).
// A time typed but not saved yet is kept as a draft (see drafts.js) until its button saves it.

import { el } from '../dom.js';
import { updateShift } from '../storage.js';
import { barKind } from '../shifts.js';
import { currentTime, keepCurrent } from '../live-time.js';
import { clearDraft, getDraft, setDraft } from '../drafts.js';
import { pickerField } from './picker-field.js';

const fieldLabel = (id, text) => el('label', { class: 'field-label span-4', for: id, text });

// A time field for `field` of the day `key`. Shows, in order: the logged time (locked) once logged,
// a typed draft, or `fallback`; when there's no fallback, the current time (kept up to date).
function timeInput({ id, key, field, shift, logged, loggedValue, fallback = null }) {
  const draft = shift && !logged ? getDraft(key, field) : null;
  const live = Boolean(shift) && !logged && draft == null && fallback == null;
  let value = loggedValue;
  if (shift && !logged) value = draft ?? fallback ?? currentTime();
  const input = el('input', {
    id, type: 'time', class: 'input field-input', value, disabled: !shift || logged,
  });
  if (live) keepCurrent(input);
  if (shift && !logged) input.addEventListener('input', () => setDraft(key, field, input.value));
  return input;
}

// Saves `patch` and forgets the field's draft.
function save(key, field, patch) {
  clearDraft(key, field);
  updateShift(key, patch);
}

// Start logs the real start time (the scheduled start is kept). Tapping Started undoes it.
export function startedRow(key, shift, onChange) {
  const started = Boolean(shift?.started);
  const input = timeInput({ id: 'start-time', key, field: 'start', shift, logged: started, loggedValue: shift?.start });
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
        save(key, 'start', { started: true, plannedStart: shift.plannedStart ?? shift.start, start: input.value });
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
  const input = timeInput({ id: 'finish-time', key, field: 'end', shift, logged: completed, loggedValue: shift?.end });
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
        save(key, 'end', { completed: true, plannedEnd: shift.plannedEnd ?? shift.end ?? null, end: input.value });
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

// Shows a typed draft, else the saved bar time; if none yet, the current time when live (today),
// otherwise the shift's start (bar open) or end (bar close).
export function barRow(key, shift, isLive, onChange) {
  const kind = barKind(shift?.type ?? 'C');
  if (!kind) return [];
  const row = BAR_ROWS[kind];
  const saved = shift?.[row.field];
  const fallback = kind === 'open' ? shift?.start : shift?.end;
  const shown = saved || (isLive ? null : fallback);
  const input = timeInput({ id: 'bar-time', key, field: 'bar', shift, logged: false, fallback: shown ?? null });
  const button = el('button', {
    type: 'button',
    class: 'button button-primary button-compact button-block span-2',
    'data-focus-key': 'bar-time',
    disabled: !shift,
    text: saved ? row.update : row.log,
    onClick: () => {
      const time = input.value || fallback;
      if (!time) return;
      save(key, 'bar', { [row.field]: time });
      onChange();
    },
  });
  return [fieldLabel('bar-time', row.label), pickerField(input), button];
}
