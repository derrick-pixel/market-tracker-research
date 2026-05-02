# FIELD-DICTIONARY

## 1. Introduction

This file is the canonical schema reference for every JSON data file in `/template/data/`. Every field in any data file must be documented here before first use. There are no silent fields in this project: if a field appears in sample data, a rendered view, or an agent output without being catalogued below, that is a defect. The dictionary exists so agents, human editors, and downstream templates share one source of truth for what each key means, what values it accepts, and what its absence implies.

If you need a new field, you must add it here first, then populate sample data with a concrete example, and only then may agents or views reference it. The ordering matters: dictionary entry, then sample data, then consumption. See Section 9 for the exact add-a-field workflow. When in doubt, assume the field does not exist yet and propose it through the Methodology Curator (Agent 7).

## 2. Shared `meta` block

Every file inside `/template/data/*.json` opens with a `meta` block. This block is identical in shape across files and lets tooling know which project, which brand, and which point-in-time a dataset reflects.

| Field | Type | Required | Description | Example |
|---|---|---|---|---|
| `meta.project_name` | string | yes | Human-readable project name | `"XinceAI 2026"` |
| `meta.brand_tokens` | object | yes | See brand_tokens sub-schema below | `{...}` |
| `meta.research_date` | YYYY-MM-DD | yes | Date of last full refresh of this file | `"2026-04-24"` |
| `meta.sample_data` | boolean | yes | `true` if this is scaffold sample data, `false` for real project data | `false` |

### Sub-schema `meta.brand_tokens`

All string, all required. These tokens feed the rendering layer so swapping projects re-skins the whole template.

| Field | Type | Required | Description |
|---|---|---|---|
| `primary` | string | yes | Primary brand colour (hex or named CSS colour) |
| `secondary` | string | yes | Secondary brand colour |
| `accent` | string | yes | Accent / highlight colour |
| `neutral_dark` | string | yes | Dark neutral (text on light, container on dark themes) |
| `neutral_light` | string | yes | Light neutral (background, surface) |
| `font_display` | string | yes | Display typeface family |
| `font_body` | string | yes | Body typeface family |

## 3. `competitors.json` fields

Top-level shape: `{ meta, top_five[], competitors[] }`. The `meta` block follows Section 2. The `top_five[]` array is documented in Section 4. Each entry inside `competitors[]` must carry the following fields.

| Field | Type | Required | Allowed / range | Description |
|---|---|---|---|---|
| `id` | string | yes | lowercase-with-underscores | Stable unique ID used as foreign key in other files |
| `name` | string | yes |  | Display name |
| `url` | string | yes | valid URL | Homepage URL |
| `category` | string | yes | see Section 8 Enums | Competitor archetype |
| `hq` | string | yes |  | City, Country of headquarters |
| `hq_region` | string | yes | `SEA` \| `APAC` \| `Global` \| `Other` | Region bucket for filtering |
| `target_market` | string[] | yes |  | Customer segments they serve |
| `countries_covered` | string[] | yes |  | Countries where they have paying customers |
| `sg_monthly_sgd` | number or null | yes | `>= 0` or null | Our-market (Singapore) price per month; null if not applicable or not offered in SG |
| `pricing_range_published` | string | yes |  | Human-readable price range as published / triangulated |
| `pricing_flag` | string | yes | `public` \| `partial` \| `hidden_estimated` | How public the price is |
| `primary_value_prop` | string | yes | <= 120 chars | Their one-sentence pitch, paraphrased |
| `features` | string[] | yes |  | Notable features (short phrases) |
| `strengths` | string[] | yes |  | Evidence-anchored strengths |
| `weaknesses` | string[] | yes |  | Evidence-anchored weaknesses |
| `threat_level` | integer | yes | 1-5 | Per rubric in `01-competitor-intel.md` |
| `beatability` | integer | yes | 1-5 | Per rubric in `01-competitor-intel.md` |
| `market_share_estimate_pct` | number or null | yes | 0-100 or null | Only fill if cited or triangulated; otherwise null |
| `research_date` | YYYY-MM-DD | yes |  | Per-record research date (may lag the file-level `meta.research_date`) |
| `website_design_rating` | number or null | yes | 1-10 or null | Per `05-website-design.md` rubric |
| `website_design_notes` | string | yes | <= 160 chars | Required if any website design dimension scored <= 6 |
| `website_screenshot_path` | string | yes |  | Relative path to screenshot inside the repo |
| `website_screenshot_path_mobile` | string | no |  | Relative path to mobile-viewport screenshot (375×667), captured by Agent 5 in dual-viewport mode |
| `findability_seconds` | object | no |  | Three-intent findability triplet from Agent 5 (see §3.1) |
| `implications[]` | object[] | no |  | Per-competitor strategic reads. Same shape as `market_size.implications[]` (see §5.1.2) — `headline`, `body`, `agent_targets[]`. Use this when a single competitor fact has narrow, agent-specific consequences (e.g. "Pico's 350-staff in-house broadcast crew → agent_4 must score them 5/5 on hybrid_capability"). |

