// Data saved in localStorage on this device. If storage is blocked, changes still work for this session.
// Shifts, one per day: { 'YYYY-MM-DD': shift }.
// Settings: { rate, tipPercent, grossByMonth: { 'YYYY-MM': gross } }.

const SHIFTS_KEY = 'shifty-shifts';
const SETTINGS_KEY = 'shifty-settings';
const DEFAULT_SETTINGS = { rate: 0, tipPercent: 5, grossByMonth: {} };

let shifts = null;
let settings = null;

function load(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch {
    return {};
  }
}

function persist(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: changes last for this session only.
  }
}

// ---------- Shifts ----------

export function getShifts() {
  if (!shifts) shifts = load(SHIFTS_KEY);
  return shifts;
}

export function getShift(key) {
  return getShifts()[key] || null;
}

export function setShift(key, shift) {
  getShifts()[key] = shift;
  persist(SHIFTS_KEY, shifts);
}

export function updateShift(key, changes) {
  const shift = getShift(key);
  if (shift) setShift(key, { ...shift, ...changes });
}

export function removeShift(key) {
  delete getShifts()[key];
  persist(SHIFTS_KEY, shifts);
}

// ---------- Settings ----------

export function getSettings() {
  if (!settings) settings = { ...DEFAULT_SETTINGS, ...load(SETTINGS_KEY) };
  return settings;
}

export function updateSettings(changes) {
  settings = { ...getSettings(), ...changes };
  persist(SETTINGS_KEY, settings);
}
