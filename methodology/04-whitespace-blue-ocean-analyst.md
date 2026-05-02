# 04 — Whitespace & Blue Ocean Analyst

## Role one-liner

Produces the three whitespace artefacts — strategy canvas (Blue-Ocean radar), segment × need heatmap, and attack plans — that together make the "where to play" answer visual and unambiguous.

## Visual target

The three artefacts below are the deliverable shape. Reproduce the structure, not the exact styling.

![Strategy canvas radar](reference/whitespace-reference-xinceai-radar.png)

Reproduce: a radar/spider plot with 6–10 customer-evaluation dimensions on the spokes, one line per competitor plus a bold line for `us`. The goal is to show, at a glance, where the competitor cluster converges and where our line breaks away.

![Heatmap grid](reference/whitespace-reference-xinceai-heatmap.png)

Reproduce: segments × needs grid, each cell colour-coded by count of competitors scoring ≥ 3 on that pair (green 0–1, amber 2–3, red 4+). Our score on each cell is a secondary signal rendered as a small glyph or border.

![Cell detail panel](reference/whitespace-reference-xinceai-cell-detail.png)

Reproduce: clicking any cell opens a detail panel listing every competitor that serves that pair, each with a one-line pair-specific specialisation and their score. Green 0–1 cells with our_score ≥ 4 are flagged as attack candidates.

## When to dispatch

After Agent 1 completes. Agent 4 reads `competitors.json` as ground truth — specifically the `features`, `target_market`, `strengths`, and `sg_monthly_sgd` fields. Re-dispatch when the competitor universe shifts (new entrant, pivot, acquisition) or when the segment hypothesis materially changes.

## Inputs the agent needs

- **`competitors.json`** from Agent 1 — full record set, not just the Top-5.
- **Segment hypothesis** from the project brief — a draft list of 8–15 buyer segments the product is considering serving. If the brief lacks this, block and escalate; do not invent segments.
- **Needs hypothesis** (optional) — if the brief lists buyer jobs-to-be-done, use them as a starting point for the need axis. Otherwise derive needs from the union of competitor `features` and case-study outcomes.
- **Our own `features`, `strengths`, and SG-localisation posture** — needed to score `us` on every dimension and cell. If we are pre-launch, score against the planned feature set and flag as `our_score` projections.

## Artefact 1 — Strategy Canvas

The canvas is a radar plot that shows how competitors cluster on the dimensions buyers actually use to evaluate the category. Our job is to find the dimension combination where our line breaks the cluster.

### 1.1 Pick 6–10 dimensions (default 8)

Dimensions must be **customer evaluation axes**, not feature lists. A customer evaluation axis is something a buyer would say out loud while comparing vendors. A feature is a checkbox inside one of those axes.

- Good dimension examples: `sg_localisation`, `setup_simplicity`, `price_floor`, `integration_breadth`, `support_responsiveness`, `compliance_posture`, `time_to_value`, `onboarding_handholding`.
- Bad dimension examples: `has_mobile_app`, `uses_react`, `supports_SSO`, `dark_mode_available` — these are features, not axes.

Test: if a buyer in a sales call would phrase it as "how well do they do X?" it is an axis. If they would phrase it as "do they have X?" it is a feature.

### 1.2 Score every competitor + `us` on each dimension 0–5

Score with a rubric per dimension. Do not score by vibes. Below is the XinceAI-tested rubric for `sg_localisation`, use it verbatim and write analogues for every other dimension.

```
sg_localisation:
  0 — No SG presence; USD pricing only; no SG entity.
  1 — Sells into SG via global site; SGD billing at checkout only.
  2 — SG entity exists; SG-localised pricing page; no PSG; no SG data residency.
  3 — PSG eligible OR SG data residency OR SG-native integration (PayNow / Peppol).
  4 — Two of: PSG, SG residency, SG-native rails; founder or team in SG.
  5 — All three structural edges (PSG + residency + SG rails) AND founder-led SG support in English/Mandarin/Bahasa.
```

Every dimension needs a similar 0–5 ladder. Store the rubric alongside the canvas JSON; the next re-run must use the same ladder or scores become incomparable.

