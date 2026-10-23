// Label, number input (columns 1–2) and save button (columns 3–4).
// The button is enabled only when the value is valid and different from the saved one.

import { el } from '../dom.js';

export function saveField({ id, label, value, buttonText, isValid, onSave, step = '0.01', min = '0', max, placeholder = '0.00' }) {
  const input = el('input', {
    id, type: 'number', inputmode: 'decimal', step, min, max, placeholder,
    class: 'input field-input span-2', value: value ?? '',
  });
  const canSave = () => input.value !== '' && isValid(Number(input.value)) && Number(input.value) !== value;
  const button = el('button', {
    type: 'button',
    class: 'button button-primary button-compact button-block span-2',
    'data-focus-key': `save-${id}`,
    disabled: true,
    text: buttonText,
    onClick: () => { if (canSave()) onSave(Number(input.value)); },
  });
  input.addEventListener('input', () => { button.disabled = !canSave(); });

  return [el('label', { class: 'field-label span-4', for: id, text: label }), input, button];
}
