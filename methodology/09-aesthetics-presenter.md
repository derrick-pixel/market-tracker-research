# 09 — Aesthetics Presenter

## Role one-liner

Final beautify pass that re-skins the analytics admin pages so they resonate with the public site of the brand the report is about — a separate, opt-in agent that runs only after the human has reviewed and approved the un-styled layout.

## When to dispatch

After Agents 1–6 have produced stable JSON and rendered admin pages, after Agent 8 has bound the report PDF, and after the human has signed off on the *content and layout*. The Aesthetics Presenter is not part of the standard workflow — Derrick prefers to inspect the un-styled output first, agree the structure is right, and only then ask for paint. Running this agent earlier wastes work because layout changes from review feedback would force a re-skin.

This agent does not run automatically and does not gate any other agent. It is invoked manually with the explicit instruction "beautify Passage" (or whichever brand). If the human re-runs Agents 1–6 after a beautify pass — e.g. a quarterly refresh that changes the dataset — the Aesthetics Presenter must be re-run to re-skin the regenerated pages, since data agents do not preserve aesthetic overrides.

## Inputs the agent needs

- **The public site of the target brand** — at minimum its `index.html` and any other top-level public page (e.g. `products.html`, `services.html`). Read these directly from the target repo (e.g. `/codings/casket/index.html`) or, if not available locally, fetch the live URL. The CSS custom properties in `:root` are the single source of truth for the aesthetic.
- **Reference best-practice admins**: `/codings/xinceai/admin/`, `/codings/elix-eor/admin/`, `/codings/elitez-events/admin/`. These three are the proven pattern library — XinceAI for the warm-obsidian HUD, EOR for the warm cream light theme, Events for the editorial light theme with deep navy + orange. Every card type Agent 9 ships traces back to one of these three. Do not invent new card archetypes; pick the closest fit and adapt the colours.
- **The unstyled admin pages** produced by Agents 1–6: `template/admin/index.html`, `whitespace.html`, `competitor-analytics.html`, `insights.html`, `design-audit.html`, `report.html`. These are the surfaces being re-skinned. Read every page end-to-end before touching any of them — the JS data-wiring inside is sacred.
- **`FIELD-DICTIONARY.md`** — to confirm which DOM IDs and class names the data renderers depend on. Agent 9 must not rename anything the JS reads.
- **`meta.brand` blocks** in `data/*.json` — these may already contain partial tokens written by Agent 1; treat them as a starting hint, not the final answer. The public site CSS overrides the JSON if they disagree.

## What this agent owns (and does not)

**Owns:**
- `data/brand-tokens.json` — the canonical extracted palette + typography stack, written from public-site CSS.
- `template/assets/css/tokens.css` — CSS custom properties on `:root`, derived from `brand-tokens.json`. Every admin page imports this once.
- `template/assets/css/cards.css` — the card-template library (persona, NBA, attack-plan, KPI cell, niche-card, market-stat).
- `template/assets/css/admin.css` — page-level layout rules (atlas-nav, atlas-top, kpi-strip, artifact wrapper, .grid-2/3/4, mobile-responsive overrides).
- The `<style>` blocks inside each admin page — replaced with a single `<link rel="stylesheet" href="../assets/css/admin.css">` plus any one-off overrides under a per-page `<style>` block of ≤ 40 lines.
- The DOM *wrapping* on each admin page — adding `<section class="artifact">` shells, persona-card / nba-card class names on existing `<div>`s.

**Does not own:**
- Any JSON in `data/` other than `brand-tokens.json`.
- Any JS in `template/assets/js/` — including `viz/`, `dom.js`, the per-page renderers. If a renderer's DOM contract needs to change to support a card layout, that is an Agent 6 escalation, not an Agent 9 silent edit.
- Page IDs (`#kpi-total`, `#radar-chart`, `#comp-grid`, etc.) — these are DOM contracts the renderers read.
- The PDF report's content — only its CSS.
- The public site itself — Agent 9 reads it but never writes to it.

## Token extraction contract (strict)

**Preferred source: `/template/data/brand-assets.json` if it exists** (Agent 0 ran during project setup). That file is the project's persistent record of the client's brand DNA — palette, typography, logo, gradients — and is more reliable than a live read of the public site (which can be redesigned mid-project). When `brand-assets.json` is present, set `extracted_from.type: "brand_assets_json"` and `extracted_from.reference: "/template/data/brand-assets.json"` in the output `brand-tokens.json`.