### 1.3 Write the `headline_thesis`

One sentence. Names where our line MUST break the cluster. This is the canvas's single piece of prose and the most-quoted artefact downstream.

- Good: "We beat the cluster on `sg_localisation` (PSG + residency + Singlish support) and `setup_simplicity` (sub-30-min onboarding), at the cost of `integration_breadth` — a deliberate trade we defend with a curated connector roadmap."
- Good: "The only unoccupied corner is high `compliance_posture` + low `price_floor` — every competitor trades one for the other; we take both by shipping a PSG-priced MAS-TRM-ready SKU."
- Bad: "We are a strong competitor with great UX and good pricing." — names no axes, no trade-offs, no evidence.
- Bad: "Our product is better on every axis." — implausible, unprovable, signals sloppy scoring.

If the thesis does not name at least two specific axes and at least one trade-off, rewrite.

### 1.4 Write JSON

Canvas JSON shape per `FIELD-DICTIONARY.md` §5 (dimensions[], scores{competitor_id: {dim: int}}, rubrics{dim: string}, headline_thesis). Do not duplicate the schema here; the dictionary is authoritative.

### 1.5 Reading the canvas

Once scored, read the radar before shipping. Two patterns to look for:

- **The cluster.** If every competitor's line traces roughly the same shape — high on `feature_breadth` and `integration_breadth`, low on `sg_localisation` and `price_floor` — that is the Red Ocean. Our line must leave the cluster, not join it.
- **The unoccupied corner.** The axes where *no* competitor scores above 3 are the candidate attack axes. Confirm the low scores are structural (they can't easily move) rather than accidental (they just haven't bothered).

If our line looks identical to the cluster, the thesis is wrong or the scoring is wrong. Re-score before rewriting.

## Artefact 2 — Heatmap

The heatmap is the where-to-play lens. Each cell = one (segment, need) pair. Colouring comes from competitor density; our_score overlays whether we can credibly attack.

### 2.1 Pick 8–15 segments

Each segment needs a one-line descriptor. A segment is a **buyer archetype you could sell differently to** — not a vertical, not a firmographic cut unless firmographics genuinely change the buyer.

- Good: `sg_sme_prof_services` — SG SMEs 10–50 headcount in professional services (legal, accounting, consulting); budget-owner is the managing partner.
- Good: `sg_regulated_mid_market` — SG 200–1000 headcount with MAS / PDPA-Advanced obligations; buyer is a head of compliance paired with a head of IT.
- Bad: `tech_companies` — too broad; the sales motion is different for a 5-person startup vs. a 500-person scale-up.
- Bad: `fintech` — a vertical, not a buyer; a retail payments fintech and a wealth RegTech fintech buy differently.

### 2.2 Pick 8–15 needs

Each need has a **short handle** (snake_case, for the grid header) and a **full name** (for the detail panel and report).

- `structured_docs` / "Structured, searchable internal documentation"
- `onboarding_<30min` / "Self-serve onboarding under 30 minutes without CSM involvement"
- `paynow_reconciliation` / "Automated PayNow + bank reconciliation for SG SMEs"
- `mas_trm_audit_trail` / "MAS TRM-compliant audit trail with immutable event log"

The short handle is what the heatmap renders; the full name is what the reader sees in the detail panel and in Agent 8's appendix.

### 2.3 Score every competitor × segment × need 0–5

`score ≥ 3` is the threshold for "genuinely serves this pair." Below 3 means the competitor touches it incidentally (a feature that happens to work for the segment) but does not pitch, price, or support the pair as a first-class use case. Use the same 0–5 rubric discipline as the canvas: a ladder per need if you can, or a shared ladder with concrete anchors.

A competitor scoring 4 on `structured_docs` for `sg_sme_prof_services` means: they have case studies in that segment, their pricing page speaks to that buyer, and their support is resourced for that use case. A 2 means "technically works, not positioned here."

### 2.4 Write `specialisation_for_cell` for every competitor scoring ≥ 3

