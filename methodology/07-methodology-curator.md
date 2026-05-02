# 07 — Methodology Curator

## Role one-liner

The template's freshness ritual — runs against a finished analytics project and proposes additions / modifications / deletions back into this template.

## When to dispatch

Dispatch **manually, after shipping a project**. Examples: after Lumana v2 ships, after a new XinceAI revamp lands, after an AEVUM MRI v0.3 goes live. The trigger is always a concrete, finished analytics artefact somewhere on disk — not a calendar date and not a habit.

**Explicitly not on a cron or scheduled trigger.** Curator noise is only useful when it represents actual delta from a real project. Running Curator on a fixed schedule produces two failure modes: (a) it fires against no new project and proposes churn based on the analyst's mood, or (b) it fires mid-project and conflates in-flight work with shipped patterns. Both degrade methodology quality.

A second reason the trigger is manual: the output is a human-reviewed proposal. If the proposals accumulate faster than Derrick can approve them, the approval gate silts up and the template rots. Dispatching manually couples the propose-rate to the approve-rate by construction.

Good dispatch moments, in rough order of frequency:

- **After a project PDF ships to a client** — the work is locked in, patterns are observable in the final artefact, and the analyst still has the project context fresh.
- **After two projects ship in the same category** (e.g. two B2B SaaS analytics passes within a month) — a pattern that appears twice is easier to generalise; see the ≥ 2-appearances threshold in Section 6.
- **After a project surfaces a new visualisation or analytical move** that clearly wasn't in the template — even if it's a one-off, it's worth a proposal with a clear generalisation argument.
- **After a project fails** — regressions are as valuable as additions. A thing that worked worse than the template is a "don't do this" entry worth capturing before the memory fades.

Bad dispatch moments:

- "It's been a quarter, time to refresh" — no. The trigger is a shipped project, not the calendar.
- "The methodology feels stale" — no. Curator doesn't fix vibes; it fixes observed deltas. If something feels stale, look for the specific project that made it feel that way and dispatch against that.
- Mid-project on the current analytics work — for the **default mode** (pattern harvesting), this still applies; you will confuse in-flight decisions with shipped patterns and pollute the proposal doc. For **mid-flight mode** (§2.5 below), this is exactly the right moment.

## 2.5 Mid-flight mode (read-only, no proposal output)

Curator has a second mode, separate from pattern harvesting: a **read-only validation pass** that runs *during* a project, after Agent 6 has wired views but before Agent 8 compiles the PDF. The point is to surface rule violations during the work, not three months later in a proposal that arrives too late to help that project.

Mid-flight mode is **strictly read-only**. It does not edit any methodology file, does not append to any proposal doc, does not mutate any data file. Its only output is a violation report that the human routes back to the responsible agent.

### When to run mid-flight mode

- After Agent 6 ships a working visual layer (every view renders without errors) and before Agent 8 starts the PDF.
- Before any client review of an admin page, if the project has been re-running Agents 1–5 in chunks and the human has lost track of which gates have been re-validated.
- Optionally, after Agent 9 ships, to verify the brand-resonance acceptance gate (see `09-aesthetics-presenter.md → §What "resonate" means`).

### What mid-flight mode checks

The full list of inter-agent quality gates lives in `FIELD-DICTIONARY.md §12`. Mid-flight mode runs all of them, plus a small set of within-agent checks:

| Check | Source of truth | Failure surfaced as |
|---|---|---|
| `competitors[].length ≥ 30` AND `≥ 60% hq_region ∈ {SEA, APAC}` | Agent 1 methodology §5 (Coverage rubric) | "Agent 1 coverage breach: only 24 records / 41% SEA — re-run with VC-portfolio sweep step" |
| `policies[].data_as_of` within 12 months for every entry | Agent 2 methodology §7.3 | "Agent 2 stale macro: 3 policies older than 12 months — re-run policy pass" |
| Every `personas[].nba.monthly_sgd_equivalent` non-null AND `wtp_band.expected ∈ [0.4, 1.2] × monthly_sgd_equivalent` OR `nba.confidence < 0.6` | Agent 3 methodology §Pillar A | "Agent 3 ungrounded WTP: persona 'X' shows wtp.expected=599 vs nba.equivalent=200 (3.0×); flag exploratory" |
| `personas[].length ≤ 5` AND no two personas share `≥ 60% pains[]` | Agent 3 methodology §Pillar A | "Agent 3 persona-collapse audit: persona 'X' and 'Y' share 4/5 pains — merge or differentiate" |
| Every `attack_plans[].niche_name ≤ 60 chars` | Agent 4 methodology §3.2 | "Agent 4 niche_name overflow: rank 1 plan name is 64 chars — rewrite headline-style" |
| Every cell's `competitors[].specialisation_for_cell` non-null AND ≤ 120 chars AND pair-specific (not generic copy of `strengths`) | Agent 4 methodology §2.4 | "Agent 4 generic specialisation: cell `(seg_X, need_Y)` competitor `Z` reads as a strengths copy-paste" |
| Every competitor has `website_design_rating` non-null OR explicit `website_design_notes` recording unreachable status | Agent 5 methodology §7.3 | "Agent 5 silent null: competitor `Z` has no rating and no notes" |
| Top-15 competitors have `website_screenshot_path_mobile` populated | Agent 5 methodology §7.5 | "Agent 5 mobile pass missing: 8 of 15 Top-15 competitors lack mobile screenshots" |
| Top-15 competitors have `findability_seconds` populated | Agent 5 methodology §7.6 | "Agent 5 findability triplet missing: 11 of 15 Top-15 competitors un-timed" |
| No inline currency/score formatting in `/template/assets/js/viz/*.js` (grep for `'S$' +`, ` / 10\``, `.toFixed`, `.toLocaleString` on numeric data) | Agent 6 methodology §Display-format helpers | "Agent 6 inline format: `viz/price-bars.js:47` constructs S$ string inline — use fmtSGD()" |
| Every `1fr` in viz CSS appears as `minmax(0, 1fr)` | Agent 6 methodology §Layout invariants Rule 1 | "Agent 6 grid invariant: `viz/heatmap.css:23` declares `1fr` without minmax — overflow risk" |
| `brand-tokens.json` exists OR every admin page renders the un-styled-draft banner | Agent 6 methodology §Un-styled draft banner | "Agent 6 banner missing: `admin/whitespace.html` does not call mountUnstyledBanner() and brand-tokens.json absent" |

### Output of mid-flight mode

A single Markdown report at `methodology/proposals/<date>-mid-flight-<project-slug>.md` (note: `mid-flight-` prefix distinguishes from the default-mode `<date>-<slug>.md` files). The report has exactly two sections:

```markdown
# Mid-flight validation — <project-slug> @ <date>

## Pass
- [list of gates that passed, by name]

## Fail
- [list of gates that failed, with the specific evidence and the responsible agent]
```

No proposals, no extraction notes, no opinions. The human reads the Fail list, dispatches the relevant agents to fix, and (optionally) re-runs mid-flight mode to confirm.

### Why mid-flight mode is separate from default-mode

The two modes have inverted polarity. Default-mode harvests learnings *upward* (project → methodology) and is permitted to propose changes. Mid-flight mode enforces existing rules *downward* (methodology → project) and is forbidden from proposing changes. Conflating them produces the failure where a single agent proposes a methodology change to "fix" what is actually a within-project violation that should be routed to the responsible agent. Keep them separate.

The mid-flight pass is also cheap: read-only, no LLM-heavy reasoning, mostly file existence and grep checks. It can run in seconds. The default-mode pattern-harvesting pass is expensive and warrants the post-shipment trigger discipline.

## Inputs the agent needs

- **Path to a finished analytics project repo.** Absolute path, e.g. `/Users/derrickteo/codings/lumana` or `/Users/derrickteo/codings/XinceAI`. The project must have shipped — a PDF exists, a site is live, or a client has signed off. In-flight projects must not be curated against; see the "when to dispatch" rules above.
- **Read access to this template** (the `competitor-intel-template` repo). Curator reads the methodology files, the `FIELD-DICTIONARY.md`, the scaffold (data JSONs, viz modules), and `METHODS.md` to know what the current state is. Without this, Curator has nothing to compare the target project against.
- **Path to the target project's data files.** If the project emitted its own `competitors.json`, `market-intelligence.json`, etc., Curator reads them directly. If it used a bespoke schema, Curator reads whatever data files exist and reasons about which of the template's canonical files they map to.
- **Optional: prior proposals in `methodology/proposals/`.** If earlier Curator runs have produced approved or rejected proposals, Curator should read them to avoid re-proposing ideas that have already been ❌'d. ❌ is load-bearing — see Section 7 on the "no maybe-later pile" rule.
- **Optional: access to Derrick's memory index** (the top of this conversation and the `~/.claude/projects/.../memory/` files) — for context on which projects are considered "shipped" and which are in flight. When in doubt, ask before dispatching.