**Fallback source: the target brand's `index.html`** (live public site). Use this when Agent 0 did not run. Set `extracted_from.type: "public_site"` and `extracted_from.reference` to the URL or local path. Open the file, find the `:root { ... }` block (or the top-of-stylesheet variable declarations). Copy out the following nine canonical tokens; if a token is absent on the public site, derive it from the closest neighbour and document the derivation in `brand-tokens.json` under `notes`.

| Token | Public-site source | Fallback if missing |
|---|---|---|
| `--bg` | Page background colour | `--surface` if only that is defined |
| `--surface` | Card / panel background | `mix(--bg, white 4%)` for dark themes, `mix(--bg, black 2%)` for light |
| `--card` | Most-elevated panel | Same as `--surface` |
| `--card-hi` | Hover/active card state | `mix(--card, --accent 6%)` |
| `--text` | Body copy colour | `#f5ede6` on dark, `#1a1410` on light |
| `--muted` | Secondary text | 60% mix of `--text` toward `--bg` |
| `--border` | Hairline divider | 10% alpha of `--accent` |
| `--accent` | Primary brand colour (links, CTAs) | First non-neutral hex on the page |
| `--accent2` | Secondary brand colour | Complement of `--accent`; see XinceAI for cyan/amber pairing |

Plus three **band tokens** for analytics state (always derived, never copied raw):

| Token | Meaning | Light theme | Dark theme |
|---|---|---|---|
| `--band-green` | Whitespace / opportunity / strong | `#0a8a4a` | `#00ff88` |
| `--band-amber` | Contested / caution / medium | `#c86f15` | `#ff8844` |
| `--band-red` | Crowded / threat / weak | `#b91c1c` | `#ff4466` |

Plus typography:

| Token | Public-site source |
|---|---|
| `--font-head` | Heading font-family (display) |
| `--font-body` | Body font-family |
| `--font-mono` | Monospace stack (UI labels, KPIs) |

`brand-tokens.json` shape per `FIELD-DICTIONARY.md §8c`:

```json
{
  "meta": {
    "project_name": "Passage 2026",
    "brand_tokens": { "primary": "#725b3f", "neutral_dark": "#32332d", "neutral_light": "#fcf9f5", ... },
    "research_date": "2026-04-27",
    "sample_data": false
  },
  "extracted_from": {
    "type": "public_site",
    "reference": "/codings/casket/index.html",
    "captured_at": "2026-04-27"
  },
  "tokens": {
    "bg": "#fcf9f5", "surface": "#f0ece4", "card": "#ffffff",
    "text": "#32332d", "muted": "#6b6358", "border": "rgba(50,51,45,0.10)",
    "accent": "#725b3f", "accent2": "#3a7a50",
    "band_green": "#3a7a50", "band_amber": "#b07020", "band_red": "#8b2020",
    "theme_mode": "light",
    "font_head": "Georgia, 'Times New Roman', serif",
    "font_body": "'Segoe UI', system-ui, sans-serif",
    "font_mono": "ui-monospace, monospace"
  },
  "font_imports": ["https://fonts.googleapis.com/css2?family=..."],
  "notes": "band_green derived from public --green token at 100% opacity. Theme mode is light because public --bg is #fcf9f5."
}
```

**Worked example.** Public site `/codings/casket/index.html` declares `--primary: #32332d`, `--gold: #725b3f`, `--surface: #fcf9f5`, `--green: #3a7a50`. Agent 9 maps: `bg → --surface`, `text → --primary`, `accent → --gold`, `band_green → --green`, derives `--band_amber: #b07020`, `--band_red: #8b2020` from the existing public-site secondaries, and writes `theme_mode: light`. The resulting `tokens.css` is what every admin page now uses; the previous hardcoded `#32332d` literals scattered across page-level `<style>` blocks are deleted in favour of `var(--text)`. The presence of `brand-tokens.json` also auto-dismisses the un-styled-draft banner that Agent 6 emits (see `06-data-visualization-engineer.md → §Un-styled draft banner`).

## Card library contract (strict)