This is the most important rule in the heatmap. For every (competitor, segment, need) where score ≥ 3, write a `specialisation_for_cell` string, ≤ 120 chars, **pair-specific**. The same competitor will appear in many cells with different specialisations; each must be different, because each pair is a different pitch.

- Good (pair-specific): "Notion × sg_sme_prof_services × structured_docs: law-firm template pack with precedent libraries; 40% of SG law firm G2 reviews mention it."
- Good (pair-specific): "Notion × sg_regulated_mid_market × mas_trm_audit_trail: immutable audit log is a paid Enterprise add-on only; not the default posture."
- Bad (generic): "Notion × sg_sme_prof_services × structured_docs: Notion is a strong collaboration tool." — says nothing about the pair.
- Bad (generic): "Notion × sg_regulated_mid_market × mas_trm_audit_trail: Notion has enterprise features." — feature list, not a pair fit.

If you cannot write a pair-specific specialisation, the competitor's score on that cell is probably < 3. Lower the score rather than paper over a generic line. This is the single lever that makes or breaks Agent 8's Cell Detail Appendix.

**Specialisation patterns by category archetype.** Pattern-match to the closest archetype below for the texture of a passing line. The pattern is in the *shape*, not the words.

- **SaaS feature × segment** — name the feature, name a piece of evidence:
  *"Notion × sg_sme_prof_services × structured_docs: law-firm template pack with precedent libraries; cited in 40% of SG law firm G2 reviews."*
- **Compliance/credential × regulated segment** — name the credential, name what it gates:
  *"Visionnaire × esg_screened_glc × iso_20121_esg: ISO 20121 + EcoVadis Gold; only SG agency cleared for SGX-Climate-Disclosure-aligned event RFPs."*
- **In-house capacity × throughput-sensitive segment** — name the headcount/capacity, name the throughput it unlocks:
  *"Pico × annual_dnd_coordinator × broadcast_hybrid: 350-staff in-house broadcast crew; 4-camera switcher + captioning ships day-of with no subcontract."*
- **Pricing model × budget-anchored segment** — name the model, name the anchor it competes with:
  *"Get Out! Events × annual_dnd_coordinator × published_pricing: 2026 cost guide PDF lists per-pax bands SGD 80–180; only mid-market agency below the 'contact us' wall."*
- **Geographic/lang reach × cross-border segment** — name the country and what works there:
  *"Financio × my_sg_sme × paynow_reconciliation: SG PayNow added 2025 but only for SGD accounts; MY-first billing means MYR multi-currency stays the wedge."*
- **Adjacent-product attach × adjacent need** — name the existing product, name the attach mechanism:
  *"Xero × sg_accounting_firm × paynow_reconciliation: native bank feeds into the existing GL workflow; no separate login or export step."*

What every passing line has in common: a **proper noun** (the feature, the credential, the headcount, the geography), and a **piece of evidence or numeric** (a review percentage, a SGD figure, a year, a count). Lines without either are wallpaper.

### 2.5 Score `us` on each cell → `our_score`

Same 0–5 scale. Be honest — an `our_score: 5` in a green cell is an attack candidate; an `our_score: 2` in a green cell is a "we would need to build this first" candidate, which is a different kind of plan.

### 2.6 Write JSON

Heatmap JSON shape per `FIELD-DICTIONARY.md` §6 (segments[], needs[], cells[]). Do NOT store competitor counts or colour bands in JSON — those are render-time derived from `cells[].competitor_scores`. Storing them duplicates state and guarantees drift.

### 2.7 Worked cell example

One cell, fully written, to show the texture the rest of the heatmap should aim for.

```
segment: sg_sme_prof_services
need: paynow_reconciliation
our_score: 5
competitor_scores:
  - competitor_id: xero
    score: 4
    specialisation_for_cell: "Xero × sg_sme_prof_services × paynow_reconciliation: native PayNow bank feed for DBS/OCBC/UOB; 80% of SG accounting-firm G2 reviews cite it."
  - competitor_id: quickbooks
    score: 2        # below 3 threshold — no specialisation written
  - competitor_id: financio
    score: 3
    specialisation_for_cell: "Financio × sg_sme_prof_services × paynow_reconciliation: MY-first product; SG PayNow added 2025 but only for SGD accounts, no multi-currency reconciliation."
verdict (render-time): AMBER · 2 competitors score ≥ 3 → CONTESTED
```

