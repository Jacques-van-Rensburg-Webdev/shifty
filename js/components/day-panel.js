// A day's shift: day card, Add or Edit / Delete, then Started, Ended, the bar row and Tips.
// A meeting has no bar row and no tips.
// Returns grid children (each carries its own span). Used by the Calendar and Home.

import { el } from '../dom.js';
import { icon } from '../icons.js';
import { formatLongDay, fromKey } from '../dates.js';
import { SHIFT_TYPES, hasEnd, hasTips, shiftMinutes } from '../shifts.js';
import { formatEuro, formatHours, formatTimeRange } from '../format.js';
import { getShift, getShifts, removeShift, updateShift } from '../storage.js';
import { estimateTips } from '../tips-estimate.js';
import { formatAmountInput, parseAmount } from '../amount.js';
import { shiftBadge } from './shift-badge.js';
import { barRow, endedRow, startedRow } from './time-rows.js';

const fieldLabel = (id, text) => el('label', { class: 'field-label span-4', for: id, text });

const shiftStatus = (shift) => {
  if (shift.completed) return 'Completed';
  return shift.started ? 'Started' : 'Planned';
};

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
          hasEnd(shift) && el('span', { class: 'day-shift-length', text: formatHours(shiftMinutes(shift)) }),
          el('span', { class: 'day-shift-status', text: shiftStatus(shift) }),
        ]),
      ]),
      shift.tips > 0 && el('span', { class: 'day-shift-extra', text: `Tips ${formatEuro(shift.tips)}` }),
      shift.barOpen && el('span', { class: 'day-shift-extra', text: `Bar opened ${shift.barOpen}` }),
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

// The field shows the saved tips and the button sets them to the amount entered (it doesn't add).
// "Add tips" until tips are saved, then "Edit tips". An empty field or 0 removes the tips.
// A comma or a dot works for cents ("12,50").
function tipsRow(key, shift, onChange) {
  const saved = shift?.tips || 0;
  const input = el('input', {
    id: 'tips-amount', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: '0,00',
    class: 'input field-input span-2', disabled: !shift, value: saved > 0 ? formatAmountInput(saved, 2) : '',
  });
  const entered = () => (input.value.trim() === '' ? 0 : Math.round(parseAmount(input.value) * 100) / 100);
  const canSave = () => {
    const amount = entered();
    return Number.isFinite(amount) && amount >= 0 && amount !== saved;
  };
  const button = el('button', {
    type: 'button',
    class: 'button button-primary button-compact button-block span-2',
    'data-focus-key': 'add-tips',
    disabled: true,
    text: saved > 0 ? 'Edit tips' : 'Add tips',
    onClick: () => {
      if (!canSave()) return;
      updateShift(key, { tips: entered() });
      onChange();
    },
  });
  input.addEventListener('input', () => { button.disabled = !shift || !canSave(); });
  return [fieldLabel('tips-amount', 'Tips (€)'), input, button];
}

// Started and Ended show the current time until they're logged.
// live: fill the bar row with the current time (today by default).
// showDate: show the date in the day card. from: where the shift form returns to.
export function renderDayPanel({ key, todayKey, heading, onChange, from, showDate = true, live = key === todayKey }) {
  const shift = getShift(key);
  return [
    el('h3', { class: 'group-label span-4', text: heading }),
    dayCard(key, shift, todayKey, showDate),
    ...actions(key, shift, onChange, from),
    ...startedRow(key, shift, onChange),
    ...endedRow(key, shift, onChange),
    ...barRow(key, shift, live, onChange),
    ...(!shift || hasTips(shift) ? tipsRow(key, shift, onChange) : []),
  ];
}