The library ships **six card archetypes**. Each one has a CSS class, a documented use case, and a reference example in one of the three best-practice admins. Agent 9 must not invent new archetypes during a project run; if the data calls for something none of these fit, escalate (see §Escalation) rather than improvise.

### 9.1 `kpi` (KPI strip cell)

A single-metric block with a large display number, an optional trend arrow, and a small caption. Lives inside `.kpi-strip` (CSS grid, `repeat(auto-fit, minmax(180px, 1fr))`).

- **Reference**: `xinceai/admin/whitespace.html` `.kpi` blocks, `events/admin/insights.html` `.summary-grid` cells.
- **Required structure**: `<div class="kpi"><div class="kpi-val">…</div><div class="kpi-lbl">…</div></div>`.
- **Optional**: a colour modifier (`.kpi-val.green`, `.kpi-val.amber`, `.kpi-val.red`, `.kpi-val.gold`) tied to the band tokens.
- **Must not**: contain a chart, a list, or anything other than the value+label pair. Multi-stat blocks belong in `.market-stat` (§9.6).

### 9.2 `persona-card`

A profile card for a market segment or buyer persona. Avatar circle / emoji, name, one-sentence description, two or three quantitative chips (price tolerance, volume, urgency).

- **Reference**: `elix-eor/admin/insights.html` persona cards (`.persona-card` with `.persona-avatar`).
- **Required structure**: avatar block (48–56px square, rounded), name (display font), description (body), chip row.
- **Avatar background**: `rgba(<accent>, 0.12)` — never raw `--card` (it disappears on light themes).
- **Layout context**: lives in `.grid-3` or `.grid-4`, never standalone.

### 9.3 `nba-card` (Next-Best-Action)

A recommended action with a verb headline, a "why now" line, an effort/impact pair, and an optional owner badge.

- **Reference**: `elix-eor/admin/insights.html` NBA section, `xinceai/admin/insights.html` "next moves" grid.
- **Required structure**: rank chip (top-left), action title (display font), rationale (body), `effort × impact` row (small mono labels).
- **Ranking**: cards must render in the order Agent 3 / Agent 4 sets in JSON. No client-side resorting.

### 9.4 `attack-plan-card` (whitespace niche)

A niche/attack-plan brief: niche title, target segment, the unmet need, the move, the metric to watch.

- **Reference**: `xinceai/admin/whitespace.html` niche cards, `events/admin/whitespace.html` attack-plan grid.
- **Required structure**: niche-rank chip, niche name, segment + need pair (two-column row), the move (paragraph), success metric (mono callout).
- **Visual cue**: green left-border (`border-left: 3px solid var(--band-green)`) — these are *opportunities*, not threats.

### 9.5 `niche-card` (the inverse — competitive threat)

Identical structure to attack-plan-card but with `border-left: 3px solid var(--band-red)`. Used on the competitor-deep-dive page when surfacing where a competitor outperforms us.

### 9.6 `market-stat`

A multi-stat tile: 3–6 small numbers stacked vertically, each with its own caption. Used for market-intelligence breakdowns where a single big KPI under-represents the data.

- **Reference**: `events/admin/insights.html` `.market-snapshot` block.
- **Required structure**: stat list (`<dl>`), each entry `<dt>` (mono label) above `<dd>` (display value).
- **Maximum entries**: 6. Above that, fall back to a table.

**What this library is not.** It is not a UI framework. It is six concrete classes that codify what worked across XinceAI, EOR, and Events. New brands inherit the classes; the brand difference shows up entirely through `tokens.css`. If a project needs a seventh archetype, the cost is updating this file plus all three reference admins, plus running a curator pass — not cheap, hence the escalation route.

## Page-level beautification rules

For each admin page, Agent 9 performs the same five-step transform. The order matters; deviating leaves the page in a half-painted state.

