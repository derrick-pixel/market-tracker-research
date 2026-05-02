import { h } from './dom.js';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export async function loadAppData() {
  const [competitors, market, pricing, whitespace] = await Promise.all([
    loadJSON('../data/competitors.json'),
    loadJSON('../data/market-intelligence.json'),
    loadJSON('../data/pricing-strategy.json'),
    loadJSON('../data/whitespace-framework.json'),
  ]);
  const data = { competitors, market, pricing, whitespace };
  window.AppData = data;
  return data;
}

export function mountSampleBanner() {
  if (!window.AppData) return;
  const anySample = [window.AppData.competitors, window.AppData.market, window.AppData.pricing, window.AppData.whitespace]
    .some(d => d?.meta?.sample_data === true);
  if (!anySample) return;
  const banner = h('div', { class: 'sample-data-banner' }, 'SAMPLE DATA — swap /data before shipping');
  document.body.prepend(banner);
}

// Per 06-data-visualization-engineer.md → §Un-styled draft banner.
// Emits a banner on every admin page until brand-tokens.json exists
// (i.e. until Agent 9 has run). The renderer reads the file's existence
// at page load — no localStorage flag, no dismiss toggle.
export async function mountUnstyledBanner() {
  try {
    const res = await fetch('../data/brand-tokens.json', { method: 'HEAD' });
    if (res.ok) return; // Agent 9 has run; banner stops emitting
  } catch (_) { /* file missing → continue and emit */ }

  const banner = h('div', { class: 'unstyled-draft-banner', role: 'status' },
    h('strong', {}, 'Un-styled draft'),
    ' — Agent 9 (Aesthetics Presenter) has not yet been run. The layout is functionally complete; visual polish is pending. After human review, dispatch Agent 9 to apply brand DNA from the public site.'
  );
  document.body.prepend(banner);
}
