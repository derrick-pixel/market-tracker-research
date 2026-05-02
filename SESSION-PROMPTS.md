# Session prompts — competitor-intel-template

Chronological list of every user prompt across the two sessions that built this template (24–27 Apr 2026). Kept verbatim. Useful as a record of intent for future curation passes.

## Session 1 — design + build (2026-04-24)

**1. Initial brief (`/remote-control`)**
> for some of the repos (such as Elitez EOR and XinceAI), i am happy about the special analytics as follows: (1) competitor insights with 30–50 competitors weighted 60%+ SEA/SG, (2) Top-5 competitor highlights, (3) competitor search bar, (4) visual analysis (price comparison, spider/radar graph, target market distribution), (5) market intelligence for Singapore/SEA, (6) recommended pricing strategies with personas/NBA/elasticity, (7) whitespace atlas (Blue Ocean canvas, segment×need heatmap, attack plans), (8) competitor website design analysis. Build a template repo with a future-update mechanism.

**2. Scaffold style**
> Hybrid scaffold + showcase

**3. Audience**
> Me + future AI sessions

**4. Freshness mechanism**
> Prompt-pack + extraction ritual

**5. Repo name**
> competitor-intel-template

**6. Sample-data scope**
> All 7 wired on sample data

**7. Add agents layer**
> yes, but i also need each skill to be notably categoried by 1 'agent', can you do this?

**8. Agent naming**
> 7 agents. names, please use more literal names. extractor curator is fine, it should be a 7th peer agent. go ahead

**9. Whitespace fidelity (with 3 XinceAI screenshots)**
> ensure that agent 4 does the strategy canvas and segment x heatmap correctly, similar to Xince-Ai... (asked for pair-specific competitor specialisations in heatmap cells)

**10. Add Report Generator as agent 8**
> proceed. and I require 8th agent to compile all of the first 6 agents' work and create a downloadable pdf for the full compiled report with proper TOC, page colors bleeding into margins, coherent narrative flow

**11. Approve spec**
> ok proceed

**12. Choose execution mode**
> do 1, subagent driven

**13. Approve browser PDF testing**
> yes lets go ahead and try

## Session 2 — polish (2026-04-25 → 2026-04-27)

**14. Shrink the PDF**
> the downloadable competitor report is too large file size. make it compact

**15. Onboarding**
> ok how can i start using this?

**16. Diagram the flow**
> can you put these steps as a neat diagramatic flow on https://derrick-pixel.github.io/competitor-intel-template/showcase/index.html ? you may create one new page or propose a method

**17. Pick the proposal**
> use your first proposal

**18. Wrap-up**
> ok save all prompts to a file and i wish to close this terminal

## Session 3 — Agent 9 added (2026-04-27)

**19. Add a 9th agent (aesthetics-presenter)**
> zoom out to the competitor intel template, i need a 9th agent. this 9th agent is called aesthetics presenter. i need this agent to be involved in every work done. use the layout methods that was our best practice (Xince AI and Elitez EOR). i particularly like that there are organised cards for attack plan, market intel. the color aesthetics should also match the organic theme of the website that we are developing the intel report for. Such as for Elitez Events, the way this 9th agent present it's aesthetics should also resonate with the organic site for Elitez Events that you designed.

**20. Scope decision — separate, not blocking**
> agent 9 can be the final / separate agent. meaning; you can still do your current method, after i review the non-designed layout and once i am satisfied, we will run agent 9 to beautify the layout.

## Session 4 — Post-Elitez-Events upgrade pass (2026-04-27 → 2026-04-28)

Triggered after the Elitez Events build (2026-04-27) surfaced a series of agent gaps: manual `pdftoppm` extraction of brand assets, three rounds of attack-card redesign before the design wasn't "monotonous," CSS-grid overflow when long technical strings hit `1fr` columns, no canonical scoring contract across `1-5`/`0-5`/`1-10` fields. The user asked Claude to summarise today's changes and propose upgrades; counter-checked against an in-flight upstream upgrade pass (Agent 2 + 6 + 9 methodology + FIELD-DICTIONARY + AGENT.md were touched mid-conversation); then green-lit the full landing of the remaining proposals.

**21. Summarise + propose upgrades**
> ok let's do all the necessary upgrades

The following landed in this session:

- **Agent 0 (Asset Extractor) created** — new `methodology/00-asset-extractor.md` + `prompts/invoke-asset-extractor.md`. Owns brand-DNA extraction from client reference materials (PDF deck, slide deck, public site, Figma) into `data/brand-assets.json`. Replaces the manual `pdftoppm` workflow that consumed an hour of the Elitez Events build.
- **`FIELD-DICTIONARY.md` major upgrade** — new schema for `competitors[].findability_seconds`, `competitors[].website_screenshot_path_mobile`, `competitors[].implications[]` with `agent_targets[]`, structured `personas[].nba` arithmetic block (§6.1.1), `personas[].id` + `personas[].whitespace_segment_ids[]`, attack plan `niche_name ≤ 60 chars` rule, attack plan `whitespace_segment_id` foreign key, `brand-assets.json` (§8b), `brand-tokens.json` (§8c), un-styled draft banner contract (§10), display-format helpers (§11), and inter-agent quality gates (§12).
- **Agent 1** — added `implications[].agent_targets[]` per-competitor field, brand-assets.json cross-check section.
- **Agent 3** — persona-collapse audit (≥60% pains overlap merge rule), structured `nba` shape with worked examples (`wage` and `tooling_stack` methods), persona-to-segment binding via `whitespace_segment_ids[]`.
- **Agent 4** — `niche_name ≤ 60 chars` rubric with good/bad examples, `specialisation_for_cell` worked-example library covering 6 category archetypes, `whitespace_segment_id` FK on attack plans.
- **Agent 5** — mobile-viewport pass (375×667) for Top-15, three-intent findability stopwatch test (pricing/demo/contact in seconds), `brand-assets.json` cross-check for client-photo collisions.
- **Agent 6** — Layout invariants section (Rule 1 `minmax(0,1fr)` on every `1fr` track, Rule 2 `overflow-wrap: anywhere` on text containers, Rule 3 mobile-collapse on label columns), display-format helpers contract, un-styled draft banner contract that auto-dismisses when `brand-tokens.json` lands, section-pattern picker mapping section names to canonical card archetypes.
- **Agent 7** — new mid-flight mode (read-only quality-gate validator, runs after Agent 6, before Agent 8). Distinct from default-mode pattern harvesting.
- **Agent 8** — three-phase pre-flight validator (schema integrity, referential integrity across foreign keys, render-format integrity), 8 MB PDF size budget with auto-downscale tiers.
- **Agent 9** — token extraction now prefers `brand-assets.json` over live public-site read, persists `brand-tokens.json` to disk per `FIELD-DICTIONARY.md §8c`, three brand-resonance tests (nav parity, display-heading typography, theme-mode-correct band colours) promoted from advisory examples to a hard pass/fail acceptance gate.
- **Cross-cutting** — `AGENT.md` updated to register Agent 0, document mid-flight Agent 7, surface every new rule in the project lifecycle. `00-overview.md` now ten-agent diagram.

## Session 5 — Elitez ESOP first proof-point run (2026-04-28)

First end-to-end exercise of the Session-4-upgraded pipeline against a fresh project. Validated every new schema field (Agent 0 brand-assets, structured `nba`, `niche_name ≤ 60`, layout invariants, mid-flight Agent 7, pre-flight Agent 8) and surfaced four methodology improvement candidates from the actual run.

**22. Project brief (Elitez ESOP)**
> our company aims to create a readily deployable ESOP software to SMEs in Singapore, targeting those companies between 10-200 headcounts, revenue between 5-100M SGD. We believe many of these companies are able to progress far, but they need to be able to bring their employees for the long-haul. A very good alignment is ESOP, which personally i am a strong believer (Elitez has done ESOP since 5 years ago and we seen very good changes in the mindset of our ESOP employees).

**23. Sequencing decision**
> ok start Elitez ESOP solo first.

**24. GitHub Pages access issue + resolution**
> the github is unviewable. derrick-pixel.github.io/Elitez-ESOP/intel/

(Repo was private + Pages not yet enabled. Enabled Pages on `main / /`; site went live with `public: true` flag — public Pages site even though source repo stays private under GH Pro plan.)

**25. Wrap-up**
> ok save relevant prompts to the history for respective directory of elitez events and/or ESOP and etc. i will exit

What landed in this session:

- **Elitez ESOP intel layer** at `/codings/Elitez-ESOP/intel/` — 5 admin pages + 4 data JSONs + brand-assets.json (12 lifted assets) + 53 screenshots + un-styled-draft banner mounted on every page. Live at https://derrick-pixel.github.io/Elitez-ESOP/intel/.
- **Pipeline outcomes**: 42 competitors (69% SEA+APAC, Top-5 led by DIY Excel+lawyer at 78% market share), TAM S$540M / SAM S$38M / SOM S$1.8M, 3 personas (zero pain overlap, all NBA structured), 8-axis radar + 6×6 heatmap with 123 unique pair-specific specialisations, 3 attack plans (`niche_name` 41/39/44 chars).
- **Methodology improvement candidates** harvested for next default-mode Agent 7 pass (logged at `/codings/Elitez-ESOP/intel/MIDFLIGHT-VALIDATION.md`):
  1. NBA-vs-WTP unit-consistency rule — `wtp_band.expected` is annual, `nba.monthly_sgd_equivalent` is monthly; specify the `× 12` annualization explicitly in `FIELD-DICTIONARY §6.1.1`.
  2. Layout-invariant Rule 1 validator scope — over-fires on single-column `1fr` and mobile-collapse overrides; refine to "only multi-track grids containing both fixed-pixel and bare `1fr`."
  3. Pure-SEA vs SEA+APAC threshold ambiguity — Agent 1 methodology §5 ("≥60% SEA/SG") and FIELD-DICTIONARY §12 ("≥60% hq_region ∈ {SEA, APAC}") give different thresholds; reconcile.
  4. Agent 5 capture-vs-score budget — first dispatch consumed the entire 65-min token budget on screenshot capture and never reached scoring; methodology should split into 5a (capture, image-only) and 5b (score, schema-only).
- **Out-of-band Agent 8 methodology upgrade** — `08-report-generator.md` Phase 4 (post-render DOM-integrity validation) added separately during the session: section count + canonical order, cover full-bleed, footer presence, TOC ↔ rendered-page mapping, Cell Detail Appendix non-empty. Catches structural failures the JSON-only pre-flight cannot see (e.g. blank pages, off-by-one TOC numbers, full-bleed cover regressions).
- **Per-project prompt archives** — `/codings/Elitez-ESOP/intel/prompts/` (with `PROJECT-BRIEF.md` capturing the brief + dispatch context) and `/codings/elitez-events/prompts/` already mirror the canonical 11 invocation prompts.