1. **Strip in-page hardcoded colours.** Every `#xxxxxx` literal inside the page's `<style>` block is replaced with the appropriate `var(--token)`. No exceptions for "just one CTA".
2. **Replace the `<style>` block with the shared imports.** Add `<link rel="stylesheet" href="../assets/css/tokens.css">`, then `admin.css`, then `cards.css`. Keep at most one page-local `<style>` block of ≤ 40 lines for genuinely page-unique rules.
3. **Wrap data-rendered DOM in card-archetype shells.** Add the right CSS class to the right `<div>`. Crucially: do not rename or remove any DOM ID the JS reads. If the renderer outputs a flat `<div id="persona-list">`, the wrapper is added by adding `class="grid-3"` to that div, not by restructuring children.
4. **Apply theme-mode body class.** Add `<body class="theme-light">` or `<body class="theme-dark">` to match the public site. The CSS in `tokens.css` keys off this class to switch the band tokens (light vs dark band hues, see §Token extraction).
5. **Verify mobile responsive overrides.** Each admin page already has `@media (max-width: 768px)` in its old style block; carry these forward into `admin.css` at the page-class level. The mobile contract is non-negotiable: KPI strip becomes 2-column, then 1-column at 420px.

After all five steps, hard-refresh each page in a browser, walk through every artifact, and confirm: data still renders, no console errors, no off-palette pixels visible. A single off-palette `#fff` against a cream `--bg` is a regression — fix it before commit.

## Acceptance gate — three brand-resonance tests (hard pass/fail)

These three tests are **the acceptance gate** for Agent 9, not advisory examples. A re-skin where any one of them fails is not shipped — the human routes Agent 9 back to fix before declaring the project done. Mid-flight Agent 7 (read-only mode, see `07-methodology-curator.md → §2.5`) runs all three as part of its post-Agent-9 sweep when the human invokes it after a re-skin pass.

### Test 1 — Nav visual parity

The atlas-nav at the top of each admin page must be **visually indistinguishable** from the public site's main nav: same font, same weight, same letter-spacing, same height, same hover state, same active-link treatment. A reviewer landing on `/admin/whitespace.html` from `/services.html` must feel they are still on the same product, not a different SaaS that happens to embed the brand mark.

**How to verify:** open the public site's homepage and any admin page side-by-side at 1440×900. Screenshot both nav strips. Overlay them at 50% opacity. Differences > 2px on any dimension (height, padding, gap) or any visible font-stack divergence is a fail.

### Test 2 — Display heading typography

The H1 on every admin page must use **`--font-head`** from `brand-tokens.json`. No exceptions. If the public site uses Georgia serif, every admin page's H1 is Georgia serif. Body copy follows `--font-body`. KPI numbers and timestamps follow `--font-mono` if defined, else fall through to the body stack.

**How to verify:** in DevTools, inspect the H1 on every admin page. The `font-family` computed style must resolve to the same family as the public site's H1 (cascade through fallbacks is fine; the first non-fallback family must match).

### Test 3 — Band colours read correctly in theme mode

The three band tokens (`--band-green`, `--band-amber`, `--band-red`) must read **as if native** to the public site's theme mode. Green on Passage's cream `--bg` reads at `#3a7a50`; green on XinceAI's obsidian `--bg` reads at `#00ff88`. Same semantic meaning, different hex — both pulled from `--band-green` after the theme-mode class flips. A green that is "too neon for a funeral brand" or "too muddy for a HUD" means the band tokens were not theme-flipped.

**How to verify:** open `/admin/whitespace.html` and inspect the heatmap at the cell-detail panel. Each band swatch should sit on the page like a native UI affordance, not a bolted-on chart library palette. If a non-designer human review says "the green looks wrong here," that is a fail — re-derive the band tokens against the actual `--bg` of the theme mode.

### What "fail" produces

A fail on any of the three tests means Agent 9 has not finished. The human re-dispatches Agent 9 with a one-line correction note ("Test 1 fail: admin H1 is `Manrope 800` but public H1 is `Manrope 600` — match the weight"). Agent 9 fixes only the gap, commits, and the human re-runs the gate. The project does not ship until all three pass.

## Common pitfalls

### 9.1 Renaming a DOM ID

**Symptom:** beautify pass replaces `<div id="kpi-total">` with `<div class="kpi-val">` (drops the ID), and the page now renders em-dashes forever.

**Cause:** the JS renderer in the second `<script>` block does `document.getElementById('kpi-total').textContent = total`. Removing the ID breaks the renderer silently — the assignment throws on a null receiver.