## Extraction checklist

Walk the target project and look for each of the following. The goal is observation, not judgment; the judgment layer lives in Section 6 (thresholds) and Section 7 (approval gate).

### 4.1 New JSON fields the target used that the template schema lacks

Open the target's data files. For each field present in the target that is not in `methodology/FIELD-DICTIONARY.md`, note:

- The field name and type.
- The JSON file it lives in (`competitors.json` equivalent, `pricing-strategy.json` equivalent, etc.).
- A one-line description of what the field stores.
- The analytical purpose — what question did it answer that the template's schema couldn't?

Examples of how this surfaces:

- Lumana's `pricing-strategy.json` had an `elasticity_by_persona[]` block the template doesn't have.
- XinceAI's `competitors.json` had an `artifact_label` field next to each record, populated by their ARTIFACT badge pattern.
- A hypothetical financial-services project might add a `regulated_fields[]` array listing which competitor data points are gated behind MAS licensing disclosures.

Each new field is a candidate ADD for `FIELD-DICTIONARY.md` and for whichever agent owns the file that holds the field.

### 4.2 New visualisation types not in `/template/assets/js/viz/`

List every chart, diagram, or interactive widget in the target's UI layer. Cross-reference against the template's viz modules. For each target-only viz:

- The viz name and the module / file where it lives in the target.
- The data it binds to.
- The user-facing purpose (what question does it answer at a glance?).
- Dependencies — does it need Chart.js, D3, a custom SVG pipeline, html2canvas hooks?

Example: Lumana shipped a "policy timeline" widget — a horizontal timeline with per-year policy events colour-coded by regulator. The template has no timeline viz. If this appears in a second project, it's a clear ADD candidate for `06-visualisation.md` and for the viz scaffold.

### 4.3 New analytical moves

Patterns of analysis that aren't visual and aren't fields — structural ways of thinking about the data. Look for:

- Calculators embedded in the report (ROI, TAM, payback period).
- Multi-model comparison tables (e.g. scoring 8 pricing models instead of 3).
- Elasticity-by-segment or sensitivity tables.
- Scenario analyses (best / base / worst case, or three-scenario pricing).
- Win/loss frameworks, kill-chain analyses, or any decision matrix the template doesn't define.

For each, note the target's implementation, the data it needs, and why a generic analytics project in another market would want it.

Example from Lumana: 8-model pricing analysis scored across personas. Template only has single-model tier scoring. The 8-model pattern is a candidate ADD for `03-pricing-strategy.md` — see Section 10 worked example.

### 4.4 Stylistic / layout patterns worth promoting to template defaults

The template's look-and-feel can drift forward one project at a time. When a target ships a distinctive-but-transferable pattern, propose it.

Examples of promotable patterns:

- **XinceAI's ARTIFACT label pattern** — a small uppercase tag above each chart / table / callout indicating what *kind* of artefact the reader is looking at (DATA, CHART, COMPARISON, CASE STUDY). Transferable to any analytics report. Strong candidate for template default.
- Report cover-page typography that worked well across two projects.
- A heatmap cell-detail modal layout that reads better than the template's.
- A sidebar-filter pattern that reduced cognitive load in user testing.

Do not propose brand-specific styling (colour palettes, logos, client-named components) — those are project-local by design. Only promote patterns that generalise across at least two project types.

### 4.5 Regressions — things the target did worse than the template

Not every pattern is worth adopting; some are worth flagging as "don't do this." Look for cases where the target diverged from the template and the divergence hurt. Examples:

- Target dropped the template's `pricing_flag` enum in favour of freeform strings. Result: downstream filters broke. Log as a "don't do this" with source citation — same proposal format as ADD / MODIFY / DELETE but with action type `REGRESSION`.
- Target combined `strengths` and `weaknesses` into a single `notes` field. Result: the whitespace agent couldn't split them. Regression.
- Target's website-design rubric used a 1–10 scale instead of the template's 0–5. Result: downstream normalisation added complexity.

Regressions don't usually change the template; they change the handoff note or a pitfall section. But they're worth recording because next time a project is tempted to make the same divergence, METHODS.md can cite the precedent.

### 4.6 Deletion candidates