### 3.1 Sub-schema `competitors[].findability_seconds`

Captured by Agent 5 with a stopwatch on the live competitor site (1440×900 desktop). Each value is the wall-clock seconds a first-time visitor takes to find the named intent. `null` means the intent could not be found within 30 seconds.

| Field | Type | Required | Allowed | Description |
|---|---|---|---|---|
| `pricing` | number or null | yes | 0–30 or null | Seconds to surface a price, a tier table, or "contact for pricing" |
| `demo` | number or null | yes | 0–30 or null | Seconds to reach a demo / trial / sandbox CTA |
| `contact` | number or null | yes | 0–30 or null | Seconds to reach a sales contact form, email, or scheduling link |

## 4. `top_five[]` array

Curated by Agent 1 (Competitor Intel) per the selection rubric in `01-competitor-intel.md`. Each entry is a lightweight reference pointing back at a full record in `competitors[]`.

| Field | Type | Required | Allowed / range | Description |
|---|---|---|---|---|
| `competitor_id` | string | yes | foreign key to `competitors[].id` | Which competitor this entry describes |
| `rank` | integer | yes | 1-5 | Placement in the curated Top-5 |
| `rationale` | string | yes | <= 200 chars | Why this competitor made the Top-5 |

## 5. `market-intelligence.json` fields

Top-level shape: `{ meta, market_size, policies[], cultural_signals[], economic_signals[], adoption_patterns, trends[] }`. The `meta` block follows Section 2. The rest is below.

### 5.1 `market_size`

