// format.js — canonical display-format helpers.
// Per FIELD-DICTIONARY.md §11. All currency, score, and range formatting
// in the template MUST flow through these helpers; inline formatting is forbidden.

function getCurrencyLabel() {
  return window.AppData?.market?.market_size?.currency_label
      || window.AppData?.competitors?.meta?.brand_tokens?.currency_label
      || 'SGD';
}

function currencyPrefix() {
  const lbl = getCurrencyLabel();
  // Map common 3-letter codes to their familiar prefix; fall back to "<code> "
  const map = { SGD: 'S$', AUD: 'A$', HKD: 'HK$', USD: 'US$', EUR: '€', GBP: '£', MYR: 'RM', INR: '₹', JPY: '¥' };
  return map[lbl] || (lbl + ' ');
}

export function fmtSGD(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  const prefix = currencyPrefix();
  if (Math.abs(v) >= 1_000_000_000) return prefix + (v / 1_000_000_000).toFixed(v >= 1e10 ? 0 : 1) + 'B';
  if (Math.abs(v) >= 1_000_000)     return prefix + (v / 1_000_000).toFixed(v >= 1e7 ? 0 : 1) + 'M';
  if (Math.abs(v) >= 1_000)         return prefix + (v / 1_000).toFixed(0) + 'K';
  return prefix + Math.round(v).toLocaleString();
}

export function fmtSGDFull(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  return currencyPrefix() + Math.round(v).toLocaleString();
}

export function fmtRange(low, expected, upper) {
  if ([low, expected, upper].some(x => !Number.isFinite(Number(x)))) return '—';
  return `${fmtSGD(low)} — ${fmtSGD(upper)} (target ${fmtSGD(expected)})`;
}

export function fmtScore(n, scale) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  if (!scale || !['1-5', '0-5', '1-10'].includes(scale)) {
    throw new Error(`fmtScore requires explicit scale token: "1-5" | "0-5" | "1-10". Got ${scale}.`);
  }
  const denom = scale.split('-')[1];
  const formatted = (v % 1 === 0) ? v.toFixed(0) : v.toFixed(1);
  return `${formatted} / ${denom}`;
}

export function fmtPct(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return '—';
  const formatted = (v % 1 === 0) ? v.toFixed(0) : v.toFixed(1);
  return formatted + '%';
}