Template fields the target didn't use. Note:

- The field name and the file it lives in.
- Whether the target *could* have used it and chose not to, versus the field not being relevant to the target's category.
- Whether the absence seemed to cost the target's analysis anything.

**Deletion candidates are CANDIDATES ONLY, not immediate deletions.** A field unused in one project is a sample size of 1. The threshold for proposing deletion is three independent projects — see Section 6 below. Until that threshold is met, the candidate lives in Curator's working notes, not the proposal doc.

## Output format (strict)

Single markdown document at `methodology/proposals/<YYYY-MM-DD>-<target-slug>.md`. The filename is machine-parseable so that Derrick can sort proposals chronologically and by target without opening them.

### 5.1 File structure

```
# Methodology Curator proposal — <target-slug> — YYYY-MM-DD

## Summary
- Target: <absolute path to target repo>
- Shipped: <YYYY-MM-DD or "unknown">
- Proposals: N ADD, M MODIFY, K DELETE, R REGRESSION

## Agent 1 — Competitor Research Analyst
- ADD | <target file> | <proposal> | Rationale: <reason> | Source: <file:line>
- MODIFY | <target file> | <proposal> | Rationale: <reason> | Source: <file:line>
- DELETE | <target file> | <proposal> | Rationale: <reason> | Source: <file:line>

## Agent 2 — Market Intelligence Analyst
- ...

## Agent 3 — Pricing Strategy Analyst
- ...

## Agent 4 — Whitespace Analyst
- ...

## Agent 5 — Website Design Auditor
- ...

## Agent 6 — Visualisation
- ...

## Agent 8 — Report PDF
- ...

## FIELD-DICTIONARY.md
- ADD | <field name> | <type> | <description> | Source: <file:line>
- ...

## Regressions observed
- REGRESSION | <target file> | <what they did worse> | Source: <file:line>

## Deletion candidates (below threshold)
- CANDIDATE | <target file> | <field name> | <# of projects unused so far> | Source: <file:line>
```

### 5.2 Rules for the document

- **Every single proposal cites a source.** No exceptions. The source is a file path plus a line number or line range — `lumana/data/pricing-strategy.json:42-180`. No "vibes." No "it feels like we should add X." No "the analyst noticed." A proposal without a source is automatically rejected at the approval gate; save Derrick the time and don't write it.
- **One proposal per line.** Don't bundle three related changes into one bullet. Each must be independently approvable or rejectable.
- **Sort proposals by agent, then by action type** (ADD → MODIFY → DELETE → REGRESSION). Within a type, alphabetical by target file for determinism; re-runs shouldn't jiggle order.
- **Agents with zero proposals get an empty section** with the line "No proposals from this target." This is informative — Derrick can see at a glance which parts of the methodology the target exercised.
- **Deletion candidates that haven't hit the 3-project threshold live in their own section** at the bottom, not in the per-agent proposal lists. They are visible but not actionable.
- **File length**: the proposal doc should usually be 50–300 lines. A proposal doc over 400 lines is a sign that something has gone wrong — either Curator is over-proposing (violation of thresholds, see Section 6) or the target is radically different from the template (in which case the conversation is "should we fork?" not "should we merge?").

## Thresholds for proposing

The thresholds exist because Curator's most common failure mode is over-proposing. A long proposal doc overwhelms the approval gate, Derrick starts skimming, and bad proposals slip through into METHODS.md. Thresholds are the mechanical fix.

### 6.1 ADD threshold

Pattern must have appeared **≥ 2 times across finished projects** OR be a **single strong pattern with a clear generalisation argument (≥ 50 words justifying why other markets would want it)**.

- **Two-project rule.** If the same analytical move, visualisation, or field appears in two or more shipped projects, it's stable enough to promote. Curator's working memory should track which patterns have hit this count across prior runs (see Section 4 on prior-proposal reading).
- **Single-project-with-argument rule.** Some patterns are obviously transferable even from one project. XinceAI's ARTIFACT label pattern is a good example: it's content-agnostic, adds information density, and works in any report. For a single-project ADD, Curator must write a ≥ 50-word Rationale argument that explicitly addresses: (a) why the pattern generalises, (b) what other project types would benefit, (c) what the cost of adoption is.
- **Numeric shortcut:** if the rationale is under 50 words for a single-project ADD, downgrade to a deletion candidate of the opposite kind — "this didn't appear in N projects" — and defer to the 2-project rule.

