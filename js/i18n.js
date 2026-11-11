// Language: English, German or Spanish. No HTML built here, but it sets the shell's static text.
// t(key, params) returns the current language's string, with {name} placeholders filled in; an
// entry { one, other } is picked by params.count. Missing keys fall back to English, then the key.
// The choice is saved in settings; before the first choice, the phone's language decides (de / es,
// else en). Changing it re-runs the current route so every screen is redrawn.

import en from './strings/en.js';
import de from './strings/de.js';
import es from './strings/es.js';
import { getSettings, updateSettings } from './storage.js';

const DICTS = { en, de, es };
export const LANGUAGES = Object.keys(DICTS); // in the order the header button cycles through

function deviceLanguage() {
  const wanted = (navigator.languages || [navigator.language || 'en']).map((l) => l.slice(0, 2).toLowerCase());
  return wanted.find((l) => LANGUAGES.includes(l)) || 'en';
}

export function getLanguage() {
  const saved = getSettings().language;
  return LANGUAGES.includes(saved) ? saved : deviceLanguage();
}

export function t(key, params = {}) {
  let text = DICTS[getLanguage()][key] ?? en[key] ?? key;
  if (Array.isArray(text)) return text;
  if (typeof text === 'object') text = params.count === 1 ? text.one : text.other;
  return text.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
}

// The shell's static text: <html lang>, the tab labels and the header's language button.
export function applyLanguage() {
  const lang = getLanguage();
  document.documentElement.lang = lang;
  for (const name of ['home', 'calendar', 'pay']) {
    const tab = document.querySelector(`.app-tabbar .tab[href="#/${name}"]`);
    if (tab) tab.textContent = t(`tab.${name}`);
  }
  const button = document.querySelector('.lang-button');
  if (button) {
    button.textContent = lang.toUpperCase();
    button.setAttribute('aria-label', t('lang.label', { name: t('lang.name') }));
  }
}

export function setLanguage(code) {
  if (!LANGUAGES.includes(code)) return;
  updateSettings({ language: code });
  applyLanguage();
  window.dispatchEvent(new Event('hashchange')); // the router redraws the current screen
}

// Header button: each tap moves to the next language.
export function initLanguage() {
  applyLanguage();
  document.querySelector('.lang-button')?.addEventListener('click', () => {
    const next = LANGUAGES[(LANGUAGES.indexOf(getLanguage()) + 1) % LANGUAGES.length];
    setLanguage(next);
  });
}