| Field | Type | Required | Description |
|---|---|---|---|
| `tam_sgd` | number | yes | Total Addressable Market (numeric, in the project's primary currency — `currency_label` controls display) |
| `sam_sgd` | number | yes | Serviceable Addressable Market |
| `som_sgd` | number | yes | Serviceable Obtainable Market |
| `currency_label` | string | no | Display prefix for the three figures and every `result_label`. Defaults to `"SGD"`. Use `"AUD"`, `"HKD"`, `"USD"`, etc. when the project's primary currency is not SGD. The field name suffix `_sgd` is preserved for template compatibility regardless. |
| `derivation_flow` | object | yes | Structured TAM → SAM → SOM funnel. See §5.1.1. Replaces the legacy `reasoning` wall-of-text; once populated, the renderer prefers this over `reasoning`. |
| `implications[]` | object[] | yes | 3–6 strategic implication cards. See §5.1.2. Replaces the legacy single-string `implication_for_us` paragraph; once populated, the renderer prefers this over `implication_for_us`. |
| `methodology_appendix` | string | yes | Verbatim long-form prose preserving the chain of reasoning behind the figures. Rendered inside a `<details>` collapsed by default. This is the loss-less back-stop: every fact in the wall-of-text version must survive here. |
| `sources[]` | object[] | yes | Citations supporting the numbers |
| `sources[].title` | string | yes | Human title of the source |
| `sources[].url` | string | yes | URL of the source |
| `reasoning` | string | no | DEPRECATED legacy field. New projects MUST omit this and rely on `derivation_flow` + `methodology_appendix`. Existing projects may keep it for back-compat; if both `reasoning` and `methodology_appendix` are present, the renderer uses `methodology_appendix`. |
| `implication_for_us` | string | no | DEPRECATED legacy field. New projects MUST omit this and rely on `implications[]`. Existing projects may keep it for back-compat; if both are present, the renderer uses `implications[]`. |

#### 5.1.1 `derivation_flow`

A three-stage object — exactly the keys `tam`, `sam`, `som` — each pointing to a stage block. Stage blocks share one shape; what changes is how the `stacks[]` array is populated (TAM stacks are bottom-up market layers, SAM stacks are reach-filtered subsets or per-region rollups, SOM stacks are revenue channels or year-by-year ramp rows).

| Field | Type | Required | Description |
|---|---|---|---|
| `derivation_flow.<stage>.stage_label` | string | yes | Short uppercase label, e.g. `"STAGE 1 · TAM"` |
| `derivation_flow.<stage>.subtitle` | string | yes | One-sentence framing of what this stage represents (≤ 200 chars) |
| `derivation_flow.<stage>.result_label` | string | yes | Display string for the stage total (e.g. `"A$528M"`); the numeric ground truth lives in `tam_sgd` / `sam_sgd` / `som_sgd` |
| `derivation_flow.<stage>.total_equation` | string | yes | The arithmetic that yields the result, e.g. `"228 + 41 + 16 + 84"` or `"30% × S$816M"` |
| `derivation_flow.<stage>.filters[]` | string[] | no | Qualitative criteria narrowing this stage from the previous one (typically used on `sam`). Each entry ≤ 100 chars. Rendered as a chip row above the stacks. |
| `derivation_flow.<stage>.stacks[]` | object[] | yes | One entry per build-up component. See below. Minimum 1 stack per stage. |
| `derivation_flow.<stage>.stacks[].name` | string | yes | Short title for the stack (≤ 80 chars) |
| `derivation_flow.<stage>.stacks[].source` | string | yes | Citation or methodology note for this specific stack (≤ 160 chars) |
| `derivation_flow.<stage>.stacks[].inputs[]` | object[] | yes | Label/value pairs displayed as chips. Minimum 1 input. |
| `derivation_flow.<stage>.stacks[].inputs[].label` | string | yes | Short label (≤ 30 chars) |
| `derivation_flow.<stage>.stacks[].inputs[].value` | string | yes | Display value with units (≤ 30 chars) |
| `derivation_flow.<stage>.stacks[].equation` | string | yes | The arithmetic for this single stack (≤ 120 chars) |
| `derivation_flow.<stage>.stacks[].result_label` | string | yes | Display string for the stack's contribution to the stage total |

#### 5.1.2 `implications[]`

Strategic reads of what the sizing means for the project. Replaces the second wall-of-text paragraph that historically lived in `implication_for_us`. Each item is one decision, one segment, or one timeline — never a generic "monitor the market." See §3 of `02-market-intelligence-analyst.md` for the implication-quality rubric.

| Field | Type | Required | Description |
|---|---|---|---|
| `implications[].headline` | string | yes | Punchy one-line decision or framing (≤ 90 chars). Example: `"Series A justified without dominance"` |
| `implications[].body` | string | yes | 2–3 sentence elaboration. Names a concrete action, segment, or timeline. (≤ 480 chars) |
| `implications[].agent_targets[]` | string[] | no | Which downstream agents act on this implication, e.g. `["agent_3", "agent_4"]`. Used by the report-generator to thread the narrative into later sections. |

### 5.2 `policies[]`

| Field | Type | Required | Allowed | Description |
|---|---|---|---|---|
| `title` | string | yes |  | Short policy name |
| `body` | string | yes |  | 2-4 sentence summary |
| `sentiment` | string | yes | `support` \| `neutral` \| `against` | Directional impact on our category |
| `effective_date` | YYYY-MM-DD | yes |  | When the policy took effect |
| `sunset_date` | YYYY-MM-DD | no |  | When it ends, if known |
| `url` | string | yes |  | Link to primary source |
| `data_as_of` | YYYY-MM-DD | yes |  | When we captured this record |
| `implication_for_us` | string | yes |  | Concrete implication for our plan |

### 5.3 `cultural_signals[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `observation` | string | yes | The cultural / behavioural pattern observed |
| `evidence` | string | yes | Specific evidence with date / source where possible |
| `implication_for_us` | string | yes | What we should do about it |

### 5.4 `economic_signals[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `indicator` | string | yes | Name of the indicator (e.g. "SG SME IT spend YoY") |
| `value` | string | yes | Value with units and period |
| `source_url` | string | yes | Link to primary source |
| `implication_for_us` | string | yes | What we should do about it |

### 5.5 `adoption_patterns`

| Field | Type | Required | Range | Description |
|---|---|---|---|---|
| `sme_penetration_pct` | number | yes | 0-100 | Estimated SME penetration of the category |
| `mnc_penetration_pct` | number | yes | 0-100 | Estimated MNC penetration |
| `note` | string | yes |  | Caveats, definitions, and methodology |
| `country_readiness[]` | object[] | yes |  | Array, one entry per country of interest |
| `country_readiness[].country` | string | yes |  | Country name |
| `country_readiness[].regulatory` | integer | yes | 1-5 | Regulatory readiness |
| `country_readiness[].tech_maturity` | integer | yes | 1-5 | Tech maturity |
| `country_readiness[].price_tolerance` | integer | yes | 1-5 | Price tolerance |

### 5.6 `trends[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `title` | string | yes | Short trend label |
| `evidence` | string | yes | Evidence with date / source |
| `implication_for_us` | string | yes | What we should do about it |

## 6. `pricing-strategy.json` fields

Top-level shape: `{ meta, personas[], pricing_models[], elasticity_heuristics[], recommended_tiers[], grants[] }`. `meta` follows Section 2.

### 6.1 `personas[]`

Cap: a project ships with **at most 5 personas**. Two personas that share ≥ 60% of `pains[]` must be merged or one must be cut. See `03-pricing-strategy-analyst.md` for the persona-collapse audit. Personas exceeding the cap or sharing pain sets above threshold are a defect that Agent 7 will flag.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | string | yes | Stable lowercase-with-underscores ID. Foreign key target for cross-file references. |
| `name` | string | yes | Persona display name |
| `icp` | string | yes | Ideal customer profile sentence |
| `pains[]` | string[] | yes | Top pains this persona experiences |
| `current_workaround` | string | yes | How they cope today without us |
| `wtp_band_sgd` | object | yes | Willingness to pay band in SGD |
| `wtp_band_sgd.low_anchor` | number | yes | Low anchor price |
| `wtp_band_sgd.expected` | number | yes | Expected price |
| `wtp_band_sgd.upper_stretch` | number | yes | Upper stretch price |
| `nba` | object | yes | Next best alternative as a structured arithmetic block. See §6.1.1. |
| `whitespace_segment_ids[]` | string[] | no | Foreign keys into `whitespace-framework.json → heatmap.segments[].id`. Lets Agent 8 auto-cross-link "Persona X" to its corresponding heatmap row(s). One persona may map to multiple segments; one segment may serve multiple personas. |
| `implications[]` | object[] | no | Same shape as §5.1.2 — `headline`, `body`, `agent_targets[]`. Use when a persona fact has narrow downstream consequences (e.g. "Persona 2's PSG-anchored expectation → agent_8 must show net price first in the report"). |

#### 6.1.1 `personas[].nba`

Replaces the legacy free-text `nba` string. The structured form forces every persona's `wtp_band_sgd.expected` to trace to verifiable arithmetic, not vibes. New projects MUST use the structured form. Existing projects with a legacy `nba: string` keep working until next refresh.

| Field | Type | Required | Allowed | Description |
|---|---|---|---|---|
| `nba.method` | string | yes | `wage` \| `competitor_price` \| `tooling_stack` \| `time_value` | Which costing model is used to ground WTP |
| `nba.summary` | string | yes |  | One-sentence narrative of the alternative (≤ 200 chars). Example: `"DIY in Excel + a 3-staffer admin overhead, ~6 hrs/wk per coordinator"` |
| `nba.inputs` | object | yes |  | Numeric inputs depending on `method`. At minimum, the inputs that combine to produce `monthly_sgd_equivalent`. |
| `nba.inputs.hourly_sgd` | number | conditional | required when `method = wage` or `time_value` | Loaded hourly rate of the persona |
| `nba.inputs.hours_saved_per_month` | number | conditional | required when `method = wage` or `time_value` | Monthly hours redirected if our product is adopted |
| `nba.inputs.competitor_id` | string | conditional | required when `method = competitor_price` | FK into `competitors[].id` |
| `nba.inputs.competitor_monthly_sgd` | number | conditional | required when `method = competitor_price` | Snapshot of competitor's SG monthly price at research time |
| `nba.inputs.tooling_lines[]` | object[] | conditional | required when `method = tooling_stack` | Each entry `{ tool, monthly_sgd }` — the persona's current stack we'd displace |
| `nba.monthly_sgd_equivalent` | number | yes | ≥ 0 | The single number every other arithmetic flows to. `wtp_band_sgd.expected` should sit between `0.4 ×` and `1.2 ×` this figure; outside that band, `nba.confidence` must justify the deviation. |
| `nba.confidence` | number | yes | 0.0–1.0 | Self-rated confidence in the equivalent. Below 0.6 means the WTP band is exploratory, not committed. |

### 6.2 `pricing_models[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Model name (e.g. "Per-seat", "Flat monthly", "Usage-based") |
| `rationale` | string | yes | Why this model might work for us |
| `score_by_persona` | object | yes | Map of persona name to 1-5 fit score |
| `score_by_persona.<persona_name>` | integer | yes (at least one) | 1-5 fit score for the named persona |

### 6.3 `elasticity_heuristics[]`

| Field | Type | Required | Allowed | Description |
|---|---|---|---|---|
| `segment` | string | yes |  | Segment name (matches a persona or broader segment) |
| `elasticity_band` | string | yes | `low` \| `medium` \| `high` | Demand elasticity band |
| `evidence` | string | yes |  | Evidence supporting the band |

### 6.4 `recommended_tiers[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Tier display name |
| `price_sgd` | number | yes | List price in SGD |
| `target_persona` | string | yes | Which persona this tier targets |
| `what_in[]` | string[] | yes | What is included |
| `what_excluded[]` | string[] | yes | What is deliberately excluded |
| `psychological_anchor` | string | yes | The anchor framing used |
| `effective_price_after_psg` | number | yes | Effective price after grant coverage (e.g. PSG) |

### 6.5 `grants[]`

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Grant name (e.g. "PSG", "EDG", "WDG(JR+)") |
| `coverage_pct` | number | yes | Coverage percentage (0-100) |
| `cap_sgd` | number or null | yes | Cap in SGD, null if uncapped |
| `eligibility` | string | yes | 1-sentence eligibility summary |
| `applies_to_tiers[]` | string[] | yes | Names of `recommended_tiers[].name` this grant applies to |

## 7. `whitespace-framework.json` fields

Top-level shape: `{ meta, strategy_canvas, heatmap, attack_plans[] }`. `meta` follows Section 2.

### 7.1 `strategy_canvas`

| Field | Type | Required | Description |
|---|---|---|---|
| `headline_thesis` | string | yes | The one-sentence whitespace thesis |
| `dimensions[]` | object[] | yes | Radar dimensions |
| `dimensions[].key` | string | yes | Short key used inside `scores` |
| `dimensions[].label` | string | yes | Human label shown in the view |
| `scores` | object | yes | Map of `<competitor_id>` to per-dimension score map |
| `scores.<id>.<dim_key>` | number | yes | Score 0-5 for that competitor on that dimension |

### 7.2 `heatmap`

| Field | Type | Required | Description |
|---|---|---|---|
| `segments[]` | object[] | yes | Row axis of the heatmap |
| `segments[].id` | string | yes | Stable segment id |
| `segments[].name` | string | yes | Display name |
| `segments[].descriptor` | string | yes | Short descriptor |
| `needs[]` | object[] | yes | Column axis of the heatmap |
| `needs[].id` | string | yes | Stable need id |
| `needs[].name` | string | yes | Display name |
| `needs[].short` | string | yes | Short label for cramped UI |
| `cells` | object | yes | Map keyed `<segment_id>:<need_id>` |
| `cells.<seg_id>:<need_id>.our_score` | number | yes | Our capability score 0-5 for this cell |
| `cells.<seg_id>:<need_id>.competitors[]` | object[] | yes | Per-competitor scoring for this cell |
| `cells.<seg_id>:<need_id>.competitors[].id` | string | yes | Foreign key to `competitors[].id` |
| `cells.<seg_id>:<need_id>.competitors[].name` | string | yes | Denormalised competitor name |
| `cells.<seg_id>:<need_id>.competitors[].score` | number | yes | Score 0-5 for this cell |
| `cells.<seg_id>:<need_id>.competitors[].specialisation_for_cell` | string | yes | <= 120 chars, pair-specific |

**Important**: `specialisation_for_cell` must be **pair-specific** (this competitor for this exact segment-need cell) and must **never** be a generic copy of `competitors[].strengths`. If a cell ends up with identical specialisation strings across competitors, or strings that read as generic strengths rather than cell-specific specialisations, the heatmap is wrong and must be re-done.

### 7.3 `attack_plans[]`

| Field | Type | Required | Allowed | Description |
|---|---|---|---|---|
| `rank` | integer | yes | 1+ | Ordering of the attack plan (1 = top priority) |
| `niche_name` | string | yes | **≤ 60 chars** | Headline-style name of the whitespace niche. NOT a paragraph subtitle. Example good: `"Opacity-arbitrage pricing wedge"`. Example bad (74 chars): `"Manpower-bundled brand activation (Elitez Group ecosystem moat)"`. Cards and PDF templates assume this fits a single line at H3 weight. |
| `icp` | string | yes |  | Ideal customer profile for this niche |
| `whitespace_segment_id` | string | no | FK to `heatmap.segments[].id` | If the attack plan maps cleanly onto a single heatmap row, name it. Lets Agent 8 visually cross-link plan → heatmap cell. |
| `tam_estimate_sgd` | number | yes | ≥ 0 | Estimated TAM for this niche in SGD |
| `tam_reasoning` | string | yes |  | How the TAM was derived |
| `why_gap` | string | yes |  | Why competitors have left this gap |
| `why_we_win` | string | yes |  | Why we are positioned to win it |
| `gtm` | object | yes |  | Go-to-market sub-object |
| `gtm.channel` | string | yes |  | Primary acquisition channel |
| `gtm.pitch` | string | yes |  | One-sentence pitch |
| `gtm.pricing` | string | yes |  | Pricing shape for this niche |
| `gtm.content` | string | yes |  | Content / proof strategy |

## 8. Enumerations (canonical values)

These are the canonical values for all enum fields. Spelling, case, and punctuation must match exactly.

- `category`: `global_incumbent` | `sg_local` | `regional_challenger` | `diy_alternative` | `adjacent` | `big_si`
- `hq_region`: `SEA` | `APAC` | `Global` | `Other`
- `pricing_flag`: `public` | `partial` | `hidden_estimated`
- `sentiment` (policies): `support` | `neutral` | `against`
- `elasticity_band`: `low` | `medium` | `high`
- `threat_level`, `beatability`: integer 1-5
- Scoring bands:
  - 0-5 for radar dimensions (`strategy_canvas.scores`) and heatmap cell scores (`our_score`, `competitors[].score`)
  - 1-5 for `threat_level`, `beatability`, `country_readiness.*`, and `pricing_models.score_by_persona.*`
  - 1-10 for `website_design_rating`

## 8b. `brand-assets.json` (owned by Agent 0)

Top-level shape: `{ meta, source, palette, typography, logo, imagery[] }`. Produced by Agent 0 (Asset Extractor) from whatever reference materials the human dropped into the brief folder — PDF deck, slide deck, public site, Figma export, brand book. Lives at `/template/data/brand-assets.json`. `meta` follows §2.

Agents 5, 6, 8, and 9 all read this file. It is the project's canonical record of what the *client's own* visual identity is — not derived live from the public site each run.

| Field | Type | Required | Description |
|---|---|---|---|
| `source` | object | yes | Where the assets were extracted from |
| `source.type` | string | yes | `pdf` \| `site` \| `figma` \| `deck` \| `mixed` |
| `source.references[]` | string[] | yes | File paths or URLs. Example: `["briefs/elitez-events-deck.pdf", "https://elitez.asia"]` |
| `palette` | object | yes | Brand colours, all hex (`#RRGGBB`) |
| `palette.primary` | string | yes | Primary brand colour |
| `palette.secondary` | string | no | Secondary brand colour |
| `palette.accent` | string | no | Accent colour |
| `palette.neutral_dark` | string | yes | Dark neutral |
| `palette.neutral_light` | string | yes | Light neutral |
| `palette.gradients[]` | object[] | no | Named gradients lifted from the deck. Each `{ name, css }` where `css` is a literal CSS gradient string. |
| `typography` | object | yes | Typeface choices |
| `typography.display` | string | yes | Display typeface (with fallbacks) |
| `typography.body` | string | yes | Body typeface (with fallbacks) |
| `typography.weights[]` | integer[] | no | Weights that appear in the source materials (e.g. `[400, 600, 800]`) |
| `logo` | object | yes | Primary logo |
| `logo.svg_path` | string | no | Relative repo path to SVG version, if extractable |
| `logo.png_path` | string | no | Relative repo path to raster fallback |
| `logo.mark_path` | string | no | Relative repo path to logomark / favicon variant |
| `logo.usage_notes` | string | no | Padding rules, dark/light variants, prohibited treatments |
| `imagery[]` | object[] | no | Photography lifted from the deck (event photos, product shots, lifestyle). Each entry `{ slug, path, caption, source_page }`. Used by Agent 6 to populate hero/showcase blocks instead of stock placeholders. |

## 8c. `brand-tokens.json` (owned by Agent 9)

Top-level shape: `{ meta, extracted_from, tokens, font_imports[], notes }`. Persisted snapshot of whatever Agent 9 read off the target brand's public site (or `brand-assets.json` if Agent 0 ran). Lives at `/template/data/brand-tokens.json`. The presence of this file means Agent 9 has run; its absence is the cue that admin pages are still un-styled drafts (see §10 below).

| Field | Type | Required | Description |
|---|---|---|---|
| `extracted_from` | object | yes | Provenance of the tokens |
| `extracted_from.type` | string | yes | `public_site` \| `brand_assets_json` \| `manual_override` |
| `extracted_from.reference` | string | yes | URL or file path |
| `extracted_from.captured_at` | YYYY-MM-DD | yes | When tokens were captured |
| `tokens` | object | yes | The actual CSS-custom-property values, mirrored from the public site's `:root`. Keys match `meta.brand_tokens` keys plus any project-specific extras. |
| `font_imports[]` | string[] | no | Google Fonts URLs (or other) Agent 9 must include in every admin page `<head>` to render the typography correctly |
| `notes` | string | no | Free-text observations about visual idioms (e.g. "all CTAs are pill-shaped", "headings tracked tight at -0.02em") |

## 9. Adding a new field

1. **Propose via the Methodology Curator (Agent 7)**. See `07-methodology-curator.md`. The Curator is the only agent authorised to mutate methodology; every other agent proposes a delta and the Curator decides. The proposal must include why the existing fields are insufficient, which agent would populate the new field, and which view or calculation would consume it.

2. **Document in THIS file (FIELD-DICTIONARY.md) first**, before any data or code changes. Specify the field's full path (e.g. `competitors[].my_new_field`), its type, its required flag, its allowed values or range, a 1-sentence description, and at least one concrete example value. If the field is an enum, add it to Section 8 in the same change.

3. **Update at least one example in sample data** so agents have a concrete template to copy from. No silent fields: if the dictionary lists a field but no sample row uses it, agents will not learn it exists. The rule is strict: dictionary entry first, sample data second, consumers third. Any PR that reverses that order should be rejected.

## 10. Un-styled draft banner contract

A project where Agent 9 has not yet run is in **un-styled draft** state. The signal: `/template/data/brand-tokens.json` does not exist (or carries `extracted_from.type: "manual_override"` with all-default values). Agent 6 must emit a banner on every admin page in this state so the human reviewer cannot confuse "Agent 6 produced ugly output" with "Agent 9 has not yet been invoked." See `06-data-visualization-engineer.md → §Un-styled draft banner` for the rendering contract.

The banner auto-removes when `brand-tokens.json` lands. No code change required to dismiss; the renderer reads the file's existence at page load.

## 11. Display-format helpers

All currency, score, and range formatting in the template must flow through the shared helpers in `/template/assets/js/format.js`. Inline formatting (e.g. `'S$' + (n/1e6).toFixed(0) + 'M'`) is forbidden; it produces drift across views and resists localisation. The helpers Agent 6 must use:

| Helper | Signature | Behaviour |
|---|---|---|
| `fmtSGD(n)` | `(number) => string` | `48000000` → `"S$48M"`. Uses `meta.market_size.currency_label` if present; falls back to `"SGD"`. Drops to `"K"` below 1M, raw integer below 1K. |
| `fmtSGDFull(n)` | `(number) => string` | `48000000` → `"S$48,000,000"`. For tables and PDF appendices where compact display is wrong. |
| `fmtRange(low, expected, upper)` | `(number, number, number) => string` | `(199, 299, 499)` → `"S$199 — S$499 (target S$299)"`. |
| `fmtScore(n, scale)` | `(number, "1-5"\|"0-5"\|"1-10") => string` | `(4.2, "1-10")` → `"4.2 / 10"`. The scale token must be passed explicitly — never inferred — so renderers reading `competitors[].threat_level` (1-5) and `competitors[].website_design_rating` (1-10) cannot accidentally swap denominators. |
| `fmtPct(n)` | `(number) => string` | `12.5` → `"12.5%"`. Strips trailing `.0` for integers. |

Agent 6 imports these helpers in every render module; Agent 8 imports them in the report renderer. Agent 7 (mid-flight mode, see §12) flags any view module that constructs currency or score strings inline.

## 12. Inter-agent quality gates

Each agent ships with a paired validator that the next agent runs as a precondition. Gates fail loudly: a downstream agent halts and surfaces the violation rather than silently producing degraded output.

| Producer → Consumer | Gate | Failure mode |
|---|---|---|
| Agent 1 → Agent 2 | `competitors[].length >= 30` AND `≥ 60% hq_region ∈ {SEA, APAC}` AND `Top-5 rationales ≤ 200 chars` | Agent 2 halts; human re-runs Agent 1 with the VC-portfolio sweep step (see `01-competitor-research-analyst.md`). |
| Agent 2 → Agent 3 | Every `policies[].data_as_of` within 12 months. Every `implications[].agent_targets[]` non-empty when `implications[]` is provided. | Agent 3 halts; flag stale macro signals. |
| Agent 3 → Agent 4 | `personas[].length ≤ 5`. No two personas share `≥ 60% pains`. Every persona has `nba.monthly_sgd_equivalent` non-null. | Agent 4 halts; runs persona-collapse audit. |
| Agent 4 → Agent 6 | Every cell's `competitors[].specialisation_for_cell` non-null and `≤ 120 chars` and pair-specific. Every `attack_plans[].niche_name ≤ 60 chars`. | Agent 6 halts; flags the offending cells. |
| Agent 5 → Agent 6 | Every competitor has `website_design_rating` non-null OR explicit `website_design_notes` recording the unreachable status. | Agent 6 halts on silent nulls. |
| Agent 6 → Agent 8 | All views render without errors against current JSON. No inline currency/score formatting (delegate to helpers in §11). `brand-tokens.json` exists OR un-styled-draft banner is rendered (§10). | Agent 8 halts pre-flight; see `08-report-generator.md → §Pre-flight validator`. |

Agent 7 runs every gate in **read-only mode** when invoked mid-flight (see `07-methodology-curator.md → §Mid-flight mode`). Mid-flight Agent 7 never edits — it only produces a violation report the human routes back to the responsible agent.
