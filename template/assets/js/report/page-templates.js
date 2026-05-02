// page-templates.js — section registry + renderers. All DOM built via h().
import { h, mount } from '../dom.js';
import { computePageIndex } from './toc.js';

export function buildSections(data) {
  return [
    { id: 'cover', title: 'Cover',               render: renderCover,      countPages: () => 1 },
    { id: 'toc',   title: 'Table of Contents',   render: renderTOC,        countPages: () => 1 },
    { id: 'exec',  title: 'Executive Summary',   render: renderExec,       countPages: () => 1 },
    { id: 'land',  title: 'Competitor Landscape',render: renderLandscape,  countPages: () => 2 },
    { id: 'mkt',   title: 'Market Intelligence', render: renderMarket,     countPages: () => 2 },
    { id: 'price', title: 'Pricing Strategy',    render: renderPricing,    countPages: () => 1 },
    { id: 'white', title: 'Whitespace Atlas',    render: renderWhitespace, countPages: (d) => 2 + countAppendixPages(d) },
    { id: 'des',   title: 'Website Design Audit',render: renderDesign,     countPages: () => 1 },
    { id: 'app',   title: 'Appendix: Full Competitor Table', render: renderAppendix, countPages: (d) => Math.ceil(d.competitors.competitors.length / 20) },
  ];
}

