// Add / edit shift: #/shift/new/<date> and #/shift/edit/<date>, plus /home to return to Home.
// One shift per day. No tab bar on this screen.
// A shift is scheduled with its start time only; the end is logged with End on the day panel.
// A completed shift also shows End here, so a wrong end time can be fixed.

import { el } from '../dom.js';
import { isValidKey } from '../dates.js';
import { SHIFT_TYPES, endsNextDay, shiftMinutes } from '../shifts.js';
import { formatHours } from '../format.js';
import { getShift, removeShift, setShift } from '../storage.js';
import { selectDay } from './calendar.js';
import { pickerField } from '../components/picker-field.js';

export const tab = 'calendar';
export const hideTabbar = true;

const NEW_SHIFT = { end: null, started: false, completed: false, plannedStart: null, plannedEnd: null, barClose: null, tips: 0 };

const fieldLabel = (id, text, span) => el('label', { class: `field-label span-${span}`, for: id, text });

export function render(container, [mode, key, from] = []) {
  const back = () => { window.location.hash = from === 'home' ? '#/home' : '#/calendar'; };
  const isEdit = mode === 'edit';
  const existing = isValidKey(key) ? getShift(key) : null;
  if (!['new', 'edit'].includes(mode) || !isValidKey(key) || (isEdit && !existing)) {
    window.location.replace(from === 'home' ? '#/home' : '#/calendar');
    return;
  }

  const dateInput = el('input', { id: 'shift-date', type: 'date', class: 'input field-input', value: key });
  const typeSelect = el('select', { id: 'shift-type', class: 'input field-input span-4' },
    Object.entries(SHIFT_TYPES).map(([code, name]) => el('option', {
      value: code, text: name, selected: (existing?.type ?? 'C') === code,
    })));
  const startInput = el('input', { id: 'shift-start', type: 'time', class: 'input field-input', value: existing?.start });
  const withEnd = Boolean(existing?.completed);
  const endInput = withEnd && el('input', { id: 'shift-end', type: 'time', class: 'input field-input', value: existing.end });
  const hint = el('p', { class: 'form-hint span-4', 'aria-live': 'polite' });
  const save = el('button', { type: 'submit', class: 'button button-primary button-block span-2 mt-1', text: 'Save' });

  // Shows the shift length, or why it can't be saved yet.
  const check = () => {
    const date = dateInput.value;
    const shift = { start: startInput.value, end: withEnd ? endInput.value : null };
    let message;
    if (!isValidKey(date) || !shift.start || (withEnd && !shift.end)) {
      message = withEnd ? 'Fill in the date, start and end.' : 'Fill in the date and start time.';
    } else if (withEnd && shift.start === shift.end) message = "Start and end can't be the same.";
    else if (getShift(date) && !(isEdit && date === key)) message = 'There is already a shift on that day.';
    const ok = !message;
    let summary = 'The end time is logged with End on the day.';
    if (withEnd) summary = `${formatHours(shiftMinutes(shift))}${endsNextDay(shift) ? ', ends next day' : ''}`;
    hint.textContent = ok ? summary : message;
    save.disabled = !ok;
    return ok;
  };

  const submit = (event) => {
    event.preventDefault();
    if (!check()) return;
    const date = dateInput.value;
    if (isEdit && date !== key) removeShift(key);
    setShift(date, {
      ...(existing || NEW_SHIFT),
      type: typeSelect.value,
      start: startInput.value,
      end: withEnd ? endInput.value : null,
    });
    selectDay(date);
    back();
  };

  container.append(el('form', { class: 'grid', novalidate: true, onSubmit: submit, onInput: check, onChange: check }, [
    el('h2', { class: 'section-title span-4', text: isEdit ? 'Edit shift' : 'Add shift' }),
    fieldLabel('shift-date', 'Date', 4), pickerField(dateInput, { span: 4, iconName: 'calendar' }),
    fieldLabel('shift-type', 'Type', 4), typeSelect,
    ...(withEnd
      ? [fieldLabel('shift-start', 'Start', 2), fieldLabel('shift-end', 'End', 2), pickerField(startInput), pickerField(endInput)]
      : [fieldLabel('shift-start', 'Start', 4), pickerField(startInput, { span: 4 })]),
    hint,
    el('button', { type: 'button', class: 'button button-block span-2 mt-1', text: 'Cancel', onClick: back }),
    save,
  ]));
  check();
}
