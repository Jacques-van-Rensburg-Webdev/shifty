// Label, amount input (columns 1–2) and save button (columns 3–4).
// The input is a text field with the decimal pad, so a comma works for cents ("14,50").
// The button is enabled only when the value is valid and different from the saved one.
// decimals: how the saved value is shown in the field (2 for euros; null shows it as is, e.g. "2,5").

import { el } from '../dom.js';
import { formatAmountInput, parseAmount } from '../amount.js';

export function saveField({ id, label, value, buttonText, isValid, onSave, decimals = 2, placeholder = '0,00' }) {
  const input = el('input', {
    id, type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder,
    class: 'input field-input span-2', value: formatAmountInput(value, decimals),
  });
  const canSave = () => {
    const amount = parseAmount(input.value);
    return Number.isFinite(amount) && isValid(amount) && amount !== value;
  };
  const button = el('button', {
    type: 'button',
    class: 'button button-primary button-compact button-block span-2',
    'data-focus-key': `save-${id}`,
    disabled: true,
    text: buttonText,
    onClick: () => { if (canSave()) onSave(parseAmount(input.value)); },
  });
  input.addEventListener('input', () => { button.disabled = !canSave(); });

  return [el('label', { class: 'field-label span-4', for: id, text: label }), input, button];
}