function countAppendixPages(d) {
  const cells = Object.values(d.whitespace.heatmap.cells);
  const greenRed = cells.filter(c => {
    const count = (c.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
    return count <= 1 || count >= 4;
  }).length;
  return Math.max(1, Math.ceil(greenRed / 6));
}

export function renderPages(root, sections, data) {
  const idx = computePageIndex(sections, data);
  const ctx = { pageIndex: idx, total: idx._total };
  mount(root);
  for (const s of sections) s.render(root, data, ctx);
}

function page(cls = 'pdf-content', section) {
  return h('div', { class: `pdf-page ${cls}`, dataset: { section } });
}
function footer(pageNum, total, data) {
  return h('div', { class: 'pdf-footer' },
    h('span', {}, data.competitors.meta.project_name),
    h('span', {}, `page ${pageNum} of ${total}`),
    h('span', {}, data.competitors.meta.research_date)
  );
}

function renderCover(root, data) {
  const el = page('pdf-cover', 'cover');
  mount(el,
    h('h1', {}, data.competitors.meta.project_name),
    h('p', { style: { fontSize: '20pt', opacity: '0.9' } }, 'Competitive intelligence & whitespace atlas'),
    h('div', { class: 'meta', style: { marginTop: '40mm' } },
      h('p', {}, `Prepared: ${data.competitors.meta.research_date}`),
      h('p', {}, 'Template: competitor-intel-template v0.1')
    )
  );
  root.append(el);
}

function renderTOC(root, data, ctx) {
  const el = page('pdf-toc', 'toc');
  const entries = [
    ['Executive Summary', ctx.pageIndex.exec],
    ['Competitor Landscape', ctx.pageIndex.land],
    ['Market Intelligence', ctx.pageIndex.mkt],
    ['Pricing Strategy', ctx.pageIndex.price],
    ['Whitespace Atlas', ctx.pageIndex.white],
    ['Website Design Audit', ctx.pageIndex.des],
    ['Appendix: Full Competitor Table', ctx.pageIndex.app],
  ];
  mount(el,
    h('h2', {}, 'Contents'),
    h('ol', {}, entries.map(([title, p]) =>
      h('li', {}, h('span', {}, title), h('span', { class: 'page-num' }, String(p)))
    )),
    footer(ctx.pageIndex.toc, ctx.total, data)
  );
  root.append(el);
}

function renderExec(root, data, ctx) {
  const top3threats = data.competitors.top_five.slice(0, 3).map(t => t.competitor_id).join(' · ');
  const top3attack = data.whitespace.attack_plans.slice(0, 3).map(p => p.niche_name).join(' · ');
  const headline = data.pricing.recommended_tiers[1];
  const el = page('pdf-content', 'exec');
  mount(el,
    h('h2', {}, 'Executive Summary'),
    h('p', { class: 'opening' }, data.whitespace.strategy_canvas.headline_thesis),
    h('h3', {}, 'Top 3 threats'), h('p', {}, top3threats),
    h('h3', {}, 'Top 3 attack niches'), h('p', {}, top3attack),
    h('h3', {}, 'Market size'), h('p', {}, `TAM S$${data.market.market_size.tam_sgd.toLocaleString()} · SAM S$${data.market.market_size.sam_sgd.toLocaleString()}`),
    h('h3', {}, 'Headline pricing move'),
    h('p', {}, `${headline.name} tier at S$${headline.price_sgd}/mo (S$${headline.effective_price_after_psg} after PSG) — ${headline.psychological_anchor}`),
    footer(ctx.pageIndex.exec, ctx.total, data)
  );
  root.append(el);
}

function renderLandscape(root, data, ctx) {
  const c = data.competitors;
  const p1 = page('pdf-content', 'landscape');
  mount(p1,
    h('h2', {}, 'Competitor Landscape'),
    h('p', { class: 'opening' }, `Across ${c.competitors.length} competitors surveyed, ${c.top_five.length} emerge as top-tier threats demanding direct response.`),
    h('h3', {}, 'Top 5 threats'),
    h('ol', {}, c.top_five.map(t => {
      const comp = c.competitors.find(x => x.id === t.competitor_id);
      return h('li', {}, h('strong', {}, comp?.name ?? t.competitor_id), ' — ', t.rationale);
    })),
    footer(ctx.pageIndex.land, ctx.total, data)
  );
  root.append(p1);

  const top10 = [...c.competitors].sort((a, b) => b.threat_level - a.threat_level).slice(0, 10);
  const p2 = page('pdf-content', 'landscape');
  mount(p2,
    h('h3', {}, 'Top 10 by threat level'),
    h('table', { class: 'appendix-table' },
      h('thead', {}, h('tr', {}, ...['Name','Category','HQ','S$/mo','Threat','Beatability'].map(t => h('th', {}, t)))),
      h('tbody', {}, top10.map(c =>
        h('tr', {},
          h('td', {}, c.name), h('td', {}, c.category), h('td', {}, c.hq),
          h('td', {}, c.sg_monthly_sgd ?? '—'), h('td', {}, String(c.threat_level)), h('td', {}, String(c.beatability))
        )
      ))
    ),
    footer(ctx.pageIndex.land + 1, ctx.total, data)
  );
  root.append(p2);
}

function renderMarket(root, data, ctx) {
  const m = data.market;
  const p1 = page('pdf-content', 'market');
  mount(p1,
    h('h2', {}, 'Market Intelligence'),
    h('p', { class: 'opening' }, `The SG/SEA note-tool market sits at TAM S$${m.market_size.tam_sgd.toLocaleString()}, narrowing via SAM to regions where regulatory and cultural fit give us structural advantage.`),
    h('h3', {}, 'Market size'),
    h('p', {}, m.market_size.reasoning),
    h('p', {}, h('strong', {}, 'Implication: '), m.market_size.implication_for_us),
    h('h3', {}, 'Policy landscape'),
    ...m.policies.map(p =>
      h('p', {},
        h('strong', {}, p.title), ` (${p.sentiment}) — `, p.body,
        h('br', {}), h('em', {}, 'Implication: '), p.implication_for_us
      )
    ),
    footer(ctx.pageIndex.mkt, ctx.total, data)
  );
  root.append(p1);

  const p2 = page('pdf-content', 'market');
  mount(p2,
    h('h3', {}, 'Country readiness'),
    h('table', { class: 'appendix-table' },
      h('thead', {}, h('tr', {}, ...['Country','Regulatory','Tech','Price tolerance'].map(t => h('th', {}, t)))),
      h('tbody', {}, m.adoption_patterns.country_readiness.map(r =>
        h('tr', {}, h('td', {}, r.country), h('td', {}, String(r.regulatory)), h('td', {}, String(r.tech_maturity)), h('td', {}, String(r.price_tolerance)))
      ))
    ),
    h('h3', {}, 'Cultural signals'),
    ...m.cultural_signals.map(s =>
      h('p', {}, h('em', {}, `"${s.observation}"`), ` — ${s.evidence}`, h('br', {}), h('strong', {}, 'Implication: '), s.implication_for_us)
    ),
    footer(ctx.pageIndex.mkt + 1, ctx.total, data)
  );
  root.append(p2);
}

function renderPricing(root, data, ctx) {
  const p = data.pricing;
  const prices = data.competitors.competitors.filter(c => c.sg_monthly_sgd != null).map(c => c.sg_monthly_sgd);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const maxWTP = Math.max(...p.personas.map(x => x.wtp_band_sgd.upper_stretch));
  const el = page('pdf-content', 'pricing');
  mount(el,
    h('h2', {}, 'Pricing Strategy'),
    h('p', { class: 'opening' }, `Against competitor price bands of S$${minP}–S$${maxP}/mo, our personas' willingness-to-pay tops out at S$${maxWTP}/mo — pricing is a perception question, not a dollar comparison.`),
    h('h3', {}, 'Recommended tiers'),
    ...p.recommended_tiers.map(t =>
      h('p', {},
        h('strong', {}, t.name), ` — S$${t.price_sgd}/mo · ${t.target_persona} · `,
        h('em', {}, t.psychological_anchor), ` (post-PSG: S$${t.effective_price_after_psg})`
      )
    ),
    h('h3', {}, 'Personas'),
    ...p.personas.map(x =>
      h('p', {}, h('strong', {}, x.name), ` — ${x.icp} · WTP: S$${x.wtp_band_sgd.low_anchor}–${x.wtp_band_sgd.upper_stretch}/mo · NBA: ${x.nba}`)
    ),
    footer(ctx.pageIndex.price, ctx.total, data)
  );
  root.append(el);
}

function renderWhitespace(root, data, ctx) {
  const w = data.whitespace;
  let offset = 0;

  const p1 = page('pdf-fullbleed', 'ws-thesis');
  mount(p1,
    h('h2', {}, 'Whitespace Atlas'),
    h('p', { class: 'opening' }, w.strategy_canvas.headline_thesis),
    h('h3', {}, 'Attack plans'),
    ...w.attack_plans.map(ap =>
      h('p', {},
        h('strong', {}, `#${ap.rank} ${ap.niche_name}`), h('br', {}),
        `ICP: ${ap.icp}`, h('br', {}),
        `Why we win: ${ap.why_we_win}`, h('br', {}),
        `GTM: ${ap.gtm.pitch}`
      )
    ),
    footer(ctx.pageIndex.white + offset, ctx.total, data)
  );
  root.append(p1);
  offset++;

  const p2 = page('pdf-content', 'ws-heatmap');
  const heatmapRows = w.heatmap.segments.map(s =>
    h('tr', {},
      h('td', {}, s.name),
      ...w.heatmap.needs.map(n => {
        const cell = w.heatmap.cells[`${s.id}:${n.id}`] || { competitors: [] };
        const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
        const bg = count <= 1 ? '#d8f5c3' : count <= 3 ? '#fde68a' : '#fecaca';
        return h('td', { style: { background: bg, textAlign: 'center', fontWeight: '700' } }, String(count));
      })
    )
  );
  mount(p2,
    h('h3', {}, 'Segment × Need heatmap summary'),
    h('table', { class: 'appendix-table' },
      h('thead', {},
        h('tr', {}, h('th', {}, 'Segment'), ...w.heatmap.needs.map(n => h('th', {}, n.short)))
      ),
      h('tbody', {}, heatmapRows)
    ),
    footer(ctx.pageIndex.white + offset, ctx.total, data)
  );
  root.append(p2);
  offset++;

  const entries = [];
  for (const seg of w.heatmap.segments) for (const need of w.heatmap.needs) {
    const cell = w.heatmap.cells[`${seg.id}:${need.id}`];
    if (!cell) continue;
    const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
    if (count <= 1 || count >= 4) {
      entries.push({ seg, need, cell, count, band: count <= 1 ? 'green' : 'red' });
    }
  }
  for (let i = 0; i < entries.length; i += 6) {
    const chunk = entries.slice(i, i + 6);
    const pp = page('pdf-content', 'ws-cells');
    mount(pp,
      h('h3', {}, 'Cell Detail Appendix — whitespace & crowded cells'),
      h('div', { class: 'cell-appendix' }, chunk.map(({ seg, need, cell, count, band }) =>
        h('div', { class: `cell-row ${band}` },
          h('h4', {}, `${seg.name} × ${need.name} — ${band === 'green' ? 'WHITESPACE · ATTACK' : 'CROWDED · AVOID'} (count: ${count}; our score: ${cell.our_score ?? 0})`),
          h('ul', {}, [...(cell.competitors || [])].sort((a, b) => b.score - a.score).map(c =>
            h('li', {}, h('strong', {}, c.name), ` (${c.score}) — ${c.specialisation_for_cell || ''}`)
          ))
        )
      )),
      footer(ctx.pageIndex.white + offset, ctx.total, data)
    );
    root.append(pp);
    offset++;
  }
}

function renderDesign(root, data, ctx) {
  const sorted = [...data.competitors.competitors].sort((a, b) => (b.website_design_rating ?? 0) - (a.website_design_rating ?? 0)).slice(0, 10);
  const el = page('pdf-content', 'website');
  mount(el,
    h('h2', {}, 'Website Design Audit'),
    h('p', { class: 'opening' }, 'Top 10 competitor sites by design rating. Dimensions ≤ 6 are flagged with notes.'),
    h('table', { class: 'appendix-table' },
      h('thead', {}, h('tr', {}, ...['Name','Rating','Notes'].map(t => h('th', {}, t)))),
      h('tbody', {}, sorted.map(c =>
        h('tr', {}, h('td', {}, c.name), h('td', {}, `${c.website_design_rating ?? '—'}/10`), h('td', {}, c.website_design_notes || ''))
      ))
    ),
    footer(ctx.pageIndex.des, ctx.total, data)
  );
  root.append(el);
}

function renderAppendix(root, data, ctx) {
  const comps = data.competitors.competitors;
  for (let i = 0; i < comps.length; i += 20) {
    const chunk = comps.slice(i, i + 20);
    const el = page('pdf-content', 'appendix');
    mount(el,
      h('h2', {}, i === 0 ? 'Appendix: Full Competitor Table' : 'Appendix (cont.)'),
      h('table', { class: 'appendix-table' },
        h('thead', {}, h('tr', {}, ...['Name','Category','HQ','S$/mo','Threat','Beat'].map(t => h('th', {}, t)))),
        h('tbody', {}, chunk.map(c =>
          h('tr', {},
            h('td', {}, c.name), h('td', {}, c.category), h('td', {}, c.hq),
            h('td', {}, c.sg_monthly_sgd ?? '—'), h('td', {}, String(c.threat_level)), h('td', {}, String(c.beatability))
          )
        ))
      ),
      footer(ctx.pageIndex.app + (i / 20), ctx.total, data)
    );
    root.append(el);
  }
}