**Fix:** keep every existing ID. Add classes; do not rename or remove IDs. If a card archetype expects a specific class on the same node as the ID, write `<div id="kpi-total" class="kpi-val">`. Run `grep -rn 'getElementById\|querySelector' template/assets/js/ template/admin/` before commit and confirm every selector still resolves.

### 9.2 Hardcoded hex sneaks back in

**Symptom:** a reviewer asks "why is the chart axis grey when everything else is gold?" — turns out `chart-wrap` has `border: 1px solid #d8d4cc` because that was the literal value before, and the beautify pass missed it.

**Cause:** `<style>` blocks scattered across six admin pages each contain dozens of literals. Find-and-replace catches the obvious ones; rare custom states slip through.

**Fix:** after the first sweep, run `grep -E '#[0-9a-fA-F]{3,8}' template/admin/*.html template/assets/css/*.css | grep -v 'tokens.css'` and audit every hit. Either replace with a token or move into `tokens.css` as a new derivation.

### 9.3 Theme-mode mismatch

**Symptom:** the admin's atlas-nav reads as a light, cream-coloured strip on a brand whose public site is a dark obsidian HUD. The admin "feels separate."

**Cause:** the agent extracted the public site's tokens but forgot to set `<body class="theme-dark">`. The CSS defaults to light, so band colours and surface colours stay in their light-mode hex.

**Fix:** the very first edit on every admin page is the `<body class="theme-XXX">` swap, derived from `meta.theme_mode` in `brand-tokens.json`. If the public site is dark, every admin page is dark. There is no "admins are always light for readability" — that is a different brand's choice, not ours.

### 9.4 Card archetype proliferation

**Symptom:** five new CSS classes appear in `cards.css` mid-project (`.threat-card`, `.opportunity-card`, `.benchmark-card`, `.synthesis-card`, `.outcome-card`) — none of which are in §Card library contract.

**Cause:** Agent 9 ran into a section of the page where none of the six archetypes fit, and improvised instead of escalating.

**Fix:** delete the new classes; reuse one of the six. If genuinely none fit, the right move is an Agent 7 (Methodology Curator) escalation to add a seventh archetype to this file *and* propagate it to the three reference admins. Mid-project archetype invention drifts the template.

### 9.5 Killing JS data wiring through CSS specificity

**Symptom:** clicking a heatmap cell no longer highlights — visually nothing happens — even though the click event still fires (visible in DevTools).

**Cause:** the new `cards.css` declared `.cell-selected { background: var(--accent) !important; }`, which fights with the renderer's inline-style approach, *or* the new wrapper `<section class="artifact">` introduced a stacking context that changed how the highlight ring renders.

**Fix:** never use `!important` in `cards.css`. If the renderer uses inline styles for state (selected, hover), the card CSS provides the *non-state* visuals only. The renderer wins on state. Test every interactive surface (heatmap cells, filter dropdowns, search box, sort headers) after the beautify pass; if any state visibly fails to apply, back out the offending rule.

## Performance constraints

The beautify pass must not regress the targets in `06-data-visualization-engineer.md` §Performance. In particular:

- First-paint budget remains 2s on the reference device (mid-range laptop, throttled 4G). Adding three external CSS files instead of inline styles should not exceed this; if it does, inline `tokens.css` into each page (it is small) and keep `admin.css` + `cards.css` external.
- Web font loading: if the public site uses a hosted display font (e.g. Rajdhani for XinceAI), use `font-display: swap` so the admin shows fallback first and upgrades. A FOIT (flash of invisible text) on the admin pages is unacceptable for the analytics dashboards' use case (rapid review).
- Total CSS payload across the three shared files should remain under 25KB gzipped. If it climbs past that, the pattern library has bloated and §Common pitfall 9.4 has happened.

## Accessibility

Beautify cannot regress accessibility. Specific contracts to preserve:

- Every interactive surface must keep a visible focus ring. If `tokens.css` overrides `outline: none` on inputs and buttons, it must replace it with a `box-shadow` ring keyed off `--accent`. A "clean" focus-less design is a reject.
- Colour-only state communication is forbidden. The band classes (`.cell-green / .cell-amber / .cell-red`) must continue to carry the verdict text from Agent 4 (`WHITESPACE · ATTACK`, etc.). A reviewer who is colour-blind must still read the verdict.
- Contrast: body text against `--bg` must clear WCAG AA (4.5:1 for normal, 3:1 for large). Tokens that read as `--muted` on `--surface` must be re-checked because the contrast often slips when the surface is moved up one elevation step.

