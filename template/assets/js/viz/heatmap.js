// heatmap.js — HTML+CSS-grid heatmap.
// Pure: cellCount, cellBand, buildCellDetail. Rendering: renderHeatmap, renderCellDetail (DOM-safe).

import { h, mount } from '../dom.js';

export function cellCount(cell) {
  if (!cell || !Array.isArray(cell.competitors)) return 0;
  return cell.competitors.filter(c => (c.score ?? 0) >= 3).length;
}

export function cellBand(count) {
  if (count <= 1) return 'green';
  if (count <= 3) return 'amber';
  return 'red';
}

const VERDICTS = {
  green: 'WHITESPACE · ATTACK',
  amber: 'CONTESTED · CHOOSE WISELY',
  red:   'CROWDED · AVOID',
};

export function buildCellDetail({ segmentId, needId, segmentName, needName, cell }) {
  const count = cellCount(cell);
  const band = cellBand(count);
  const competitors = [...(cell?.competitors || [])].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });
  return {
    segmentId, needId,
    headline: `${segmentName} × ${needName}`,
    band,
    verdict: VERDICTS[band],
    ourScore: cell?.our_score ?? 0,
    count,
    competitors,
  };
}

export function renderHeatmap({ container, segments, needs, cells, onCellClick }) {
  container.classList.add('heatmap-grid');
  container.style.gridTemplateColumns = `240px repeat(${needs.length}, 1fr)`;
  const nodes = [];

  nodes.push(h('div', { class: 'heatmap-header-col' }, 'SEGMENT \\ NEED'));
  for (const need of needs) nodes.push(h('div', { class: 'heatmap-header-row' }, need.short));

  for (const seg of segments) {
    nodes.push(h('div', { class: 'heatmap-header-col' },
      h('strong', {}, seg.name),
      h('span', { class: 'descriptor' }, seg.descriptor || '')
    ));
    for (const need of needs) {
      const key = `${seg.id}:${need.id}`;
      const cell = cells[key] || { competitors: [], our_score: 0 };
      const count = cellCount(cell);
      const band = cellBand(count);
      const cellNode = h('div', {
        class: `heatmap-cell cell-${band}`,
        dataset: { segmentId: seg.id, needId: need.id },
        onClick: () => {
          container.querySelectorAll('.cell-selected').forEach(c => c.classList.remove('cell-selected'));
          cellNode.classList.add('cell-selected');
          const detail = buildCellDetail({ segmentId: seg.id, needId: need.id, segmentName: seg.name, needName: need.name, cell });
          onCellClick?.(detail);
        }
      }, String(count));
      nodes.push(cellNode);
    }
  }
  mount(container, ...nodes);
}

export function renderCellDetail(panel, detail) {
  mount(panel,
    h('div', { class: `verdict ${detail.band}` }, detail.verdict),
    h('h3', {}, detail.headline),
    h('p', {},
      h('strong', {}, 'Our score: '), `${detail.ourScore}/5 · `,
      h('strong', {}, 'Competitors serving (score ≥ 3): '), String(detail.count)
    ),
    h('ul', {}, detail.competitors.map(c =>
      h('li', {},
        h('strong', {}, c.name),
        ` (${c.score}) — ${c.specialisation_for_cell || ''}`
      )
    ))
  );
}
