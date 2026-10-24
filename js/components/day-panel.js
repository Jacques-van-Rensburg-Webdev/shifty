// A day's shift: day card, Add or Edit / Delete, then Finished at, Bar closed at and Tips.
// Returns grid children (each carries its own span). Used by the Calendar and Home.

import { el } from '../dom.js';
import { icon } from '../icons.js';
import { formatLongDay, fromKey } from '../dates.js';
import { SHIFT_TYPES, shiftMinutes } from '../shifts.js';
import { formatEuro, formatHours, formatTimeRange } from '../format.js';
import { getShift, getShifts, removeShift, updateShift } from '../storage.js';
import { estimateTips } from '../tips-estimate.js';
import { parseAmount } from '../amount.js';
import { currentTime, keepCurrent } from '../live-time.js';
import { shiftBadge } from './shift-badge.js';
import { pickerField } from './picker-field.js';

const fieldLabel = (id, text) => el('label', { class: 'field-label span-4', for: id, text });

function dayCard(key, shift, todayKey, showDate) {
  const estimate = shift && estimateTips(getShifts(), key, shift);
  const details = shift
    ? [
      el('div', { class: 'day-shift' }, [
        shiftBadge(key, shift, todayKey),
        el('span', { class: 'day-shift-text' }, [
          el('span', { class: 'week-type', text: SHIFT_TYPES[shift.type] }),
          el('span', { class: 'day-shift-time', text: formatTimeRange(shift) }),
        ]),
        el('span', { class: 'day-shift-meta' }, [
          el('span', { class: 'day-shift-length', text: formatHours(shiftMinutes(shift)) }),
          el('span', { class: 'day-shift-status', text: shift.completed ? 'Completed' : 'Planned' }),
        ]),
      ]),
      shift.tips > 0 && el('span', { class: 'day-shift-extra', text: `Tips ${formatEuro(shift.tips)}` }),
      shift.barClose && el('span', { class: 'day-shift-extra', text: `Bar closed ${shift.barClose}` }),
      estimate && el('span', { class: 'day-shift-extra day-shift-estimate' }, [
        el('span', { text: `Estimated tips ${formatEuro(estimate.amount)}` }),
        el('span', { text: estimate.label }),
      ]),
    ]
    : [el('span', { class: 'day-card-off', text: 'No shift' })];

  return el('div', { class: 'day-card span-4' }, [
    showDate && el('span', { class: 'day-card-date', text: formatLongDay(fromKey(key)) }),
    ...details,
  ]);
}

// from: the screen the shift form returns to ('home'); the Calendar by default.
function actions(key, shift, onChange, from) {
  const back = from ? `/${from}` : '';
  if (!shift) {
    return [el('button', {
      type: 'button',
      class: 'button button-primary button-block span-4',
      text: 'Add shift',
      onClick: () => { window.location.hash = `#/shift/new/${key}${back}`; },
    })];
  }
  return [
    el('button', {
      type: 'button',
      class: 'button button-edit button-block span-2',
      'aria-label': 'Edit shift',
      onClick: () => { window.location.hash = `#/shift/edit/${key}${back}`; },
    }, [icon('edit')]),
    el('button', {
      type: 'button',
      class: 'button button-delete button-block span-2',
      'aria-label': 'Delete shift',
      onClick: () => {
        if (!window.confirm('Delete this shift?')) return;
        removeShift(key);
        onChange();
      },
    }, [icon('delete')]),
  ];
}

// Log complete: the finish time becomes the end (planned end kept). Tapping Completed undoes it.
// When live (today), before completing, the field starts at the current time; otherwise at the shift's end.
function finishedRow(key, shift, isToday, onChange) {
  const completed = Boolean(shift?.completed);
  const live = Boolean(shift) && !completed && isToday;
  const input = el('input', {
    id: 'finish-time', type: 'time', class: 'input field-input',
    value: live ? currentTime() : shift?.end, disabled: !shift || completed,
  });
  if (live) keepCurrent(input);
  const button = el('button', {
    type: 'button',
    class: 'button button-complete button-compact button-block span-2',
    'aria-pressed': String(completed),
    'data-focus-key': 'log-complete',
    disabled: !shift,
    text: completed ? 'Completed' : 'Log complete',
    onClick: () => {
      if (completed) {
        updateShift(key, { completed: false, end: shift.plannedEnd ?? shift.end, plannedEnd: null });
      } else {
        updateShift(key, { completed: true, plannedEnd: shift.plannedEnd ?? shift.end, end: input.value || shift.end });
      }
      onChange();
    },
  });
  return [fieldLabel('finish-time', 'Finished at'), pickerField(input), button];
}

// Shows the saved bar close; if none yet, the current time today, otherwise the shift's end.
function barCloseRow(key, shift, isToday, onChange) {
  const live = Boolean(shift) && !shift.barClose && isToday;
  const input = el('input', {
    id: 'bar-close', type: 'time', class: 'input field-input',
    value: live ? currentTime() : shift && (shift.barClose || shift.end), disabled: !shift,
  });
  if (live) keepCurrent(input);
  const button = el('button', {
    type: 'button',
    class: 'button button-primary button-compact button-block span-2',
    'data-focus-key': 'bar-close',
    disabled: !shift,
    text: shift?.barClose ? 'Update close' : 'Log bar close',
    onClick: () => {
      updateShift(key, { barClose: input.value || shift.end });
      onChange();
    },
  });
  return [fieldLabel('bar-close', 'Bar closed at'), pickerField(input), button];
}

// Tips add up; the input clears after adding. A comma or a dot works for cents ("12,50").
function tipsRow(key, shift, onChange) {
  const input = el('input', {
    id: 'tips-amount', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '0,00',
    class: 'input field-input span-2', disabled: !shift,
  });
  const button = el('button', {
    type: 'button',
    class: 'button button-primary button-compact button-block span-2',
    'data-focus-key': 'add-tips',
    disabled: true,
    text: 'Add tips',
    onClick: () => {
      const amount = parseAmount(input.value);
      if (!(amount > 0)) return;
      updateShift(key, { tips: Math.round(((shift.tips || 0) + amount) * 100) / 100 });
      onChange();
    },
  });
  input.addEventListener('input', () => { button.disabled = !(parseAmount(input.value) > 0); });
  return [fieldLabel('tips-amount', 'Tips (€)'), input, button];
}

// live: fill Finished at / Bar closed at with the current time (today by default).
// showDate: show the date in the day card. from: where the shift form returns to.
export function renderDayPanel({ key, todayKey, heading, onChange, from, showDate = true, live = key === todayKey }) {
  const shift = getShift(key);
  return [
    el('h3', { class: 'group-label span-4', text: heading }),
    dayCard(key, shift, todayKey, showDate),
    ...actions(key, shift, onChange, from),
    ...finishedRow(key, shift, live, onChange),
    ...barCloseRow(key, shift, live, onChange),
    ...tipsRow(key, shift, onChange),
  ];
}
