// Values typed into the day panel's fields but not saved with their button yet. No HTML here.
// Kept in localStorage per day, so they survive redraws, tab changes and the app being closed.
// Drafts: { 'YYYY-MM-DD': { start, end, bar, tips } } (each the field's text as typed).

const DRAFTS_KEY = 'shifty-drafts';

let drafts = null;

function load() {
  if (drafts) return drafts;
  try {
    const data = JSON.parse(localStorage.getItem(DRAFTS_KEY) || '{}');
    drafts = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    drafts = {};
  }
  return drafts;
}

function persist() {
  try {
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } catch {
    // Storage unavailable: drafts last for this session only.
  }
}

// The typed value, or null if there is none.
export function getDraft(key, field) {
  return load()[key]?.[field] ?? null;
}

export function setDraft(key, field, value) {
  load();
  drafts[key] = { ...drafts[key], [field]: value };
  persist();
}

export function clearDraft(key, field) {
  if (!load()[key] || !(field in drafts[key])) return;
  const { [field]: _removed, ...rest } = drafts[key];
  if (Object.keys(rest).length) drafts[key] = rest;
  else delete drafts[key];
  persist();
}

export function clearDrafts(key) {
  if (!load()[key]) return;
  delete drafts[key];
  persist();
}
