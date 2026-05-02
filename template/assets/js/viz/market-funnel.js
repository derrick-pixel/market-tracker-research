// market-funnel.js — TAM → SAM → SOM funnel + implications + appendix.
// Canonical render for `market-intelligence.json` `market_size`.
// Contract: see methodology/06-data-visualization-engineer.md §Market sizing funnel.

import { h, mount } from '../dom.js';

const STAGE_ORDER = ['tam', 'sam', 'som'];
const DEFAULT_FILTER_LABELS = { sam: 'Reach filter', som: 'Capture filter' };

// Pure helper — normalises market_size into a render-ready shape.
// Tested under _tests/market-funnel.test.mjs.
export function buildFunnelData(marketSize) {
  if (!marketSize) return { stages: [], implications: [], appendix: null, sources: [], legacy_mode: false };

  const flow = marketSize.derivation_flow || null;
  const implications = Array.isArray(marketSize.implications) ? marketSize.implications : null;

  // Legacy fallback path — only when both modern fields are absent.
  if (!flow && !implications) {
    return {
      stages: [],
      implications: [],
      appendix: marketSize.methodology_appendix || marketSize.reasoning || null,
      legacy_paragraph: marketSize.reasoning || null,
      legacy_implication: marketSize.implication_for_us || null,
      sources: marketSize.sources || [],
      legacy_mode: true,
    };
  }

  const stages = flow
    ? STAGE_ORDER.map(key => {
        const s = flow[key];
        if (!s) return { key, missing: true };
        return {
          key,
          stage_label: s.stage_label || key.toUpperCase(),
          subtitle: s.subtitle || '',
          result_label: s.result_label || '',
          total_equation: s.total_equation || '',
          filters: Array.isArray(s.filters) ? s.filters : [],
          stacks: Array.isArray(s.stacks) ? s.stacks : [],
        };
      })
    : [];

  return {
    stages,
    implications: implications || [],
    appendix: marketSize.methodology_appendix || marketSize.reasoning || null,
    sources: marketSize.sources || [],
    legacy_mode: false,
  };
}

function inputChip(input) {
  return h('div', { class: 'mfunnel-input' },
    h('span', { class: 'lbl' }, input.label),
    h('span', { class: 'val' }, input.value),
  );
}

function stackCard(stack) {
  return h('div', { class: 'mfunnel-stack' },
    h('div', { class: 'mfunnel-stack-head' },
      h('div', { class: 'mfunnel-stack-name' }, stack.name || ''),
      h('div', { class: 'mfunnel-stack-result' }, stack.result_label || ''),
    ),
    stack.source ? h('div', { class: 'mfunnel-stack-source' }, stack.source) : null,
    h('div', { class: 'mfunnel-inputs' }, ...(stack.inputs || []).map(inputChip)),
    stack.equation ? h('div', { class: 'mfunnel-equation' }, '= ', stack.equation) : null,
  );
}

function filterChips(filters) {
  if (!filters || !filters.length) return null;
  return h('div', { class: 'mfunnel-filters' },
    h('div', { class: 'mfunnel-filters-label' }, 'Filters applied'),
    h('div', { class: 'mfunnel-filters-row' },
      ...filters.map(f => h('span', { class: 'mfunnel-filter-chip' }, f)),
    ),
  );
}

function stageBlock(stage) {
  if (stage.missing) {
    return h('div', { class: `mfunnel-stage ${stage.key} missing` },
      h('div', { class: 'mfunnel-stage-error' },
        `Missing ${stage.key.toUpperCase()} stage in derivation_flow`,
      ),
    );
  }
  return h('div', { class: `mfunnel-stage ${stage.key}` },
    h('div', { class: 'mfunnel-stage-head' },
      h('div', { class: 'left' },
        h('div', { class: 'mfunnel-stage-label' }, stage.stage_label),
        h('p', { class: 'mfunnel-stage-subtitle' }, stage.subtitle),
      ),
      h('div', { class: 'mfunnel-stage-total' },
        h('div', { class: 'label' }, 'TOTAL'),
        h('div', { class: 'value' }, stage.result_label),
      ),
    ),
    filterChips(stage.filters),
    h('div', { class: 'mfunnel-stacks' }, ...stage.stacks.map(stackCard)),
    stage.total_equation ? h('div', { class: 'mfunnel-total' },
      h('span', { class: 'eq' }, stage.total_equation),
      h('span', { class: 'approx' }, '≈'),
      h('span', { class: 'total' }, stage.result_label),
    ) : null,
  );
}

function arrowConnector(toStage) {
  // Filter-tag prefers the receiving stage's first filter; falls back to the default label.
  const label = (toStage.filters && toStage.filters[0]) || DEFAULT_FILTER_LABELS[toStage.key] || '';
  return h('div', { class: 'mfunnel-arrow' },
    h('div', { class: 'line' }),
    h('div', { class: 'head' }),
    label ? h('div', { class: 'filter-tag' }, label) : null,
  );
}

function implicationCard(item) {
  return h('div', { class: 'mfunnel-implication' },
    h('div', { class: 'mfunnel-implication-headline' }, item.headline || ''),
    h('div', { class: 'mfunnel-implication-body' }, item.body || ''),
    Array.isArray(item.agent_targets) && item.agent_targets.length
      ? h('div', { class: 'mfunnel-implication-targets' },
          ...item.agent_targets.map(t => h('span', { class: 'mfunnel-target-chip' }, t.replace('_', ' '))),
        )
      : null,
  );
}

function sourcesLine(sources) {
  if (!sources || !sources.length) return null;
  const children = [];
  sources.forEach((s, i) => {
    if (i > 0) children.push(' · ');
    children.push(h('a', { href: s.url, target: '_blank', rel: 'noopener noreferrer' }, s.title));
  });
  return h('p', { class: 'mfunnel-sources' }, ...children);
}

export function renderMarketFunnel(container, marketSize) {
  const data = buildFunnelData(marketSize);

  if (data.legacy_mode) {
    // Legacy fallback for un-migrated projects only.
    mount(container,
      h('div', { class: 'mfunnel-legacy' },
        data.legacy_paragraph ? h('p', {}, data.legacy_paragraph) : null,
        data.legacy_implication ? h('p', {}, h('strong', {}, 'What this means: '), data.legacy_implication) : null,
        sourcesLine(data.sources),
      ),
    );
    return;
  }

  const blocks = [];

  // Funnel: stages with arrows between them.
  if (data.stages.length) {
    const flowEl = h('div', { class: 'mfunnel-flow' });
    data.stages.forEach((stage, i) => {
      flowEl.append(stageBlock(stage));
      const next = data.stages[i + 1];
      if (next && !next.missing) flowEl.append(arrowConnector(next));
    });
    blocks.push(flowEl);
  }

  // Implications grid.
  if (data.implications.length) {
    blocks.push(
      h('div', { class: 'mfunnel-implications-wrap' },
        h('div', { class: 'mfunnel-implications-label' }, 'What this means'),
        h('div', { class: 'mfunnel-implications-grid' },
          ...data.implications.map(implicationCard),
        ),
      ),
    );
  }

  // Methodology appendix (collapsed by default).
  if (data.appendix) {
    blocks.push(
      h('details', { class: 'mfunnel-appendix' },
        h('summary', {}, 'Methodology & full derivation'),
        h('p', {}, data.appendix),
      ),
    );
  }

  // Sources.
  const sources = sourcesLine(data.sources);
  if (sources) blocks.push(sources);

  mount(container, ...blocks);
}