### 6.2 MODIFY threshold

Same as ADD. A modification to an existing template pattern needs the same evidence bar — two projects or one-project-plus-50-words. Modifications are often subtler than additions ("change the heatmap from 5-band to 4-band") and the lower visual footprint tempts analysts to propose them casually. Don't.

### 6.3 DELETE threshold

A field must be **unused in ≥ 3 finished projects** before proposing deletion. Strict. Deleting prematurely is the #1 way methodology quality degrades.

- **Why three and not two?** Fields are often category-specific. A field unused in two adjacent projects might still be essential for the third project type (e.g. `market_share_estimate_pct` is rarely populated for aged-care or micro-market products, but is central to SaaS enterprise analysis). Three projects across different categories gives enough diversity to distinguish "unused because irrelevant everywhere" from "unused because the two projects happened to not need it."
- **What counts as "unused"?** The field is either missing entirely, or present but null / empty string / default placeholder in every record. A field populated in 1 of 35 records in one project still counts as unused for that project — one data point isn't enough to justify the field's schema cost.
- **Candidates vs. proposals.** A field at 1 or 2 projects unused is a *candidate* and lives in the bottom section of the proposal doc. Only at 3 projects does it promote to the Agent-specific DELETE line. This lets the approval gate see the pressure building without acting on it prematurely.

### 6.4 REGRESSION threshold

No count threshold. A single observed regression with a clear source citation is enough to log. Regressions don't change the template schema, so the cost of logging a one-off is low; the cost of *not* logging a regression is that the next project repeats the mistake.

### 6.5 The 20-proposal rule

If Curator finds itself about to write more than 20 proposals from a single target, something is wrong. Either:

- The target radically diverged from the template (and the conversation is "should we fork?" not "should we merge a hundred changes?"), or
- Curator is not honouring the thresholds and is proposing speculative one-offs.

When the count passes 20, stop, re-read the thresholds, and prune. A 40-proposal doc will not be approved; it will be ignored, and the actual good proposals inside will rot with the rest.

## Human approval gate

Derrick reviews each proposal line and marks one of three statuses:

- **✅** — approved. The proposal lands in METHODS.md and the corresponding methodology or dictionary file is edited by the human (not by Curator directly; see Section 11).
- **❌** — rejected. The proposal is discarded.
- **DEFER** — deferred. The proposal goes into a backlog section at the bottom of METHODS.md for re-consideration on a future run.

### 7.1 The "no maybe-later" rule on ❌

When a proposal is rejected, it is *discarded*, not filed. There is no "maybe-later" pile attached to the ❌ column.