Run a manual VoiceOver / NVDA pass on the heatmap and the competitor cards before declaring done.

## Deliverable checklist

Self-audit before declaring Agent 9 done.

- [ ] `data/brand-tokens.json` written with `meta.extracted_from`, all nine canonical tokens, three band tokens, three typography tokens, and `theme_mode` set.
- [ ] `template/assets/css/tokens.css` exports every token from `brand-tokens.json` as a CSS custom property on `:root`, plus `.theme-light` / `.theme-dark` overrides for the three band tokens.
- [ ] `template/assets/css/cards.css` defines exactly the six archetypes from §Card library contract — no more, no less.
- [ ] `template/assets/css/admin.css` defines atlas-nav, atlas-top, kpi-strip, artifact, .grid-2/3/4, plus the canonical `@media (max-width: 768px)` and `@media (max-width: 420px)` overrides.
- [ ] Every admin page has `<body class="theme-XXX">` matching `brand-tokens.json` `meta.theme_mode`.
- [ ] Every admin page imports the three shared CSS files at the top of `<head>`.
- [ ] `grep -E '#[0-9a-fA-F]{3,8}' template/admin/*.html` returns hits only inside the page-local 40-line `<style>` budget.
- [ ] No DOM IDs renamed or removed (run `git diff --stat` and audit each ID).
- [ ] Every renderer's selectors still resolve (`getElementById` / `querySelector` audit clean).
- [ ] Three resonance tests from §What "resonate" means pass: nav indistinguishable from public, headings use `--font-head`, band colours theme-flip correctly.
- [ ] Mobile responsive at 768px and 420px verified on every admin page.
- [ ] No `!important` declarations introduced.
- [ ] Web font payload ≤ 200KB if a custom display font is used; `font-display: swap` set.
- [ ] Manual screen-reader pass on heatmap + competitor list.
- [ ] PDF report (`admin/report.html`) re-skinned to match — print preview clean.
- [ ] Commit with message `style: beautify admin pages with <brand> aesthetics`.

If any box is unchecked, the beautify pass is not ready. The human's review is the final gate; this checklist is the floor.

## Escalation criteria

Pause and escalate to the human rather than push through.

### 12.1 Public site has no extractable tokens

**Symptom:** the public site uses inline styles or a CSS framework (Tailwind, Bootstrap) that does not expose `:root` custom properties.

**Resolution:** screenshot the public site, sample five representative colours with a colour picker, and propose those as the extracted tokens. Get human sign-off before writing `brand-tokens.json`. Do not silently invent a palette and proceed.

### 12.2 The card archetypes do not fit the data

**Symptom:** Agent 4 produced a strategic-canvas radar that needs an annotation surface no archetype provides; or Agent 2 returned a market-share dataset that wants a treemap rather than a stat tile.

**Resolution:** route through Agent 7 (Methodology Curator). Either an existing archetype gains an extension or a seventh archetype is added, in which case all three reference admins (XinceAI / EOR / Events) get retro-fitted to demonstrate the new pattern. Do not improvise.

### 12.3 Brand aesthetic conflicts with the data verdict

**Symptom:** the public site uses red as a *primary brand colour* (e.g. a fire-safety brand). Mapping `--accent → red` would collide with `--band-red`, making every "crowded · avoid" cell look like a brand element.

**Resolution:** negotiate. Either pick a brand-secondary as the analytics `--accent` (preferred) or shift the band hues into a substitute palette (orange-amber-yellow for amber-red-darkred, harder to read). The human picks; do not decide unilaterally.

## Handoff note

At the end of an Agent 9 run, produce a short note for the human:

- Which admin pages were re-skinned and which (if any) were skipped and why.
- Where `brand-tokens.json` was extracted from, plus any derivations made.
- Any §Escalation items that were resolved during the run, with the human's call recorded.
- A list of Agent 7 (Methodology Curator) tickets opened, if any (e.g. "considered adding `.timeline-card` archetype, escalated, declined this cycle").

The beautify pass is reversible — the un-skinned pages are recoverable from the prior commit. State this explicitly so the human knows there is no lock-in.
