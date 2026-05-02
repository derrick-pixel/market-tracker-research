# AGENT.md — Briefing for AI agents

You are starting a new analytics project based on this template. Read this first.

## What's here

- Ten subagents in `.claude/agents/` — dispatch via `Agent(subagent_type: <slug>)`.
- Eleven methodology files in `/methodology/` — each agent reads its paired file first.
- Eleven invocation prompts in `/prompts/` — literal text to pass to each agent.
- Scaffold in `/template/` with all visualisations wired on sample data.
- Field dictionary in `/methodology/FIELD-DICTIONARY.md` — canonical schema, scoring bands, inter-agent quality gates, display-format helpers, un-styled-draft banner contract.

## Agent roster

| # | Slug | Role |
|---|---|---|
| 0 | asset-extractor | Lifts brand DNA (palette, typography, logo, imagery) from client reference materials → `brand-assets.json`. Runs **before Agent 1** when the human supplies a deck/site/Figma. |
| 1 | competitor-research-analyst | Competitor database + Top-5 (≥30 records, ≥60% SEA) |
| 2 | market-intelligence-analyst | SG/SEA macro landscape with structured `derivation_flow` + `implications[].agent_targets[]` |
| 3 | pricing-strategy-analyst | Personas (≤5, collapse-audited), structured `nba` arithmetic, elasticity, tiers |
| 4 | whitespace-blue-ocean-analyst | Strategy canvas + heatmap + attack plans (≤60-char `niche_name`) |
| 5 | website-design-auditor | 5-dimension design rubric + mobile pass + 3-intent findability |
| 6 | data-visualization-engineer | Charts + search UX, layout invariants, display-format helpers, un-styled-draft banner |
| 7 | methodology-curator | Freshness ritual (meta) AND mid-flight read-only validator |
| 8 | report-generator | Full-bleed PDF compiled from 1–6, with hard pre-flight gate + 8 MB size budget |
| 9 | aesthetics-presenter | Re-skins admin pages to resonate with the brand's public site (opt-in, runs after human review). Three hard acceptance tests: nav parity, display-heading typography, theme-mode-correct band colours. |

**File numbering reflects addition order, not workflow.** Workflow order: **0** → 1 → 2 → 3 → 4 → 5 → 6 → 8. Agent 7 runs later for pattern harvesting; **mid-flight Agent 7 runs after Agent 6 and before Agent 8** as a read-only quality gate. Agent 9 runs **last and only when explicitly requested** — after the human has reviewed and approved the un-styled layout. Until Agent 9 runs, every admin page emits a banner declaring the un-styled-draft state (the renderer reads `brand-tokens.json` existence at page load — when the file lands, the banner stops emitting on next reload).

## Starting a new project

1. Read the human's project brief. Note any reference materials supplied (PDF deck, public site URL, Figma).
2. **If reference materials exist:** dispatch Agent 0 (asset-extractor) first → produces `/template/data/brand-assets.json` + committed asset files under `/template/assets/img/`.
3. Update every `/template/data/*.json` `meta` block: `project_name`, `brand_tokens`, `research_date`, `sample_data: false`.
4. For agents 1 → 6: read `/methodology/0N-<slug>.md`, then dispatch with the prompt in `/prompts/invoke-<slug>.md`.
5. Each agent writes to its owned slice of `/template/data/` and `/template/`.
6. **After Agent 6**, optionally dispatch mid-flight Agent 7 (read-only mode) to validate inter-agent quality gates before the PDF compile.
7. Dispatch `report-generator` (Agent 8) to produce the PDF. Pre-flight halts on any unresolved gate.
8. `git add . && git commit && git push`. Pages auto-deploys.

## Rules

- Never ship with `meta.sample_data: true`.
- Every data field must be in `FIELD-DICTIONARY.md` first.
- Inter-agent quality gates (`FIELD-DICTIONARY.md §12`) are hard — a downstream agent halts and reports rather than producing degraded output silently.
- Whitespace heatmap `cells[*].competitors[]`: each MUST have a pair-specific `specialisation_for_cell` ≤ 120 chars. Generic copy-paste of `strengths` is forbidden.
- Attack plans: `niche_name ≤ 60 chars` (headline-style, not paragraph subtitle).
- Personas: ≤ 5 total, no two share ≥ 60% of `pains[]`, every persona has structured `nba.monthly_sgd_equivalent`.
- All currency/score/range formatting flows through `/template/assets/js/format.js` helpers (`fmtSGD`, `fmtScore`, `fmtRange`). Inline formatting is forbidden — Agent 7's mid-flight pass flags it.
- Every admin page emits an un-styled-draft banner until Agent 9 runs (i.e. until `brand-tokens.json` exists).
- Commit after every agent, not just at the end.
- All DOM construction uses the `h()` helper in `/template/assets/js/dom.js`. No HTML-string setters — this template handles user-supplied competitor data.

## When the project is done

1. (Optional) Dispatch mid-flight Agent 7 if you haven't already, to confirm all inter-agent gates pass.
2. Hand off to the human for layout review.
3. Once layout is approved, dispatch Agent 9 (aesthetics-presenter) to beautify. See `/prompts/invoke-aesthetics-presenter.md`. Agent 9 prefers `brand-assets.json` (from Agent 0) over a live read of the public site; falls back to public-site read if Agent 0 didn't run. Reference admins for the proven card patterns: `/codings/xinceai/admin/`, `/codings/elix-eor/admin/`, `/codings/elitez-events/admin/`.
4. Verify Agent 9's three brand-resonance acceptance tests pass (nav parity, display-heading typography, theme-mode-correct band colours).
5. Dispatch default-mode Agent 7 (methodology-curator) against the finished project to harvest pattern proposals. See `/prompts/extract-new-patterns.md`.
