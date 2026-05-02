// preflight-dom.js — Phase 4 of the report-generator pre-flight gate.
//
// Runs after renderPages() has built every .pdf-page div, but before
// html2canvas opens the rasterise loop. Catches structural drift that
// JSON-level validation cannot see: missing sections, off-by-one TOC
// numbers, blank-page leakage, missing footers, and the white-cover
// failure mode that ships when report.css overrides the cover background.
//
// See methodology/08-report-generator.md §Pre-flight Phase 4.
//
// All checks run; nothing short-circuits. A single re-run surfaces every
// violation so the responsible agent can fix them in one pass.

const CANONICAL_SECTIONS = [
  'cover', 'toc', 'exec', 'landscape', 'market', 'pricing',
  'ws-thesis', 'ws-heatmap', 'ws-cells', 'website', 'appendix',
];
// The TOC is keyed on registry chapters, not page-templates. Whitespace Atlas's
// three sub-pages (thesis/heatmap/cells) collapse into one TOC row anchored at
// the first sub-page (ws-thesis). 7 chapters total.
const TOC_ENTRIES = [
  { title: 'Executive Summary',                anchor: 'exec' },
  { title: 'Competitor Landscape',             anchor: 'landscape' },
  { title: 'Market Intelligence',              anchor: 'market' },
  { title: 'Pricing Strategy',                 anchor: 'pricing' },
  { title: 'Whitespace Atlas',                 anchor: 'ws-thesis' },
  { title: 'Website Design Audit',             anchor: 'website' },
  { title: 'Appendix: Full Competitor Table',  anchor: 'appendix' },
];
const NON_FOOTER_TEXT_MIN_CHARS = 50;

export function validateDOM(root, data) {
  const pages = Array.from(root.querySelectorAll('.pdf-page'));
  const violations = [];
  const v = (check, message) => violations.push({ check, message });

  check4a(pages, v);
  check4b(pages, v);
  check4c(pages, v);
  check4d(pages, v);
  check4e(pages, v);
  check4f(pages, data, v);
  check4g(pages, v);

  return { ok: violations.length === 0, violations };
}

// 4a — section count + canonical order
function check4a(pages, v) {
  if (pages.length < CANONICAL_SECTIONS.length) {
    v('4a', `Expected at least ${CANONICAL_SECTIONS.length} .pdf-page elements; found ${pages.length}`);
    return;
  }
  const seen = pages.map(p => p.dataset.section || '(unset)');
  const seenSet = new Set(seen);
  for (const sec of CANONICAL_SECTIONS) {
    if (!seenSet.has(sec)) v('4a', `Canonical section "${sec}" missing from rendered pages`);
  }
  let cIdx = 0;
  for (let i = 0; i < seen.length; i++) {
    const sec = seen[i];
    if (sec === CANONICAL_SECTIONS[cIdx]) continue;
    if (cIdx + 1 < CANONICAL_SECTIONS.length && sec === CANONICAL_SECTIONS[cIdx + 1]) {
      cIdx++;
      continue;
    }
    v('4a', `Page ${i + 1} has data-section="${sec}"; expected "${CANONICAL_SECTIONS[cIdx]}" or "${CANONICAL_SECTIONS[cIdx + 1] ?? '(end)'}" — sections out of canonical order`);
    return;
  }
}

// 4b — cover full-bleed
function check4b(pages, v) {
  const cover = pages[0];
  if (!cover) { v('4b', 'No pages rendered — cannot validate cover'); return; }
  if (cover.dataset.section !== 'cover' || !cover.classList.contains('pdf-cover')) {
    v('4b', 'First page is not data-section="cover" with class "pdf-cover"');
    return;
  }
  const bg = getComputedStyle(cover).backgroundColor;
  if (bg === 'rgb(255, 255, 255)' || bg === 'rgba(0, 0, 0, 0)') {
    v('4b', `Cover background is ${bg} — must be brand-primary, not white/transparent (white-frame failure mode)`);
  }
}

