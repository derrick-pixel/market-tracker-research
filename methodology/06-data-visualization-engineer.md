# 06 — Data Visualization Engineer

## Role one-liner

Cross-cutting engineer who owns every visualisation and search UX in the template; data agents supply JSON, this agent turns it into pixels.

## When to dispatch

Dispatch after Agents 1–4 have produced stable `competitors.json`, `market-intelligence.json`, `pricing-analysis.json`, and `whitespace-framework.json`. The viz layer reads those files as inputs; running earlier produces charts against sample data that will need a full re-render later. Re-dispatch whenever a contract in `FIELD-DICTIONARY.md` changes, a new visualisation is added, or a rendering bug surfaces in manual QA.

This agent is cross-cutting rather than sequential — it does not produce new data, it produces the surfaces the data renders into. A change in `competitors[].features` triggers Agent 1 to rewrite the JSON and then Agent 6 to verify the radar still builds without breaking.

## Inputs the agent needs

- **The four JSON files** produced by Agents 1–4, in their final shape: `competitors.json`, `market-intelligence.json`, `pricing-analysis.json`, `whitespace-framework.json`. Sample data is acceptable for initial viz scaffolding, but the real-data pass must happen before handoff.
- **`FIELD-DICTIONARY.md`** — the source of truth for every field shape the viz reads. If a field is read in a viz but not defined in the dictionary, the dictionary is wrong, not the viz (or the viz is reading something it shouldn't be).
- **`meta.brand` tokens** — `accent`, `primary`, `neutral` colours and the typography stack. The radar "us" dataset, price-bar "us" series, and heatmap hover state all reference these tokens; hardcoding hex values in viz files is a bug.
- **A reference device** for performance checks — mid-range laptop (8GB RAM, integrated GPU), throttled to 4G in DevTools. First-paint budget 2s; interactive budget 3s. Testing on the developer's MacBook Pro hides the regressions that real buyers feel.
- **Manual QA checklist** in `methodology/08-qa-checklist.md`. Every viz has an entry; every entry gets walked through before declaring done.

## Visualisation inventory (reference)

The template ships six visualisations. Every file below is the canonical source; do not fork a chart into a page-local script.

- **Radar** — `template/assets/js/viz/radar.js` (Chart.js radar controller).
- **Heatmap** — `template/assets/js/viz/heatmap.js` (HTML + CSS grid, **not** Chart.js — the grid cells need to be DOM clickable with per-cell detail panels, which Chart.js canvases cannot do cleanly).
- **Price bars** — `template/assets/js/viz/price-bars.js` (Chart.js horizontal bar controller).
- **Donut** — `template/assets/js/viz/donut.js` (Chart.js doughnut controller).
- **Search + filter** — `template/assets/js/viz/search.js` (vanilla JS predicate + debounced input).
- **Market sizing funnel** — `template/assets/js/viz/market-funnel.js` (HTML + CSS, no Chart.js — three stage blocks plus arrow connectors, plus an implications grid and a `<details>` appendix).

Every viz exports two shapes: a pure helper for logic (tested under `_tests/`) and a render function that accepts a DOM container plus the relevant JSON slice. Render functions never fetch data themselves; the admin page wires the JSON through.

## Radar contract (strict)

The radar is used on the strategy-canvas page to plot "us" against the curated set of competitors across strategy dimensions. Strict rules, because downstream design assumes them:

- The dataset with `key === "us"` (or `label === "us"`) is rendered with `borderWidth: 3`, `fill: true`, 35% background alpha over the brand accent, `pointRadius: 4`, and is listed **first** in the legend regardless of input order.
- Every other dataset is rendered with `borderWidth: 1.5`, `fill: false`, 10% background alpha, and `pointRadius: 2`.
- Brand accent colour (from `meta.brand.accent`) is reserved for the "us" line. Other competitors cycle through a 10-colour qualitative palette; define the palette once in `radar.js` and do not inline colours per call site.
- If more than 10 competitors are passed, cycle the palette — do not generate more colours procedurally; the extra competitors should have been filtered upstream (the radar is not a mass view).

`buildRadarData(competitors, dimensions, us)` is the pure helper. It takes the Agent 4 strategy canvas slice and returns the Chart.js `data` object with datasets ordered "us" first. This function is unit-tested; the render function is not.

**Worked example.** Input: 6 competitors including `us`, 7 dimensions (`price_accessibility`, `feature_depth`, `sg_localisation`, `compliance_posture`, `onboarding_speed`, `integration_breadth`, `support_quality`). `buildRadarData` returns a Chart.js `data.datasets` array of length 6 with `us` at index 0, `borderWidth: 3`, and `backgroundColor` resolved to `rgba(<accent>, 0.35)`. The five others follow in input order, `borderWidth: 1.5`, colours pulled by `(index - 1) % 10` from the palette. The legend callback sorts by `datasetIndex`, which preserves the "us first" order because we built the array that way — the sort is defensive, not the primary mechanism.

**Non-goal.** The radar does not show every competitor in the database. Agent 4 curates 5–8 for the canvas page; dumping all 35 into a radar produces an unreadable hairball. If a page-local call site is tempted to pass >10 datasets, reject it at the render boundary with a console warning and truncate.

## Heatmap contract (strict)

The heatmap shows whitespace cells at the intersection of market segments (rows) and buyer needs (columns). Strict rules:

- **Count at render time** — do not trust a precomputed `count` field; compute `cell.competitors.filter(c => c.score >= 3).length` each render. Stale cached counts bit us twice; this is the fix.
- **Banding classes** — apply to the cell element:
  - `≤ 1` competitor at score ≥ 3 → `.cell-green` (whitespace attack).
  - `2–3` competitors at score ≥ 3 → `.cell-amber` (contested).
  - `≥ 4` competitors at score ≥ 3 → `.cell-red` (crowded).
- **Click** dispatches a `CustomEvent('heatmap:cell-selected', { detail: { segmentId, needId, cell } })` on the heatmap root. Cell-detail panels listen for this event; the heatmap itself does not know about the panel.
- **Selection** — the clicked cell receives `.cell-selected`. Second click on the same cell deselects; Esc also deselects. Deselection dispatches `heatmap:cell-selected` with `detail: null`.
- **Keyboard** — cells are `button` elements, focusable, Enter/Space activates. Screen-reader label is `<segment_label> × <need_label>, <count> competitors`.

The heatmap does not know about Chart.js. Do not import it into `heatmap.js`.

**Why count at render time.** An earlier version cached `cell.count` in the JSON written by Agent 4. When Agent 1 re-scored a competitor and Agent 4 was not re-run, the cached counts drifted from the competitor lists. The fix is to treat `cell.competitors` as the single source of truth and compute the count each render. The cost is trivial (30 × 8 cells × linear filter); the correctness gain is worth it.

**Why the threshold is score ≥ 3.** The heatmap answers "how many serious players occupy this pair?" A competitor with `score: 1` or `2` means they technically address the pair but not credibly. Agent 4's scoring rubric defines score 3 as "a competitor the buyer would actually consider for this need." Lowering the threshold to ≥ 2 inflates every cell to red; raising it to ≥ 4 creates mostly-green heatmaps that hide real competition.

## Cell detail panel contract

The panel renders on the same page as the heatmap, subscribes to `heatmap:cell-selected`, and renders the full cell detail.

- **Verdict banners** — fixed strings, not computed per cell:
  - Green band → `WHITESPACE · ATTACK`.
  - Amber band → `CONTESTED · CHOOSE WISELY`.
  - Red band → `CROWDED · AVOID`.
- **Competitor list** — sorted by `score` descending, alphabetical by `name` as tie-break. Line format: `<name> (<score>) — <specialisation_for_cell>`.
- **Specialisation strings** come from Agent 4; this agent does not paraphrase or invent them. Agent 4 enforces that `specialisation_for_cell` is pair-specific — "shared docs for SG SMEs" not "good product."

If `detail` is `null` (deselection), the panel clears but keeps its slot in the layout so the page does not jump.

**Worked example.** User clicks the cell at `SG SME × Data-residency compliance`. Heatmap dispatches `heatmap:cell-selected` with `cell.competitors = [{id: 'acme', score: 5}, {id: 'beta', score: 4}, {id: 'chen', score: 3}]`. Panel looks up `competitors.json` for names, sorts by score desc (Acme 5, Beta 4, Chen 3), renders banner `CONTESTED · CHOOSE WISELY` (amber, 3 at ≥3 = amber band), then three lines each with the pair-specific specialisation that Agent 4 wrote. If Beta and Chen both had score 4, alphabetical tie-break places Beta before Chen.

**What the panel does not do.** It does not re-score, re-rank, or re-write specialisations. It is a dumb renderer over Agent 4's output. If the panel looks wrong, the fix is in Agent 4's JSON, not in `panel.js`.

## Market sizing funnel contract (strict)

The funnel is the canonical render for `market-intelligence.json` `market_size.derivation_flow`. It replaced the legacy "wall-of-text reasoning + wall-of-text implication" rendering that Agent 6 used to produce. Strict rules, because Agent 2 writes the structured shape against this contract:

- **Three stage blocks** in fixed order: TAM → SAM → SOM. Each block reads its slice from `derivation_flow.tam`, `derivation_flow.sam`, `derivation_flow.som` respectively. If any stage is missing in the JSON, render an inline error block — do not silently skip.
- **Arrow connectors** between adjacent stage blocks. Each arrow carries an optional filter-tag label sourced from the *receiving* stage's first `filters[]` entry (or a default label `"Reach filter"` for TAM→SAM and `"Capture filter"` for SAM→SOM).
- **Stage block layout** — head row (stage_label + subtitle on the left, big result_label on the right), optional `filters[]` chip row, stacks grid (`repeat(auto-fit, minmax(280px, 1fr))`), total bar (total_equation ≈ result_label).
- **Stack card layout** — name + result_label on the head, source line in italic, inputs as label/value chips, equation in a code-styled monospace block.
- **Banding by stage** — stage block CSS receives a modifier class (`tam`, `sam`, `som`) that paints the top border, the stage-label colour, the result-label colour, and the equation chip background. Do not theme stage blocks any other way; the modifier class is the contract.
- **Implications row** — `derivation_flow` is followed by an `implications[]` grid: one card per item, with the headline in display font and the body underneath. Cards render in input order; do not sort.
- **Methodology appendix** — `methodology_appendix` renders inside a `<details>` element, summary text `"Methodology & full derivation"`, collapsed by default. The verbatim prose lives inside the panel as a single `<p>`.
- **Sources line** — render `sources[]` as a comma-separated list of underlined `<a>` links beneath the appendix.
- **Legacy fallback** — if `derivation_flow` is absent but `reasoning` is present, fall back to a single `<p>` rendering of `reasoning`. If `implications[]` is absent but `implication_for_us` is present, render that as a single `<p>` with a `What this means:` lead. The fallback paths exist only for projects that have not yet migrated; new projects must populate the structured shape.

`buildFunnelData(market_size)` is the pure helper. It takes `market_size` and returns a normalised object with `stages[]`, `implications[]`, `appendix`, `sources[]`, and `legacy_mode: boolean`. The render function consumes this normalised shape so there is exactly one path that handles fallback logic.

**Worked example.** Input `market_size.derivation_flow.tam.stacks[]` has 4 entries (AU, HK, SG, APAC-shoulder), each with `inputs: [{label: "Beds", value: "..."}, {label: "ARPU", value: "..."}]` and `equation: "<beds> × <arpu> × 12"`. The TAM stage block paints with the `tam` modifier (gold top border on Passage, brand-primary on XinceAI), shows four stack cards in a grid, and totals at the bottom with the equation `"228 + 41 + 16 + 84"` ≈ `"A$528M"`. The SAM block follows with `filters[]` rendered as three chips above its stacks. Arrow between TAM and SAM carries the label `"> 60-bed scale"` (the first SAM filter).

**Why HTML + CSS grid, not Chart.js.** The funnel's value comes from per-cell text density (per-stack inputs as label/value chips, equation strings in monospace, source citations in italic). A Chart.js render would lose all that — funnels in Chart.js are pure rectangles with a single label per slice. The funnel is read top-to-bottom by reviewers checking arithmetic; that is a DOM/text task, not a canvas/graphics task.

## Search contract

Used on the competitor database page. Split cleanly into pure predicate and render.

- **`matchesCompetitor(c, query, filters) → boolean`** — pure, testable. No DOM, no side effects. The render code loops competitors and filters with this predicate.
- **Searches** — case-insensitive substring match against `name`, `primary_value_prop`, `hq`, joined `features[]`, joined `strengths[]`.
- **Filters** — three exact-match filters:
  - `category` — one of the `FIELD-DICTIONARY.md` §8 enums or `null` (no filter).
  - `hqRegion` — `SEA | APAC | Global | Other | null`.
  - `threatLevelMin` — integer 1–5 or `null`; include competitors with `threat_level >= threatLevelMin`.
- **Debounce** — user input is debounced 150ms before `matchesCompetitor` is evaluated across the set. Filter dropdowns fire immediately (no debounce).
- **Empty state** — when zero records match, render a short `no-results` block with the active query and filters echoed back; do not collapse the list silently.

**Worked example.** Query `paynow`, filter `category = sg_local`, `threatLevelMin = 3`. `matchesCompetitor` returns true for a record where `features` includes `"PayNow integration"` and `category === "sg_local"` and `threat_level >= 3`. It returns false for a record with PayNow in features but `category === "global_incumbent"` (filter fails), and false for a record with `category === "sg_local"` and `threat_level === 2` (filter fails).

**Pagination.** The page shows 12 records per page; `computePageIndex(totalMatches, currentPage, pageSize)` is pure and returns `{ start, end, totalPages }`. Keeping this in a pure helper is how we avoid off-by-one bugs when the filter set changes and the current page is now past the end — the helper clamps `currentPage` to `totalPages - 1`.

## Rendering safety (non-negotiable)

The template is forked and populated with user-supplied competitor data. A malicious or sloppy record with a `<script>` in `primary_value_prop` must not execute. The rule is categorical:

- **All DOM is built via the `h()` helper in `template/assets/js/dom.js`.** `h(tag, props, ...children)` creates an element, sets properties as JS (not HTML), and appends children as text nodes or elements.
- **No HTML-string setters, anywhere in the viz layer.** That means no `innerHTML`, no `outerHTML`, and no `insertAdjacentHTML` with interpolated values. A grep for `innerHTML` across `template/assets/js/viz/` must return zero hits.
- **Chart.js** renders into a canvas, not DOM strings. Its own internals are considered safe; the data passed to it must still be validated (no `{x: "<script>"}` labels) but the XSS surface is zero-by-construction in the Chart.js path.
- **Exception** — static literal strings in markup (e.g. `h('div', { className: 'empty' }, 'No competitors match.')`) are fine because they are not interpolated from user data.

Rationale: forks load user-supplied competitor data; the XSS surface must be zero by construction, not by diligence. A single `innerHTML` in a shared helper is a time-bomb because future agents will hand it user content.

**The `h()` helper.** Minimal shape:

```js
export function h(tag, props = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'className') el.className = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}
```

String children become text nodes, never parsed HTML. That is the whole safety property. If a render needs to output rich content (bold, links), build the elements explicitly: `h('p', {}, 'Prefix ', h('strong', {}, userText), ' suffix')`. This is more verbose than template strings and that is the intended trade-off.

## Layout invariants (non-negotiable)

These three CSS rules apply to every container Agent 6 ships. Together they prevent the single biggest class of bug I see across projects: content overflowing or clipping when the underlying data has long tokens, when the viewport narrows, or when a CSS Grid cell refuses to shrink below its content size. Skipping any of them produces failures that look like "Agent 6 made an ugly card" but are actually structural CSS-grid defaults.

### Rule 1 — every `1fr` track uses `minmax(0, 1fr)`

CSS Grid columns and rows declared as `1fr` default to `min-width: auto`, which means **the track refuses to shrink below the size of its content**. A cell with a long unbreakable token (`brand_activation_marketer`, `government_procurement`, a URL, a deeply-nested code identifier) forces the entire grid wider than its container, producing horizontal overflow that clips against the viewport.

```css
/* Bad — track will not shrink below content */
.card { display: grid; grid-template-columns: 240px 1fr; }

/* Good — track can shrink, content wraps */
.card { display: grid; grid-template-columns: 240px minmax(0, 1fr); }
```

This applies recursively. If the right cell of `.card` is itself a 2-column grid, both inner tracks need `minmax(0, 1fr)` too. There is no upper bound — every nested `1fr` gets the override.

### Rule 2 — every text container gets `overflow-wrap: anywhere`

Even with `minmax(0, 1fr)`, a single unbreakable string longer than the cell will visually overflow because `word-break: normal` (the default) only breaks at whitespace. The fix:

```css
.card-body { overflow-wrap: anywhere; }
```

`anywhere` is preferred over `break-word` because it permits more soft-wrap opportunities and produces better line-balance on technical content. Apply at the lowest container that holds user-supplied text (paragraph, table cell, list item) — not at the page root, which would over-break decorative typography.

### Rule 3 — every fixed-width label column has a mobile-collapse rule

Grids that use a fixed-width label column (e.g. `grid-template-columns: 110px 1fr` for key-value rows) must collapse to single-column at narrow viewports, otherwise the label squeezes the value to unreadable. The pattern:

```css
.row { display: grid; grid-template-columns: 110px minmax(0, 1fr); gap: 14px; }

@media (max-width: 640px) {
  .row { grid-template-columns: 1fr; gap: 4px; }
}
```

If the label is a small uppercase eyebrow ("CHANNEL", "PRICING"), the collapsed mobile state usually reads better than the desktop 2-col anyway.

### Layout invariants checklist (apply before commit)

For every new view module Agent 6 produces, grep the CSS for these three patterns:

- [ ] Every `grid-template-columns` with a `1fr` token also contains `minmax(0,`
- [ ] Every container that holds user data (`<p>`, `<td>`, list items) has `overflow-wrap: anywhere` somewhere in its cascade
- [ ] Every fixed-pixel label column has a `@media (max-width: …)` collapse rule

These three lines, applied uniformly, prevent the entire failure mode where "the data is excellent but the cards look broken."

## Display-format helpers (use these, not inline formatting)

All currency, score, and range formatting lives in `/template/assets/js/format.js`. Agent 6 imports these helpers in every render module; no inline formatting is permitted. The contract per `FIELD-DICTIONARY.md §11`:

```js
import { fmtSGD, fmtSGDFull, fmtRange, fmtScore, fmtPct } from '../format.js';

fmtSGD(48000000)               // "S$48M"
fmtSGD(95000000)               // "S$95M"
fmtSGD(2400)                   // "S$2K"
fmtSGD(149)                    // "S$149"
fmtSGDFull(48000000)           // "S$48,000,000" (use in tables and PDF appendices)
fmtRange(199, 299, 499)        // "S$199 — S$499 (target S$299)"
fmtScore(4.2, "1-10")          // "4.2 / 10"
fmtScore(3, "0-5")             // "3 / 5"
fmtPct(12.5)                   // "12.5%"
fmtPct(20)                     // "20%"  (no trailing .0)
```

The implementation reads `meta.market_size.currency_label` from any of the four data files (whichever is loaded for the current view) so a project with `currency_label: "AUD"` gets `"A$48M"` automatically without per-renderer overrides. The scale token on `fmtScore` is **explicit** — never inferred from the value — so a 1-5 field and a 1-10 field cannot accidentally share a denominator.

**What's forbidden:**

```js
// All of these are inline-format defects flagged by Agent 7's mid-flight pass.
'S$' + (n / 1e6).toFixed(0) + 'M'                  // bad — bypasses currency_label
`${rating} / 10`                                   // bad — assumes 1-10 scale
n.toLocaleString() + ' SGD'                        // bad — no compact mode
```

If a renderer needs a format the helpers don't provide, propose a new helper via Agent 7 — don't write a one-off inline.

## Un-styled draft banner (until Agent 9 runs)

Every admin page Agent 6 produces operates in one of two states:

- **Un-styled draft** — `/template/data/brand-tokens.json` does not exist (Agent 9 has not yet run).
- **Branded** — `brand-tokens.json` exists with `extracted_from.type` ≠ `"manual_override"`.

In the un-styled state, every admin page **must** render a top-of-page banner so the human reviewer cannot confuse "Agent 6 produced ugly output" with "Agent 9 has not yet been invoked." This was the root cause of the Elitez Events "monotonous design" feedback on 2026-04-27.

The banner contract:

- **Position:** Sticky at top of `<main>`, below the nav.
- **Copy (verbatim):** `"Un-styled draft — Agent 9 (Aesthetics Presenter) has not yet been run. The layout is functionally complete; visual polish is pending. After human review, dispatch Agent 9 to apply brand DNA from the public site."`
- **Visual:** High-contrast info band — never red/error coloured. Use `--ee-amber` / `--accent` tone with a 1px border in `--ee-orange-deep` / `--brand-primary`.
- **Auto-dismissal:** The renderer reads `brand-tokens.json` existence at page load. Banner DOM emits only when the file is absent. No explicit dismissal toggle, no `localStorage` flag — the file's presence is the truth.
- **Excluded pages:** The public site (`/index.html`, `/services.html`, `/work.html`, `/about.html`, `/contact.html`) does NOT show this banner — only `/admin/*.html` pages.

Implementation lives in `/template/assets/js/app.js → mountUnstyledBanner()`. Agent 6 calls it from every admin page's bootstrap script. Agent 9, when run, writes `brand-tokens.json` and the banner stops emitting on next reload — no code change required to dismiss.

## Section-pattern picker (use named patterns, not blank starts)

Agent 6 does not start every render module from a blank file. The Agent 9 methodology defines six canonical section patterns (`09-aesthetics-presenter.md → §Card library contract`):

| Section name in admin | Pattern Agent 6 picks | Source-of-truth reference |
|---|---|---|
| Top-5 competitor highlights | `kpi` cards in a 5-up grid | `/codings/xinceai/admin/index.html` |
| Personas grid | `persona-card` with NBA stat | `/codings/elix-eor/admin/index.html` |
| NBA arithmetic block | `nba-card` showing `nba.inputs` and `monthly_sgd_equivalent` | `/codings/elix-eor/admin/insights.html` |
| Attack plans | `attack-plan-card` (left rail + zoned body) | `/codings/elitez-events/admin/whitespace.html` |
| Heatmap niches | `niche-card` with rank + TAM | `/codings/elitez-events/admin/whitespace.html` |
| Market sizing stats | `market-stat` with derivation funnel | `/codings/xinceai/admin/insights.html` |

When Agent 6 builds a new admin page, it picks a pattern by section name (looking it up in `09-aesthetics-presenter.md` or the reference admins) and adapts the HTML/CSS structure, not the content. The patterns are **structural**: card geometry, grid scaffold, label position, mobile-collapse breakpoint. Branding (colour tokens, typography weights, gradient direction) is Agent 9's job.

If the section name does not match any of the six patterns, Agent 6 picks the closest archetype and notes the divergence in its handoff to Agent 9 ("New section `vendor_scorecard` adapted from `kpi` pattern; needs review for whether it warrants a new canonical pattern"). Agent 7 in mid-flight mode flags any admin page that introduces an unnamed pattern more than once across projects — that is a signal the pattern library should grow.

## Performance

- **Search debounced 150ms.** Any tighter and each keystroke causes a full list reflow on large sets.
- **Heatmap reflow** — use `ResizeObserver` on the grid container; do not re-render on every `resize` event (that fires on scroll on some browsers and kills frame rate).
- **Chart.js lazy init** — wrap each chart's construction in an `IntersectionObserver` so charts below the fold do not paint until scrolled into view. First paint improves ~400ms on the pricing page with 8 charts.
- **No layout thrash** — compute all reads (`getBoundingClientRect`, `offsetHeight`) before any writes (style mutations) inside a single animation frame.

## Chart-specific notes

### Price bars

Horizontal Chart.js bar chart, one bar per competitor, x-axis in SGD. Rules:

- Sort by `sg_monthly_sgd` ascending; put `us` last for visual anchoring at the top of the chart.
- Bars with `pricing_flag === 'hidden_estimated'` get a striped pattern fill; `public` gets solid; `partial` gets a dotted outline. The pattern library lives in `price-bars.js`; do not inline patterns per call.
- `null` prices are omitted from the chart entirely and listed in a footer note ("N/A: competitors with non-SG pricing or no public price").

### Donut

Used for market-share breakdowns when Agent 2 has triangulated numbers. Rules:

- Only render if ≥ 3 slices have non-null share values; below that the donut misleads. Fall back to a text summary.
- `us` slice uses the brand accent; others cycle the 10-colour palette.
- An `Other` slice aggregates everyone below 3% share to keep the donut readable.

## Testing policy

The template runs `node --test` against `*.test.mjs` files colocated in `_tests/` next to each viz. The rule is:

- **Pure logic is unit-tested.** Specifically: `cellCount`, `cellBand`, `buildCellDetail`, `matchesCompetitor`, `computePageIndex`, `buildRadarData`. Each function takes JSON, returns a value, has no DOM dependency.
- **Rendering is verified manually in a browser.** There is no headless DOM test harness; jsdom diverges from real browsers on ResizeObserver and IntersectionObserver, and the bugs that matter are the visual ones. A tester runs `python3 -m http.server` in the template root and walks the QA checklist in `methodology/08-qa-checklist.md`.
- **Regression test** — every time a bug is fixed in pure logic, a failing test is added first (red), then the fix makes it green. This is the only way rendering-adjacent bugs stay fixed across refactors.

## Adding a new viz (recipe)

When a future agent needs a new viz (e.g. a timeline, a funnel, a treemap), follow this order:

1. **Define the contract in `FIELD-DICTIONARY.md` first.** What JSON slice does it consume? What events does it dispatch? What ARIA posture does it have? Do not write code before the contract lands.
2. **Add `viz/<name>.js`** with pure helpers exported at the top (testable), then the render function at the bottom. Keep the file under 250 lines; if it grows past that, split the pure helpers into a `<name>-logic.js`.
3. **Add `_tests/<name>.test.mjs`** covering the pure helpers. Every branch of the banding or classification logic gets a test case. Edge cases first (empty input, singleton, boundary values), happy path second.
4. **Wire into the admin page** — the admin page imports the render function and calls it with the relevant JSON slice. DOM is built via `h()`. Verify no `innerHTML` sneaks in via a copy-paste from an old snippet.

If the new viz needs Chart.js, import from the shared bundle path; do not load a second Chart.js copy from a CDN.

## Common pitfalls

Named failure modes to self-audit before handing off.

### 10.1 Template-string sneak-in

**Symptom:** a render function uses `` `<li>${name}</li>` `` and appends via `innerHTML`. Looks harmless because `name` "is just a company name."

**Cause:** copy-paste from an old jQuery snippet or a marketing landing page tutorial. The habit is deeply ingrained; it takes active resistance.

**Fix:** replace with `h('li', {}, name)`. Add the file to the grep gate in the deliverable checklist. If the render needs nested structure, chain `h()` calls — do not reach for template strings. A single exception becomes ten in six months.

### 10.2 Chart.js canvas contamination

**Symptom:** a chart renders the first time correctly, but on re-render (e.g. after a filter change), old data ghosts through or the canvas is "sticky" at the previous size.

**Cause:** Chart.js instances were not destroyed before re-creating. The viz layer holds a WeakMap of canvas → chart instance; if the map entry is not cleared, the new instance draws on top.

**Fix:** on every render, check the map, call `chart.destroy()` if present, then create the new chart and store it. Every chart module exports `render(container, data)` and internally handles the destroy-before-create lifecycle.

### 10.3 Banding off-by-one

**Symptom:** a cell with exactly 2 competitors at score ≥ 3 is coloured green.

**Cause:** the banding function used `< 2` instead of `<= 1` for green, or `>= 2 && <= 3` was transposed with `> 2 && < 4`. Integer comparisons are easy to bungle.

**Fix:** use the exact thresholds in the contract (`≤ 1`, `2–3`, `≥ 4`). Write a test case for each boundary (0, 1, 2, 3, 4, 5) and let the test enforce the correctness. Never derive the bands from percentages; the thresholds are fixed counts by design.

### 10.4 Hidden state in render functions

**Symptom:** clicking a filter applies the query from two keystrokes ago; or the heatmap selection persists after the underlying data is re-loaded.

**Cause:** a render function stashed state in module-level variables (`let lastQuery = ''`) that survived across re-renders.

**Fix:** render functions take all state as arguments. If per-page state is needed (e.g. current filter set), keep it on the page orchestrator, not inside the viz module. The viz is a pure transform from `(data, state) → DOM`.

### 10.5 Accessibility afterthought

**Symptom:** heatmap cells are `div`s without keyboard focus; charts have no `aria-label`; the search input has no associated label.

**Cause:** visual output was verified, screen-reader output was not.

**Fix:** every interactive cell is a `button` element. Every chart canvas has an `aria-label` summarising the data ("Radar chart comparing us against 5 competitors across 7 strategy dimensions"). Every input has a visible or `aria-labelledby` label. Run once through VoiceOver or NVDA before declaring done.

## Handoff note to Agent 7

At the end of an Agent 6 run, produce a short handoff note for Agent 7 (Report Writer). Minimum contents:

- **Which viz files changed** in this run, and whether the contract changed or only the implementation.
- **Any new pure helpers** that Agent 7 can reuse when building the PDF export (e.g. `cellBand`, `buildRadarData` work the same server-side).
- **Known rendering issues** that do not block the template but should be noted in the report (e.g. "Safari < 15 does not support `ResizeObserver` options; heatmap reflow degrades but does not break").
- **Test coverage gaps** — any pure helper not yet unit-tested, so Agent 7 knows which surfaces to trust less when snapshotting into the PDF.

## Escalation criteria

Pause and escalate to the human rather than push through.

### 12.1 A contract needs to change

If a data-agent asks for a new radar dimension, a heatmap band threshold change, or a new event payload, that is a contract change. Route through Agent 7 (Methodology Curator, in `07-methodology-curator.md`) so the change cascades through this file, `FIELD-DICTIONARY.md`, and every dependent agent. Do not silently edit `radar.js` to accept an extra field.

### 12.2 A viz cannot be built safely within the no-innerHTML rule

Rare but possible — e.g. a third-party widget that insists on string-HTML ingestion. The correct escalation is to wrap the widget in a sandboxed `iframe` with a strict CSP, not to add an `innerHTML` exception in the main bundle. If neither is feasible, escalate before shipping.

### 12.3 Performance floor breached

If the pricing page first-paint exceeds 2s on the reference device (mid-range laptop, throttled 4G), escalate. The usual cause is an upstream agent shipping a 4MB JSON file. Fix the data size before fixing the viz.

## Deliverable checklist

Self-audit before declaring Agent 6 done.

- [ ] Every viz in the inventory has a contract section in this file.
- [ ] Radar "us" dataset renders with borderWidth 3, fill true, 35% alpha, pointRadius 4, listed first in legend.
- [ ] Heatmap banding thresholds match the `≤1 / 2–3 / ≥4` rule and class names are `.cell-green / .cell-amber / .cell-red`.
- [ ] Heatmap cells dispatch `heatmap:cell-selected` on click with `{segmentId, needId, cell}`.
- [ ] Cell detail panel banners are the three fixed verdict strings.
- [ ] Competitor list in cell detail sorted by score desc, alphabetical tie-break.
- [ ] `matchesCompetitor` is pure, searches the five fields, accepts the three filters, and is debounced 150ms at the input layer.
- [ ] `grep -r 'innerHTML\|outerHTML\|insertAdjacentHTML' template/assets/js/viz/` returns zero hits.
- [ ] All DOM built via `h()` from `template/assets/js/dom.js`.
- [ ] `node --test template/assets/js/viz/_tests/*.test.mjs` passes.
- [ ] Pure-logic tests exist for `cellCount`, `cellBand`, `buildCellDetail`, `matchesCompetitor`, `computePageIndex`, `buildRadarData`.
- [ ] Chart.js init wrapped in IntersectionObserver; no immediate paint for off-screen charts.
- [ ] Heatmap container observed with ResizeObserver, not `window.resize`.
- [ ] Market sizing funnel renders TAM → SAM → SOM in fixed order with arrow connectors carrying filter-tag labels.
- [ ] Each stage block applies the correct modifier class (`tam`, `sam`, `som`) — top border, label colour, total colour, equation chip background all keyed off it.
- [ ] `implications[]` cards render in input order, one per array entry, no client-side sort.
- [ ] `methodology_appendix` lives inside `<details>` collapsed by default, summary `"Methodology & full derivation"`.
- [ ] Legacy fallback path triggers only when `derivation_flow` or `implications[]` is absent — and never silently overrides structured data.
- [ ] Manual browser QA walked against `methodology/08-qa-checklist.md`.
- [ ] Contract documented here for any new viz added in this run.

If any box is unchecked, the viz layer is not ready. Downstream agents (Agent 7 Report Writer, Agent 8 Release) assume every contract in this file holds.
