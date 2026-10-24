// A time or date input with its icon inside on the right and the value centred.
// Tapping anywhere on the field (the icon lets taps through) opens the picker.

import { el } from '../dom.js';
import { icon } from '../icons.js';

// span: grid columns the field takes (2 or 4); iconName: 'clock' or 'calendar'.
export function pickerField(input, { span = 2, iconName = 'clock' } = {}) {
  input.classList.add('picker-input');
  input.addEventListener('click', () => {
    try {
      input.showPicker?.();
    } catch {
      // The browser opens its own picker (or doesn't allow showPicker here).
    }
  });
  return el('div', { class: `picker-field span-${span}` }, [
    input,
    el('span', { class: 'picker-icon', 'aria-hidden': 'true' }, [icon(iconName)]),
  ]);
}