// 4c — footer presence on every non-cover page
function check4c(pages, v) {
  for (let i = 1; i < pages.length; i++) {
    const p = pages[i];
    const footer = p.querySelector('.pdf-footer');
    const sec = p.dataset.section || '?';
    if (!footer) {
      v('4c', `Page ${i + 1} (${sec}) has no .pdf-footer`);
    } else if (footer.children.length < 3) {
      v('4c', `Page ${i + 1} (${sec}) footer has ${footer.children.length} children; expected 3 (project, page-of-total, date)`);
    }
  }
}

// 4d — TOC ↔ reality (page numbers in TOC match where sections actually rendered)
function check4d(pages, v) {
  const tocPage = pages.find(p => p.dataset.section === 'toc');
  if (!tocPage) return; // 4a will have flagged this
  const renderedStart = {};
  pages.forEach((p, i) => {
    const sec = p.dataset.section;
    if (sec && renderedStart[sec] === undefined) renderedStart[sec] = i + 1;
  });
  const tocLis = Array.from(tocPage.querySelectorAll('ol > li'));
  if (tocLis.length !== TOC_ENTRIES.length) {
    v('4d', `TOC has ${tocLis.length} entries; expected ${TOC_ENTRIES.length} (one per chapter)`);
    return;
  }
  tocLis.forEach((li, idx) => {
    const { title, anchor } = TOC_ENTRIES[idx];
    const numEl = li.querySelector('.page-num');
    const stated = parseInt(numEl?.textContent || '', 10);
    const actual = renderedStart[anchor];
    if (!Number.isFinite(stated) || !Number.isFinite(actual) || stated !== actual) {
      v('4d', `TOC row "${title}" says p${Number.isFinite(stated) ? stated : '?'}, but anchor section "${anchor}" rendered at p${actual ?? '(missing)'}`);
    }
  });
}

// 4e — Cell Detail Appendix non-empty
function check4e(pages, v) {
  const cellPages = pages.filter(p => p.dataset.section === 'ws-cells');
  if (cellPages.length === 0) {
    v('4e', 'No ws-cells page rendered');
    return;
  }
  const greenRows = cellPages.flatMap(p => Array.from(p.querySelectorAll('.cell-row.green')));
  const redRows = cellPages.flatMap(p => Array.from(p.querySelectorAll('.cell-row.red')));
  if (greenRows.length === 0) v('4e', 'Cell Detail Appendix has no green (whitespace) rows — Agent 4 may have produced no decision-grade green cells');
  if (redRows.length === 0) v('4e', 'Cell Detail Appendix has no red (crowded) rows — Agent 4 may have produced no decision-grade red cells');
}

// 4f — competitor appendix completeness
function check4f(pages, data, v) {
  const appendixPages = pages.filter(p => p.dataset.section === 'appendix');
  const total = data?.competitors?.competitors?.length ?? 0;
  if (total === 0) { v('4f', 'data.competitors.competitors is empty — cannot validate appendix'); return; }
  const expectedPages = Math.ceil(total / 20);
  if (appendixPages.length < expectedPages) {
    v('4f', `Expected ${expectedPages} appendix page(s) for ${total} competitors; found ${appendixPages.length}`);
  }
  const rendered = appendixPages.reduce((sum, p) => sum + p.querySelectorAll('.appendix-table tbody tr').length, 0);
  if (rendered !== total) {
    v('4f', `Appendix has ${rendered} rows; expected ${total} (one per competitor)`);
  }
}

// 4g — no empty pages (catches blank-page leakage like Passage casket pp. 1-3, 5-7).
// Text-content length is the reliable signal; CSS height quirks make scrollHeight
// unreliable across pdf-fullbleed / pdf-cover / pdf-content variants.
function check4g(pages, v) {
  pages.forEach((p, i) => {
    if (i === 0) return; // cover exempt — may be visual-only
    const clone = p.cloneNode(true);
    const cf = clone.querySelector('.pdf-footer');
    if (cf) cf.remove();
    const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length < NON_FOOTER_TEXT_MIN_CHARS) {
      v('4g', `Page ${i + 1} (${p.dataset.section || '?'}) has only ${text.length} chars of non-footer content (likely empty / overflow leakage)`);
    }
  });
}

export function formatViolations(violations) {
  if (!violations.length) return 'OK';
  return violations.map(v => `[Phase ${v.check}] ${v.message}`).join('\n');
}