Note: QuickBooks at score 2 gets no specialisation line — it touches the cell incidentally. Writing a line for it would either fake specificity or generate the generic wallpaper Pitfall 6.3 forbids.

## Artefact 3 — Attack Plans (exactly 3)

Pick three green cells (count 0–1, `our_score ≥ 4`). Not two, not five. Three forces prioritisation and lets Agent 8's report carry each plan in full without overflowing.

### 3.1 Rank candidates

Rank eligible green cells by:

```
TAM × inverse(competitor_count) × our_advantage
```

Where `inverse(competitor_count)` = `1 / (count + 1)` (so count 0 → 1.0, count 1 → 0.5), and `our_advantage` = `our_score / 5`. Pick the top 3.

### 3.2 Per-plan fields

Each attack plan carries:

- `rank` — 1, 2, 3 (strictly ordered).
- `niche_name` — **≤ 60 characters, headline-style.** This is the field most often abused: agents write paragraph-length subtitles ("Manpower-bundled brand activation (Elitez Group ecosystem moat)" = 64 chars, too long). Cards and the PDF report assume the niche name fits a single line at H3 weight. The rule:
  - **Good (≤ 60):** "PSG-priced PayNow reconciliation wedge" (38), "Opacity-arbitrage pricing wedge" (32), "ISO-20121 ESG wedge for GLC procurement" (40)
  - **Bad (> 60):** "Manpower-bundled brand activation (Elitez Group ecosystem moat)" (64), "AI-enabled hybrid production lined up for IMDA 2027-Q1 GenAI grant" (67)
  - If your name needs parentheses to qualify it, the parenthetical belongs in `why_we_win`, not the name.
  - Agent 7 in mid-flight mode (and Agent 8's pre-flight validator) hard-fail any `niche_name > 60 chars`.
- `icp` — one sentence describing the buyer archetype inside the cell's segment.
- `whitespace_segment_id` — optional FK into `heatmap.segments[].id`. Populate when the plan maps cleanly onto a single heatmap row; lets Agent 8 visually cross-link plan → cell. Leave empty when the plan spans multiple segments.
- `tam_estimate_sgd` — integer SGD annual TAM for this cell's ICP × need.
- `tam_reasoning` — 2–3 sentences showing how you arrived at the TAM (count × price × attach rate), consistent with Agent 2's market sizing method.
- `why_gap` — why the cell is green; which structural reason keeps competitors out.
- `why_we_win` — which `our_score: 4–5` capability we lean on.
- `gtm` — object with `channel`, `pitch`, `pricing`, `content`:
  - `channel` — specific acquisition channel ("PSG listing page + SGTech partner webinar series").
  - `pitch` — one-line value prop for this ICP in the buyer's words.
  - `pricing` — SG-specific monthly or per-seat price with PSG post-grant number.
  - `content` — the 3–5 content assets the plan needs in its first 90 days.

If any field is vague ("digital marketing" as a channel, "competitive pricing" as pricing), rewrite. The plan is useless to operators unless every line is specific enough to execute.

### 3.3 Worked attack plan

One plan, fully written, to show target texture. Assume an SG SME PayNow-reconciliation wedge.

```
rank: 1
niche_name: "PSG-priced PayNow reconciliation for SG accounting firms"
icp: "SG accounting-firm partners serving 30–200 SME clients, currently paying bookkeepers to hand-reconcile PayNow + GIRO transactions across DBS/OCBC/UOB."
tam_estimate_sgd: 14_400_000
tam_reasoning: "~2,400 SG accounting firms (ACRA 2025 filter on 'accounting services' + active), assume 40% have >30 SME clients = ~960 target firms. At SGD 15k/year per firm post-PSG (50% grant), annual TAM = 960 × 15,000 = SGD 14.4M."
why_gap: "Xero and QuickBooks solve general-ledger reconciliation but not PayNow-first workflows; Financio has PayNow but MY-first billing and no multi-currency. No competitor scores ≥3 on this exact pair."
why_we_win: "our_score 5 driven by three structural edges: (1) PSG pre-approval (50% grant halves buyer price), (2) PayNow-native data model (not bolted on), (3) direct DBS/OCBC/UOB bank feeds already live. All three are 12-month-defensible per beatability rubric."
gtm:
  channel: "Institute of Singapore Chartered Accountants (ISCA) Practitioners' Conference sponsorship + ISCA member-rate partner page + targeted LinkedIn ads to 'Partner / Director' at SG accounting firms <50 headcount."
  pitch: "Replace 6 hours/week of PayNow reconciliation per bookkeeper with a 15-minute end-of-week review. Half-price via PSG."
  pricing: "SGD 2,500/year per firm list; SGD 1,250/year post-PSG. Unlimited client accounts; per-seat add-ons for bookkeepers above 5."
  content:
    - "ISCA-branded case study with 3 early firms showing hours/week saved."
    - "Ungated 'SG PayNow reconciliation teardown' blog post comparing manual vs. automated workflows."
    - "On-demand 20-minute webinar recorded with an ISCA Fellow, hosted on ISCA portal."
    - "Accounting-partner-focused one-pager (PDF) covering PSG application steps."
```

Every field is specific enough that a GTM lead could start Monday. Vague fields ("social media," "competitive pricing") would make the plan undeployable.

## Verdict banner copy (fixed)

These strings are used verbatim in both the viz and the report. Do not rephrase.

- **Green 0–1 competitors**: `WHITESPACE · ATTACK`
- **Amber 2–3 competitors**: `CONTESTED · CHOOSE WISELY`
- **Red 4+ competitors**: `CROWDED · AVOID`

Render-time logic derives the banner from `cells[].competitor_scores` (count of competitors with score ≥ 3). Do not store the verdict string in JSON — it would drift if someone edited scores without updating the string.

## Pitfalls

### 6.1 Feature-list dimensions

Dimensions like `has_mobile_app` or `supports_SSO` are features, not evaluation axes. Fix: apply the customer-evaluation test — a buyer on a sales call would phrase an axis as "how well do they do X?" and a feature as "do they have X?"

### 6.2 Vague headline thesis

Theses like "we're strong on UX and pricing" name no axes. Fix: the thesis MUST name the specific axes (by canvas dimension name) where we break the cluster, and at least one axis where we deliberately concede.

### 6.3 Generic `specialisation_for_cell`

"Notion is strong" repeated across 40 cells. Fix: the line must be pair-specific — it must name something about *this* segment × *this* need that *this* competitor does. If you can't, lower the cell score rather than write a generic line.

### 6.4 Attack plans in amber or red cells

Picking an attack in a 3-competitor cell because `our_score` is high. Fix: attacks are green-only (count 0–1). Amber and red cells get different recommendations (contested: where to differentiate; crowded: avoid). If there are fewer than 3 green cells with `our_score ≥ 4`, that's a finding — surface it; do not downgrade the bar.

### 6.5 Scoring `us` by aspiration

`our_score: 5` across the board when we're pre-launch is the single fastest way to invalidate the artefact. Fix: score against shipped or demo-able capability today. If we are pre-launch, score against the MVP scope and flag `our_scores_are_projections: true` in the canvas meta. Agent 8 reads this flag and footnotes accordingly.

### 6.6 Too many segments or needs

A 20 × 20 heatmap is unreadable and usually means the agent didn't commit to a segment hypothesis. Fix: hold the 8–15 × 8–15 bound. If you genuinely need more, split into two heatmaps (e.g. SG-domestic vs. SEA-regional) and deliver both; do not inflate one grid past the bound.

## Handoff

### 7.1 To Agent 6 (Visualisation)

Agent 6 renders the canvas radar, the heatmap grid, and the cell detail panel directly from your JSON. It does not re-derive competitor counts or verdict strings — those come from your `cells[].competitor_scores` at render time. If Agent 6 asks for "the colour bands," point it to the fixed banner copy in Section 5.

### 7.2 To Agent 8 (Report)

The report's Cell Detail Appendix inlines every `specialisation_for_cell` for two cell classes:

- **Every green 0–1 cell** — so the reader sees why each attack-eligible pair is actually empty.
- **Every red 4+ cell** — so the reader sees what the crowded fights look like when deciding what not to do.

If your specialisations are generic, the appendix reads as wallpaper. Pair-specific lines are what make the appendix worth reading.

### 7.3 Re-run protocol

When re-dispatched against an existing `whitespace-framework.json`:

- Preserve dimension handles and need handles across re-runs. Renaming a handle cascades the same way a competitor `id` rename does (Section 5.2 of Agent 1) — route through Agent 7 if a rename is unavoidable.
- Recompute `our_score` and competitor scores against the current `competitors.json`. If a competitor was deleted in Agent 1's re-run, drop it from every cell (not just from the canvas).
- If the headline_thesis changes, note the old thesis in the handoff so Agent 8 can decide whether to mark the change in the report's changelog section.
- If a new attack plan replaces an old one, state the reason explicitly ("old plan's green cell turned amber after CompetitorX entered the PSG-priced segment in 2026-Q2").

## Cross-reference: Agent 3 vs. Agent 4

The two "strategy" agents have adjacent-sounding jobs; confusion between them is the most common source of duplicated work.

- **Agent 3 (Pricing Strategy)** answers *how to price against the competitor set* — elasticity curves, tier architecture, PSG-cap discipline, floor/ceiling anchoring. It uses `sg_monthly_sgd` across `competitors.json` as its primary substrate.
- **Agent 4 (this document)** answers *where to play* — which buyer × need pairs to attack. It uses `features`, `target_market`, and `strengths` across `competitors.json` as its primary substrate.

Where they overlap: attack-plan `pricing` lines in Section 3.2 are a pointer to Agent 3's tier recommendation for the ICP, not an independent pricing analysis. If an attack plan's `pricing` line contradicts Agent 3's recommendation, one of them is wrong — reconcile before handoff to Agent 8.

## Escalation criteria

Certain findings require pausing and escalating rather than pushing through.

### 9.1 Fewer than 3 green cells with `our_score ≥ 4`

The set may genuinely have no whitespace we can credibly attack. The right output is "the category is saturated for our current capability; here are the 1–2 contested cells with the most defensible differentiation play." Do not downgrade to 3+ competitor cells just to hit the "exactly 3" count.

### 9.2 Canvas line traces the cluster

Our line is indistinguishable from 2+ competitor lines. Either (a) we haven't picked the right dimensions — re-run Section 1.1, or (b) the thesis is genuinely "join the cluster and win on execution" — which is a legitimate answer but belongs in Agent 3's pricing work, not in a Blue Ocean canvas. Escalate.

### 9.3 Every cell is amber

No greens, no reds. Usually means the competitor set has too many "close enough" scores at 3. Re-apply the ≥ 3 threshold strictly: only count a competitor on a cell if you can write a pair-specific specialisation. Rescore, then re-check.

## Deliverable checklist

- [ ] Strategy canvas JSON: 6–10 dimensions, 0–5 scores for every competitor + `us`, 0–5 rubric per dimension, `headline_thesis` that names specific axes AND a trade-off.
- [ ] Heatmap JSON: 8–15 segments × 8–15 needs, every cell scored for every competitor + `us`.
- [ ] Every competitor scoring ≥ 3 on a cell has a pair-specific `specialisation_for_cell` (≤ 120 chars). No generic lines.
- [ ] Exactly 3 attack plans, each on a green 0–1 cell with `our_score ≥ 4`, ranked by TAM × inverse(competitor_count) × our_advantage.
- [ ] Each attack plan has: rank, niche_name, icp, tam_estimate_sgd, tam_reasoning, why_gap, why_we_win, gtm{channel, pitch, pricing, content}.
- [ ] No counts, bands, or verdict strings stored in JSON — all render-time derived.
- [ ] Handoff note to Agent 6 (what to render) and Agent 8 (which cells to inline in the appendix).