Rationale: if a pattern is worth revisiting, it will be proposed again on the next Curator run that touches a project using the pattern. The cost of re-proposing is low; the cost of maintaining a "maybe" list is high (it rots, entries lose context, and Derrick can't tell the rejected-once from the rejected-thrice).

The DEFER status exists for proposals that are *almost* good but need more evidence — not for proposals Derrick wasn't sure about. If Derrick is hesitating between ❌ and DEFER, the tie-breaker is ❌.

### 7.2 Mechanics of the approval pass

- Derrick opens the proposal doc in Markdown, reads each line, and annotates with ✅ / ❌ / DEFER inline (e.g. by prepending the status to the bullet).
- Only ✅ items translate to METHODS.md entries and methodology edits.
- DEFER items are copy-pasted into the backlog section at the bottom of METHODS.md with a date stamp (when they were first deferred).
- The annotated proposal doc is committed back to `methodology/proposals/` as-is — it's the audit trail for future Curator runs. Never delete a proposal doc after approval; it's how the template tracks the history of its own shape.

### 7.3 What Curator does *not* do

Curator does not edit methodology files, does not edit `FIELD-DICTIONARY.md`, does not edit the scaffold. Curator writes exactly one file — the proposal doc — and stops. All substantive edits are done by the human after approval. See Section 11 (Deliverable) for why.

## METHODS.md entry format

Per approved item, append to `METHODS.md` in the format below. The file is append-only; never edit or delete prior entries.

```
## vX.Y.Z — YYYY-MM-DD — <short title>
- ADD/MODIFY/DELETE · <target file> · <change>
  Source: <project>/<path>
```

- **Version bump rules.** Patch version (v0.1.1, v0.1.2) for small schema tweaks and single-field ADDs. Minor version (v0.2.0) for new analytical patterns or visualisations. Major version (v1.0.0) reserved for the first public release. Multiple approved items from one Curator run bundle into one version bump — don't fragment a single approval pass across three patch versions.
- **Short title.** A five-to-ten-word description of what the version is "about." Good: "multi-model pricing analysis and ARTIFACT labels." Bad: "various updates."
- **One bullet per approved proposal**, preserving the action type, target file, and change from the proposal doc. Do not re-summarise; the proposal doc is already terse.
- **Source citation** remains on a second line under each bullet, in the format `<project>/<path>`. Keep the line number range if it was in the proposal.
- **Backlog section at the bottom of the file.** Any DEFER items from the approval pass go into the backlog with a deferred-date stamp. The backlog is re-read on the next Curator run.

## Pitfalls

Three named failure modes with fixes. Each has bitten a methodology curator somewhere before; naming them is the fastest way to avoid repeating.

### 9.1 Proposing everything

**Symptom:** the proposal doc has 40+ entries, most of them "nice-to-have" or "I noticed this existed." Curator fatigue sets in; the approval gate becomes a chore; Derrick skims and either approves too liberally or rejects en masse. Either way the signal is lost.

**Cause:** Curator treats "observed" and "propose-worthy" as the same thing. They aren't. Observation is Section 4; proposing is Sections 5–6. Between them sits the thresholds filter, and it exists to keep the propose-rate lower than the observe-rate.

**Fix:** enforce the thresholds in Section 6 as a hard filter. ADD / MODIFY need ≥ 2 projects or ≥ 50-word justification. DELETE needs ≥ 3 projects. If you find yourself proposing more than 20 items from one target, stop, re-read the thresholds, and prune. The target proposal count for a typical run is 5–15. Over 20 is a smell.

### 9.2 Single-project deletions

**Symptom:** a field isn't used in the target project, Curator proposes DELETE. Six months later it turns out the field was essential for a category the target didn't touch, and the deletion broke Agent 4's whitespace sizing.

**Cause:** a field unused in one project is a sample size of 1. Project-to-project variance is large; some fields legitimately sit dormant for a whole project type and are essential in another.

**Fix:** 3-project threshold for DELETE. A field unused in one or two projects is a *candidate*, not a proposal. Candidates live in the bottom section of the proposal doc, where the approval gate can see the pressure building without acting on it. Only at three projects does the candidate promote to a real proposal.

### 9.3 Vibes-based proposals

**Symptom:** a proposal reads "the analyst noticed that the report would look better with a TAM calculator" or "it feels like we should store competitor social handles." No file path, no line number, no anchor to anything the reviewer can verify.

**Cause:** the analyst absorbed impressions while walking the target and tried to capture them as proposals without the intermediate step of anchoring each impression to a concrete artefact.

**Fix:** every proposal line requires a `file:line` anchor. No exceptions. If Curator can't point at the exact place in the target where the pattern appears, the proposal is rejected at authoring time, not at the approval gate. The "vibes" can still be useful as a working note in Curator's scratch file — but they don't enter the proposal doc without a source.

A corollary: if you find yourself wanting to write "in my judgment" or "it seems like," rewrite the proposal to cite what specifically in the target made that judgment appropriate. The anchor is the argument.

## Example workflow (worked)

A complete walkthrough of one proposal from discovery through approval.

### 10.1 Setup

- **Date of dispatch:** 2026-05-12.
- **Target:** `~/codings/lumana` — aged-care ambient monitoring analytics for Phuong Nguyen (GNVC 2026 project).
- **Ship signal:** Lumana v2 PDF delivered to Phuong on 2026-05-08; the site is live.
- **Curator dispatch reason:** Lumana introduced several analytical moves the template doesn't have. Curator runs against it to propose the transferable ones.

### 10.2 Walking the target (per Section 4)

Curator reads:

- `lumana/data/competitors.json` — 32 competitors, schema mostly aligns with template but adds `care_setting[]` and `monitoring_modality[]` fields not in the template dictionary.
- `lumana/data/pricing-strategy.json` — has an 8-model pricing analysis block where the template has a single-model tier structure.
- `lumana/data/market-intelligence.json` — standard, no new fields.
- `lumana/data/whitespace-framework.json` — standard.
- `lumana/assets/js/viz/` — has a "care-setting heatmap" widget not in template.
- `lumana/report.html` — standard layout; uses template conventions.

Observations (Section 4.1–4.6):

- New fields: `care_setting[]`, `monitoring_modality[]`, `pricing_model_scores[]` (the 8-model block).
- New viz: care-setting heatmap.
- New analytical move: 8-model pricing analysis with per-persona scoring.
- Stylistic patterns: none that stood out beyond template defaults.
- Regressions: none observed.
- Deletion candidates: `market_share_estimate_pct` is null on all 32 records in Lumana. Candidate for deletion — but only 1 project so far, stays in candidates section.

### 10.3 Applying thresholds (Section 6)

- `care_setting[]`, `monitoring_modality[]` — single project, category-specific. Curator writes a 50-word generalisation argument for each: the argument for `care_setting[]` is weak (aged-care specific) so it does *not* cross the threshold. Dropped from proposals. The argument for a *generalised* "product_context_tags[]" field — a free-form string array for category tags — is stronger; Curator proposes that instead, with Lumana's implementation as the source.
- `pricing_model_scores[]` (8-model analysis) — single project, but clearly transferable. Curator writes the 50-word argument: any complex-buyer market benefits from scoring 4–10 alternative pricing structures rather than 3. Argument passes; proposal proceeds.
- Care-setting heatmap — specialised viz; generalisation is weak; dropped. Curator notes it as a REGRESSION-adjacent observation ("we didn't have a pattern for category-specific heatmaps") but does not propose.
- `market_share_estimate_pct` unused — 1 project. Stays in candidates section, doesn't promote to DELETE.

### 10.4 The proposal line that results

From the 8-model pricing analysis observation:

```
## Agent 3 — Pricing Strategy Analyst
- ADD | methodology/03-pricing-strategy-analyst.md | Promote "multi-model pricing analysis" pattern: score 4–10 alternative pricing structures against personas, not just 3. | Rationale: Lumana's 8-model analysis surfaced 2 tiers we would have missed with 3-model scoring (subscription + metered hybrid, and enterprise per-device). Pattern transferable to any complex-buyer market where the buyer weighs multiple cost structures simultaneously (health-tech, enterprise SaaS with usage tiers, B2B marketplaces). Cost of adoption is one extra analyst pass per project. | Source: lumana/data/pricing-strategy.json:42-180
```

- Target file: `methodology/03-pricing-strategy-analyst.md`.
- Source: `lumana/data/pricing-strategy.json`, lines 42–180 (the 8-model block).
- Rationale: 65 words, clears the single-project threshold.

### 10.5 Approval

Derrick reviews the proposal doc. This line gets ✅. METHODS.md gets the following new entry:

```
## v0.2.0 — 2026-05-14 — multi-model pricing analysis

- ADD · methodology/03-pricing-strategy-analyst.md · Promote multi-model pricing analysis (score 4–10 alternative structures, not just 3). Applies to complex-buyer markets.
  Source: lumana/data/pricing-strategy.json:42-180
```

Derrick then edits `methodology/03-pricing-strategy-analyst.md` to incorporate the multi-model guidance. Curator does not edit the file; the human does, so that the prose reads as an intentional methodology choice rather than a machine patch.

### 10.6 What didn't land

In the same proposal doc, the `care_setting[]` ADD proposal was ❌'d with the note "too category-specific." The generalised `product_context_tags[]` proposal was DEFER'd — Derrick liked the idea but wanted to see it appear in one more project before promoting. It went into the METHODS.md backlog with a 2026-05-14 deferred-date.

Three months later, XinceAI v1.1 ships and also uses a context-tag pattern. The next Curator run picks up the deferred item from the backlog, notes that XinceAI replicates the pattern, and re-proposes as a full ADD (now crossing the 2-project threshold). This time it gets ✅'d and lands.

This is the system working: DEFER is the pressure valve for "good idea, not enough evidence yet," and the backlog is the place where a good idea patiently accumulates evidence across runs.

## Deliverable

**Exactly one output:** a proposal doc at `methodology/proposals/<YYYY-MM-DD>-<target-slug>.md`.

**No other files are created or modified by Curator.** Not `FIELD-DICTIONARY.md`, not the eight methodology files, not `METHODS.md`, not the scaffold, not the data JSONs. This is a firm rule.

### 11.1 Why Curator doesn't edit the template directly

- **Auditability.** The proposal doc is the artefact the human approved. If Curator edited the methodology directly, there would be no single place showing "these were the proposed changes, and these are the ones Derrick signed off." Proposals live in `methodology/proposals/`; edits live in the files they touch; approvals are committed separately. Three artefacts, three git histories, easy to audit.
- **Blast radius.** An over-eager Curator that directly edits methodology could degrade it silently. The proposal-first pattern forces every change through a human gate before it becomes load-bearing.
- **Tone and prose.** Methodology files like `01-competitor-research-analyst.md` are ~600 lines of carefully-tuned prose with a specific voice. Machine patches rarely preserve that voice. Humans editing after approval produce cleaner methodology than machines patching after approval.

### 11.2 Human follow-through after approval

After Derrick marks up the proposal doc with ✅ / ❌ / DEFER, the sequence is:

1. Derrick edits the target methodology / dictionary / scaffold file(s) to incorporate the ✅ items. Derrick writes the prose.
2. Derrick appends the corresponding entries to `METHODS.md` with a bumped version number (Section 8).
3. Derrick copies the DEFER items into the METHODS.md backlog with a deferred-date stamp.
4. Derrick commits the annotated proposal doc back to `methodology/proposals/` alongside the methodology edits in a single commit (or two closely-spaced commits if the diffs are large). The commit message references the proposal doc filename for traceability.
5. Curator is not re-invoked to validate the edits. The next Curator run, whenever it happens, reads the updated template as the new baseline.

### 11.3 If Curator needs to flag a cross-cutting issue

Some findings don't fit the per-agent proposal format — e.g. "the whole scaffold's colour-token naming is inconsistent across agents." Curator still writes these up, but in a `## Cross-cutting observations` section at the bottom of the proposal doc, above the deletion candidates. The same source-cite rule applies; the same ✅ / ❌ / DEFER approval gate applies.

## Tooling notes

- **Read tool access** to the target project and to the template. No writes except the one proposal doc.
- **Prior proposals**: read `methodology/proposals/*.md` before starting, to avoid re-proposing ideas that have been ❌'d. Ideas that have been DEFER'd are fair game to re-propose if new evidence has appeared.
- **Working log**: Curator can keep a scratch file at `/working/07-curator-log.md` (git-ignored) for notes, candidate tallies across projects, and source-cite drafts. The proposal doc itself is produced from the log at the end of the walk, not incrementally.
- **Commits**: commit the proposal doc in one shot, with a commit message of the form `proposal: curator run against <target-slug>`. Do not commit the annotated / approved version until Derrick has marked it up.
- **Time budget**: a Curator run against a mid-size finished project is ~1–2 hours. Most of the time is spent walking the target and cross-referencing against the template; writing the proposal doc itself is usually < 30 minutes once the walk is done. If Curator takes > 4 hours, the target has likely diverged enough from the template that the conversation should be "fork" not "merge."

## Deliverable checklist

Self-audit before handing the proposal doc over to Derrick. Every box must be checked.

- [ ] Proposal doc lives at `methodology/proposals/<YYYY-MM-DD>-<target-slug>.md` with the correct filename format.
- [ ] Summary header names the target, ship date, and proposal counts (N ADD, M MODIFY, K DELETE, R REGRESSION).
- [ ] Every proposal line cites a `file:line` source in the target.
- [ ] ADD / MODIFY proposals pass the 2-project OR 50-word-generalisation threshold. For single-project items, the Rationale visibly contains the ≥ 50-word argument.
- [ ] DELETE proposals pass the 3-project threshold. Fields at 1 or 2 projects sit in the deletion-candidates section, not in the per-agent DELETE lists.
- [ ] Regressions are logged with source cites; no regression is proposed as an ADD or DELETE by mistake.
- [ ] Total proposal count is ≤ 20. If > 20, Curator re-reads Section 6 and prunes.
- [ ] Agents with zero proposals have an explicit "No proposals from this target" line in their section.
- [ ] Cross-cutting observations (if any) live in their own section and follow the same source-cite rule.
- [ ] Deletion-candidates section at the bottom lists each candidate with its current unused-project count.
- [ ] Proposal doc is no more than ~300 lines. If longer, Curator has over-proposed and should prune before submission.
- [ ] No methodology files, dictionary, scaffold, or METHODS.md were touched. Only the proposal doc was written.
- [ ] Prior-proposal check performed: no ❌'d ideas have been re-proposed without new evidence.

If any item fails, fix it before handing off. A proposal doc that fails the checklist will fail the approval gate; save Derrick the round-trip.
