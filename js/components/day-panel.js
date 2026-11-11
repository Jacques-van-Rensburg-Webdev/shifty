// A day's shift: day card, Add or Edit / Delete, then the logging rows: Started, the bar row,
// Ended and Tips. A meeting has no bar row and no tips. On Home the rows are always shown; on the
// Calendar they are collapsed and the Edit button opens them (with an "Edit shift details" button
// for the shift form). Returns grid children (each carries its own span).

import { el } from '../dom.js';
import { icon } from '../icons.js';
import { formatLongDay, fromKey } from '../dates.js';
import { hasEnd, hasTips, shiftMinutes, typeName } from '../shifts.js';
import { formatEuro, formatHours, formatTimeRange } from '../format.js';
import { getShift, getShifts, removeShift, updateShift } from '../storage.js';
import { estimateTips } from '../tips-estimate.js';
import { formatAmountInput, parseAmount } from '../amount.js';
import { clearDraft, clearDrafts, getDraft, setDraft } from '../drafts.js';
import { t } from '../i18n.js';
import { shiftBadge } from './shift-badge.js';
import { barRow, endedRow, startedRow } from './time-rows.js';

const fieldLabel = (id, text) => el('label', { class: 'field-label span-4', for: id, text });

const shiftStatus = (shift) => {
  if (shift.completed) return t('status.completed');
  return shift.started ? t('status.started') : t('status.planned');
};

function dayCard(key, shift, todayKey, showDate) {
  const estimate = shift && estimateTips(getShifts(), key, shift);
  const details = shift
    ? [
      el('div', { class: 'day-shift' }, [
        shiftBadge(key, shift, todayKey),
        el('span', { class: 'day-shift-text' }, [
          el('span', { class: 'week-type', text: typeName(shift.type) }),
          el('span', { class: 'day-shift-time', text: formatTimeRange(shift) }),
        ]),
        el('span', { class: 'day-shift-meta' }, [
          hasEnd(shift) && el('span', { class: 'day-shift-length', text: formatHours(shiftMinutes(shift)) }),
          el('span', { class: 'day-shift-status', text: shiftStatus(shift) }),
        ]),
      ]),
      shift.tips > 0 && el('span', { class: 'day-shift-extra', text: t('day.tips', { amount: formatEuro(shift.tips) }) }),
      shift.barOpen && el('span', { class: 'day-shift-extra', text: t('day.barOpened', { time: shift.barOpen }) }),
      shift.barClose && el('span', { class: 'day-shift-extra', text: t('day.barClosed', { time: shift.barClose }) }),
      estimate && el('span', {
        class: 'day-shift-extra',
        text: t('day.estimatedTips', { amount: formatEuro(estimate.amount), source: estimate.label }),
      }),
    ]
    : [el('span', { class: 'day-card-off', text: t('day.noShift') })];

  return el('div', { class: 'day-card span-4' }, [
    showDate && el('span', { class: 'day-card-date', text: formatLongDay(fromKey(key)) }),
    ...details,
  ]);
}

const editHash = (key, back) => `#/shift/edit/${key}${back}`;

// from: the screen the shift form returns to ('home'); the Calendar by default.
// collapsed: { open, onToggle } makes Edit open and close the logging rows instead of the form.
function actions(key, shift, onChange, from, collapsed) {
  const back = from ? `/${from}` : '';
  if (!shift) {
    return [el('button', {
      type: 'button',
      class: 'button button-primary button-block span-4',
      text: t('actions.add'),
      onClick: () => { window.location.hash = `#/shift/new/${key}${back}`; },
    })];
  }
  const edit = collapsed
    ? el('button', {
      type: 'button',
      class: 'button button-edit button-block span-2',
      'aria-label': t('actions.edit'),
      'aria-pressed': String(collapsed.open),
      'aria-expanded': String(collapsed.open),
      'data-focus-key': 'edit-toggle',
      onClick: collapsed.onToggle,
    }, [icon('edit')])
    : el('button', {
      type: 'button',
      class: 'button button-edit button-block span-2',
      'aria-label': t('actions.edit'),
      onClick: () => { window.location.hash = editHash(key, back); },
    }, [icon('edit')]);
  return [
    edit,
    el('button', {
      type: 'button',
      class: 'button button-delete button-block span-2',
      'aria-label': t('actions.delete'),
      onClick: () => {
        if (!window.confirm(t('actions.deleteConfirm'))) return;
        removeShift(key);
        clearDrafts(key);
        onChange();
      },
    }, [icon('delete')]),
  ];
}

// The field shows the saved tips and the button sets them to the amount entered (it doesn't add).
// "Add tips" until tips are saved, then "Edit tips". An empty field or 0 removes the tips.
// A comma or a dot works for cents ("12,50"). An amount typed but not saved yet is kept as a draft.
function tipsRow(key, shift, onChange) {
  const saved = shift?.tips || 0;
  const draft = shift ? getDraft(key, 'tips') : null;
  const input = el('input', {
    id: 'tips-amount', type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: t('placeholder.amount'),
    class: 'input field-input span-2', disabled: !shift,
    value: draft ?? (saved > 0 ? formatAmountInput(saved, 2) : ''),
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
    text: saved > 0 ? t('tips.edit') : t('tips.add'),
    onClick: () => {
      if (!canSave()) return;
      clearDraft(key, 'tips');
      updateShift(key, { tips: entered() });
      onChange();
    },
  });
  button.disabled = !shift || !canSave();
  input.addEventListener('input', () => {
    setDraft(key, 'tips', input.value);
    button.disabled = !shift || !canSave();
  });
  return [fieldLabel('tips-amount', t('tips.label')), input, button];
}

// Started and Ended show the current time until they're logged.
// collapsed: { open, onToggle } (Calendar) hides the logging rows until Edit is tapped; the opened
// rows end with an "Edit shift details" button for the shift form. Without it (Home), the rows
// are always shown and Edit opens the form.
// live: fill the bar row with the current time (today by default).
// showDate: show the date in the day card. from: where the shift form returns to.
export function renderDayPanel({
  key, todayKey, heading, onChange, from, collapsed = null, showDate = true, live = key === todayKey,
}) {
  const shift = getShift(key);
  const showRows = !collapsed || (collapsed.open && shift);
  const rows = showRows
    ? [
      ...startedRow(key, shift, onChange),
      ...barRow(key, shift, live, onChange),
      ...endedRow(key, shift, onChange),
      ...(!shift || hasTips(shift) ? tipsRow(key, shift, onChange) : []),
      collapsed && el('button', {
        type: 'button',
        class: 'button button-block span-4',
        text: t('actions.editDetails'),
        onClick: () => { window.location.hash = editHash(key, from ? `/${from}` : ''); },
      }),
    ]
    : [];
  return [
    el('h3', { class: 'group-label span-4', text: heading }),
    dayCard(key, shift, todayKey, showDate),
    ...actions(key, shift, onChange, from, collapsed),
    ...rows,
  ];
}
