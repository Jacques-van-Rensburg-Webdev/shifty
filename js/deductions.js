// German payroll deductions, employee share. AN ESTIMATE, ported exactly from the design.
// Fixed situation: tax class 4 (= class 1 tariff), no children, no church tax, 1,60 % Zusatzbeitrag.
// Example: gross 1.500,00 (Übergangsbereich) -> SV 282,10, LSt 15,08, net 1.202,82.
// No HTML here.

const MINI_LIMIT = 603;     // Minijob limit 2026 (G); up to this, no contributions
const MIDI_LIMIT = 2000;    // Upper end of the Übergangsbereich (O)
const MIDI_FACTOR = 0.6619; // Factor F for 2026

// Employee shares
const KV = 0.073;           // Health insurance, half of 14,60 %
const KV_EXTRA = 0.016;     // Half of the 3,20 % Zusatzbeitrag
const RV = 0.093;           // Pension, half of 18,60 %
const AV = 0.013;           // Unemployment, half of 2,60 %
const PV = 0.018;           // Care, half of 3,60 %
const PV_CHILDLESS = 0.006; // Childless surcharge, on the full SV-Brutto

const EMPLOYEE_ALLOWANCE = 1230; // Arbeitnehmer-Pauschbetrag (per year)
const SPECIAL_EXPENSES = 36;     // Sonderausgaben-Pauschbetrag (per year)

// Rate labels shown next to each line, matching the constants above.
export const RATE_LABELS = {
  kv: '14,60 + 3,20 %', rv: '18,60 %', av: '2,60 %', pv: '3,60 + 0,60 %', lst: '4 / 0,000 / 0,0',
};

const round2 = (v) => Math.round(v * 100) / 100;

// 2026 income tax (§32a EStG) on a yearly taxable income.
export function incomeTax2026(taxable) {
  const zvE = Math.floor(taxable);
  if (zvE <= 12348) return 0;
  if (zvE <= 17799) {
    const y = (zvE - 12348) / 10000;
    return Math.floor((914.51 * y + 1400) * y);
  }
  if (zvE <= 69878) {
    const z = (zvE - 17799) / 10000;
    return Math.floor((173.10 * z + 2397) * z + 1034.87);
  }
  if (zvE <= 277825) return Math.floor(0.42 * zvE - 11135.63);
  return Math.floor(0.45 * zvE - 19470.38);
}

// Monthly deductions for a monthly gross.
// band: 'none' (0), 'mini' (up to 603), 'midi' (Übergangsbereich, up to 2.000) or 'full'.
export function deductions(gross) {
  if (gross <= MINI_LIMIT) {
    return { band: gross > 0 ? 'mini' : 'none', svBase: 0, kv: 0, rv: 0, av: 0, pv: 0, sv: 0, lst: 0, total: 0, net: round2(gross) };
  }
  const band = gross < MIDI_LIMIT ? 'midi' : 'full';
  const span = MIDI_LIMIT - MINI_LIMIT;
  // SV-Brutto (total base) and the reduced employee base inside the Übergangsbereich
  const svBase = band === 'midi'
    ? round2(MIDI_FACTOR * MINI_LIMIT + (MIDI_LIMIT / span - (MINI_LIMIT / span) * MIDI_FACTOR) * (gross - MINI_LIMIT))
    : gross;
  const employeeBase = band === 'midi' ? round2((MIDI_LIMIT / span) * (gross - MINI_LIMIT)) : gross;

  const kv = round2(round2(employeeBase * KV) + round2(employeeBase * KV_EXTRA));
  const rv = round2(employeeBase * RV);
  const av = round2(employeeBase * AV);
  const pv = round2(round2(employeeBase * PV) + round2(svBase * PV_CHILDLESS));
  const sv = round2(kv + rv + av + pv);

  // Simplified Vorsorgepauschale: the employee's RV, KV and PV for the year
  const taxable = Math.max(0, gross * 12 - EMPLOYEE_ALLOWANCE - SPECIAL_EXPENSES - (rv + kv + pv) * 12);
  const lst = round2(incomeTax2026(taxable) / 12);

  return { band, svBase, kv, rv, av, pv, sv, lst, total: round2(sv + lst), net: round2(gross - sv - lst) };
}
