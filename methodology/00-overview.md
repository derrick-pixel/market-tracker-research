# The ten-agent analytics workflow

This overview maps the seven analytics deliverables (plus the final PDF report and two cross-cutting agents) to the agents that own them, sketches the dependency graph, specifies the data handed off between adjacent agents, and calls out when each agent should be re-run. It is the entry point for anyone trying to understand how this template produces a finished competitor-intel package.

## 1. Map of deliverables to agents

There are ten agents. Seven (Agents 1–6 + 8) produce the seven analytics deliverables Derrick asked for plus the bound report. **Agent 0 (Asset Extractor)** is a setup step that runs before Agent 1 when the human supplies brand reference materials. **Agent 7 (Methodology Curator)** is cross-cutting: it audits the methodology (default mode, post-shipment) and runs read-only quality-gate validation (mid-flight mode, after Agent 6). **Agent 9 (Aesthetics Presenter)** is an opt-in final beautify pass that re-skins admin pages to resonate with the brand's public site after the human has approved the un-styled layout.

| # | Deliverable | Agent | Methodology file | Primary output |
|---|---|---|---|---|
| 0 | Brand DNA | Agent 0: Asset Extractor | `00-asset-extractor.md` | `brand-assets.json` + committed asset files |
| 1 | Competitor insights | Agent 1: Competitor Intel | `01-competitor-research-analyst.md` | `competitors.json` (all records + Top-5 entries) |
| 2 | Top-5 highlights | Agent 1: Competitor Intel | `01-competitor-research-analyst.md` | `top_five[]` inside `competitors.json` |
| 3 | Search and filter | Agent 6: Visualisation | `06-data-visualization-engineer.md` | Search/filter wiring for the competitor table view |
| 4 | Market intelligence | Agent 2: Market Intelligence | `02-market-intelligence-analyst.md` | `market-intelligence.json` |
| 5 | Pricing strategy | Agent 3: Pricing Strategy | `03-pricing-strategy-analyst.md` | `pricing-strategy.json` |
| 6 | Whitespace atlas | Agent 4: Whitespace | `04-whitespace-blue-ocean-analyst.md` | `whitespace-framework.json` |
| 7 | Website design analysis | Agent 5: Website Design | `05-website-design-auditor.md` | `website_design_rating`, `website_design_notes`, `website_screenshot_path`, `website_screenshot_path_mobile`, `findability_seconds` fields on each competitor record |
| +1 | Report PDF | Agent 8: Report PDF | `08-report-generator.md` | Final bound PDF that references all four JSON files |
| meta | Methodology curation | Agent 7: Methodology Curator | `07-methodology-curator.md` | Default mode: controlled edits to methodology and `FIELD-DICTIONARY.md`. Mid-flight mode: read-only violation report at `methodology/proposals/<date>-mid-flight-<slug>.md` |
| meta | Brand re-skin | Agent 9: Aesthetics Presenter | `09-aesthetics-presenter.md` | `brand-tokens.json` + restyled `/template/admin/*.html` and CSS. Three hard acceptance tests gate ship. |

Note on the 7+1+2 framing: Derrick's brief names seven analytics deliverables and implicitly expects a bound report. Report PDF is the "+1"; Methodology Curator and Aesthetics Presenter sit outside the deliverable map because their products are process and presentation, not pages in the pack. Asset Extractor (Agent 0) is also outside the deliverable map — it produces inputs that other agents consume.

## 2. Workflow diagram

```
[0 Asset Extractor]* -> [1 Competitor] -> [2 Market] -> [3 Pricing] -> [4 Whitespace] -> [5 Design] -> [6 Viz] -> [8 Report PDF]
                                                                                                                  ↑
                              [7 Methodology Curator — mid-flight mode] (read-only validator runs here)----------+
                                                                                                                  ↓
                                                                                              [9 Aesthetics Presenter]**
                                                                                                                  ↓
                                       [7 Methodology Curator — default mode] <- runs against finished project (later)

* = optional, runs only if human supplies reference materials
** = opt-in, runs only after human approves un-styled layout
```

In practice the hard dependencies are looser than this straight line (see Section 5 on parallelisation), but the diagram captures the canonical read-order: a reviewer going front-to-back should see competitors, then market, then pricing, then whitespace, then design, then visuals, then the bound report. Agent 7 (mid-flight) runs as a quality gate before Agent 8; Agent 9 runs after the bound report is approved by the human.

## 3. Handoff contracts

Each adjacent pair below describes the shape of data passed and what the receiving agent needs to start.

### 3.1 Agent 1 -> Agent 2

