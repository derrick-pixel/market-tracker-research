import { h } from './dom.js';

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

export async function loadAppData(dataPath = '../data') {
  const [competitors, market, pricing, whitespace] = await Promise.all([
    loadJSON(`${dataPath}/competitors.json`),
    loadJSON(`${dataPath}/market-intelligence.json`),
    loadJSON(`${dataPath}/pricing-strategy.json`),
    loadJSON(`${dataPath}/whitespace-framework.json`),
  ]);
  const data = { competitors, market, pricing, whitespace };
  window.AppData = data;
  window.AppDataPath = dataPath;
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

export async function mountUnstyledBanner() {
  const dataPath = window.AppDataPath || '../data';
  try {
    const res = await fetch(`${dataPath}/brand-tokens.json`, { method: 'HEAD' });
    if (res.ok) return;
  } catch (_) { /* file missing → continue and emit */ }

  const banner = h('div', { class: 'unstyled-draft-banner', role: 'status' },
    h('strong', {}, 'Un-styled draft'),
    ' — Aesthetics presenter pass pending. Layout is functionally complete; visual polish is queued.'
  );
  document.body.prepend(banner);
}
