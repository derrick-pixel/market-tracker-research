// search.js — pure filter predicate + debounced wiring.

export function matchesCompetitor(c, query = '', filters = {}) {
  const q = (query || '').trim().toLowerCase();
  if (q) {
    const haystack = [
      c.name, c.primary_value_prop, c.hq,
      ...(c.features || []), ...(c.strengths || [])
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filters.category && c.category !== filters.category) return false;
  if (filters.hqRegion && c.hq_region !== filters.hqRegion) return false;
  const min = filters.threatLevelMin != null ? Number(filters.threatLevelMin) : null;
  if (min != null && (c.threat_level ?? 0) < min) return false;
  return true;
}

export function debounce(fn, ms = 150) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

export function wireSearch({ input, filtersEl, competitors, onUpdate }) {
  const state = { query: '', filters: {} };
  const update = debounce(() => {
    const result = competitors.filter(c => matchesCompetitor(c, state.query, state.filters));
    onUpdate(result);
  });
  input.addEventListener('input', e => { state.query = e.target.value; update(); });
  filtersEl?.addEventListener('change', e => {
    if (e.target.name && e.target.name.startsWith('filter-')) {
      const key = e.target.name.replace('filter-', '');
      state.filters[key] = e.target.value || undefined;
      update();
    }
  });
  update();
}