Agent 1 hands Agent 2 the full `competitors.json` with the Top-5 curated. Agent 2 does not need every competitor field, but it does need the `category`, `hq_region`, `countries_covered`, and `target_market` fields to know which market slices to size and which policies to scan. A complete `competitors[]` array with at least 8-12 entries is the signal that Agent 2 can begin; a partial set biases the market read.

### 3.2 Agent 2 -> Agent 3

Agent 2 hands Agent 3 `market-intelligence.json` with `market_size`, `economic_signals`, and `adoption_patterns` populated. Agent 3 needs SAM/SOM to bound its tier pricing and the `adoption_patterns.country_readiness` grid to calibrate price_tolerance by country. Agent 3 also reads `competitors.json` for `sg_monthly_sgd` and `pricing_range_published` to anchor tier prices against live competitor pricing.

### 3.3 Agent 3 -> Agent 4

Agent 3 hands Agent 4 `pricing-strategy.json` with `personas`, `recommended_tiers`, and `grants`. Agent 4 uses the persona definitions to construct heatmap segments and the recommended tiers to frame each attack plan's pricing line. Agent 4 additionally re-reads `competitors.json` to populate `strategy_canvas.scores` and heatmap cells.

### 3.4 Agent 4 -> Agent 5

Agent 4 hands Agent 5 `whitespace-framework.json`. Agent 5 does not consume the whitespace output directly, but it uses the Top-5 (from Agent 1) plus the `attack_plans[]` ranking (from Agent 4) to decide which competitors' websites to score first and in what depth. When time is short, Agent 5 scores Top-5 competitors fully and the rest quickly, ranked by `attack_plans[].rank` proximity.

### 3.5 Agent 5 -> Agent 6

Agent 5 hands Agent 6 a fully-populated `competitors.json` with `website_design_rating`, `website_design_notes`, and `website_screenshot_path` filled for every record. Agent 6 needs all four JSON files (`competitors.json`, `market-intelligence.json`, `pricing-strategy.json`, `whitespace-framework.json`) plus the screenshots on disk before it can wire up visuals; missing screenshots or null design ratings surface as visible placeholders in the UI.

### 3.6 Agent 6 -> Agent 8

Agent 6 hands Agent 8 a working visual layer: every view renders without errors against the four JSON files, search and filter controls are wired, and charts / heatmap / radar are stable. Agent 8 then binds the views into a PDF, embeds the screenshots, and produces the report artefact. If any view is broken or any JSON field is missing, Agent 8 must stop and kick back to the responsible agent rather than ship a half-bound PDF.

## 4. When to re-run an agent

- **New competitor discovered** -> re-run Agent 1. Then check whether Agent 4's heatmap needs a new column or Top-5 entry shifts; re-run Agent 4 if so.
- **Policy change (new grant, new regulation)** -> re-run Agent 2. Re-run Agent 3 if the change touches grants or price-tolerance signals.
- **Pricing experiment / competitor repriced** -> re-run Agent 3. Update `sg_monthly_sgd` in `competitors.json` as a side-effect.
- **New whitespace hypothesis** -> re-run Agent 4 only; Agents 1-3 are unaffected.
- **Competitor relaunched their site** -> re-run Agent 5 for that competitor record; re-run Agent 6 to refresh thumbnails.
- **New deliverable view requested** -> Agent 6 only, unless it needs a new field, in which case route through Agent 7 first.
- **Methodology drift or sloppy outputs noticed** -> run Agent 7 to audit and curate; expect proposals back that trigger partial re-runs of whichever agents were affected.
- **Fresh quarterly refresh** -> re-run 1 through 6 in order; Agent 8 last.

## 5. Parallelisation guide

- Agents 1 and 2 can run in parallel. They share no upstream data; Agent 2 benefits from Agent 1's competitor list but can start with a provisional list and reconcile after.
- Agents 3 and 5 can run in parallel once Agent 1 is done. Agent 3 wants competitor pricing; Agent 5 wants competitor URLs and screenshots. Both are satisfied by `competitors.json`.
- Agent 4 must wait for Agent 1. It also reads Agent 3's output for pricing context, but can begin canvas and heatmap with just Agent 1 and finish attack plans once Agent 3 lands.
- Agent 6 must wait for everything before reshaping visuals. It can prototype views against sample data in parallel with earlier agents, but final rendering requires all four JSON files to be current.
- Agent 8 must wait for Agents 1-6 all complete. It never runs on partial data; if a view is missing, Agent 8 halts and flags.
- Agent 7 is orthogonal: it can run at any time, but its proposals should be applied between refresh cycles, not mid-cycle, to avoid churning the schema while data is being written against it.
