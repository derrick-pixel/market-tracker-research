# 02 — Market Intelligence Analyst

## Role one-liner

Maps the Singapore / SEA macro landscape — TAM, policy, culture, economics, adoption — with quantitative anchors and cited sources.

## When to dispatch

Dispatch Agent 2 after Agent 1 produces `competitors.json`, because the competitor set *defines* what "the market" means for this project. Note-taking software and digital wastewater monitoring are both "software for SG SMEs" in the abstract, but the policies that matter, the adoption benchmarks, the cultural signals, and the economic drivers diverge completely. Without Agent 1's competitor database to anchor the category boundary, Agent 2 produces generic SG macro content that reads like a Statista landing page.

Re-dispatch triggers:

- **Policy shift in the category.** A new IMDA grant, a MAS notice, an IRAS e-invoicing mandate, a PDPA amendment, or a WSG SkillsFuture injection that touches the buyer's budget calculus. These move `effective_date` timelines and can flip `sentiment` on existing policy entries.
- **Material macro move.** SG CPI crossing 3%, a 50bps rate move by MAS, STB arrivals printing ±15% off plan, or a construction-starts shock in the six quarters you're tracking. Economic signals that feed Agent 3's elasticity heuristics become stale fast.
- **Market-size revision from a credible source.** IMDA, IDC, Gartner, or a category-specific industry association publishes a new TAM / growth figure. Your triangulation inherits the new anchor.
- **Geography expansion in the brief.** The project was SG-primary; now it's SG + MY + ID. Country readiness must re-score the new countries and the adoption patterns must re-weight.
- **Quarterly refresh.** Even without triggers, the 12-month staleness rule (Section 7.3) forces a re-check of every entry at least yearly.

Agent 2 is cheap to re-run compared to Agent 1; the sources are mostly published and stable. Err toward refreshing rather than living with stale macro.

## Inputs the agent needs

- **`competitors.json` from Agent 1**, including the `top_five[]` array and Agent 1's handoff note. The competitor set defines the category boundary. The handoff note flags country gaps (e.g. "PHL: 0 records") that you must surface as caveats in your sizing or adoption sections rather than paper over.
- **Project brief** — the ICP, the primary geography, the service category as the buyer describes it, and any brief-level claims about TAM that the founder has already made. If the brief says "this is a SGD 400M market in SG," your job is to verify or refute that claim with cited sources, not to rubber-stamp it.
- **Existing `market-intelligence.json`** if this is a re-run. Diff against it; preserve entries that remain current and `data_as_of` within the 12-month window, replace or re-verify the rest.
- **Web access** — live, not cached. Policy dates, grant caps, and macro indicators change quarterly. A training-data TAM figure from 18 months ago is almost always wrong by enough to matter.
- **Brand tokens and project name** for the `meta` block, if this is a fresh clone of the template and Agent 2 is the first to touch this file.
- **A human escalation channel.** The pitfalls in Section 7 include cases where no credible public number exists — you must escalate rather than fabricate.

## The "So what?" requirement

This is the single highest-value rule for Agent 2. Every entry in every section — every market-size figure, every policy, every cultural observation, every economic signal, every country-readiness row, every trend — must end with an `implication_for_us` sentence that names a specific, actionable consequence for the project's go-to-market, pricing, positioning, or roadmap.

The `implication_for_us` field is required in `FIELD-DICTIONARY.md` §5.1, §5.2, §5.3, §5.4, §5.6, and implicitly by every `note` field in §5.5. The dictionary treats it as non-optional because market intelligence without a strategic read is a trivia file. A policy entry that says "IMDA launched Grant X on 2026-01-15" and stops there is worthless to Agent 3, Agent 4, and Agent 8. A policy entry that says "IMDA launched Grant X on 2026-01-15; it covers 50% up to SGD 30,000 for SaaS in our category; we should apply for PSG pre-approval by 2026-Q3 to access 40% of SG SME buyers who now expect grant-funded pricing" is the minimum bar.

Three reasons this rule is the highest-value discipline for this agent:

1. **Agent 3 and Agent 4 consume the implications, not the raw facts.** Agent 3 writes elasticity heuristics by segment; it needs "SME IT budgets compressed 8% YoY per IDC SEA 2026 — we should expect resistance at any tier > SGD 100/mo" not just the raw 8% figure. Agent 4 writes attack plans; it needs "MAS TRM compliance now mandatory for any fintech client — this is a wedge against US-hosted competitors" not just the TRM update date. A facts-only market intelligence file forces Agents 3 and 4 to re-do the strategic read you already did, and they will each read it differently — introducing inconsistency the Report PDF will inherit.

2. **Without the rule, the agent drifts into generic macro write-ups.** Search "Singapore AI adoption 2026" and you can produce ten pages of summary before lunch. None of it matters to the project unless each paragraph connects to the ICP. The rule forces the filter: if you can't write the implication, the entry doesn't belong. Pitfall 7.2 (Policy dump without strategic read) is the most common failure mode observed in this agent's outputs; the rule is the direct countermeasure.

3. **The rule is self-auditing.** At handoff time, a reviewer can scan the JSON in 90 seconds and see whether every entry has a non-trivial `implication_for_us`. Entries with copy-paste implications ("this is important for our strategy"), missing implications, or implications that merely restate the fact in future tense ("we should monitor this") fail the audit. No other rule in this methodology is as cheaply checkable.

**How to write a strong `implication_for_us` line:**

- Name a concrete action, a segment, or a timeline. "We should add PDPA Advanced certification before Q3 2026 to unlock regulated SG SME deals" is concrete. "Consider implications for compliance" is not.
- Link it to the ICP in the project brief. An implication that doesn't mention a segment from the ICP is probably a generic observation, not a project-specific implication.
- Pass the "so what?" test: a reviewer reads the fact, then reads the implication, and does not ask "so what?" If they could, the implication is too weak.

**Bad implications (common patterns to reject):**

- "This is relevant to our market." (Everything is.)
- "We should monitor this indicator." (That's a meta-implication, not a decision.)
- "This creates opportunities for us." (Which opportunities? For which segment?)
- "Important for our pricing." (Important how? Raise, lower, tier differently?)

**Good implications (patterns to emulate):**

- "PSG pre-approval in our category caps the effective price a SG SME will pay at SGD 12/mo post-grant (50% of SGD 24/mo). Agent 3 should anchor the Plus tier near SGD 24/mo list, not SGD 40/mo."
- "SG manpower cost rose 7.2% YoY (MOM 2026-Q1). SMEs will feel the payroll squeeze by H2; our ROI pitch should lead with 'replaces 0.4 FTE' not with feature breadth."
- "MY SME digital readiness is 2/5 on our rubric but price tolerance is 4/5 because the gov DigitalNiaga grant covers 60%. Expansion order should be SG → MY before ID."

## The five intelligence domains

Every `market-intelligence.json` file produced by Agent 2 must cover all five domains plus the trends section. Schema shapes are in `FIELD-DICTIONARY.md` §5.1 through §5.5 — do not redocument them here, but follow the field names and value constraints exactly.

### Domain 1 — Market size (TAM / SAM / SOM)

**What the agent is looking for:** a credible, defensible estimate of the Total Addressable Market, the Serviceable Addressable Market, and the Serviceable Obtainable Market for the project's specific category, in SGD, for the primary geography (typically SG, sometimes SG + selected SEA countries).

TAM is the outer bound: every SGD the buyer could conceivably spend on the category in the market, ignoring competition and distribution. SAM is what you can actually sell into — filtered by segment fit, channel reach, language, regulation, and entity status. SOM is what you realistically win in the plan horizon (typically 3 years) given your team, capital, and GTM. TAM → SAM → SOM is usually a 10-to-100× funnel; a TAM of SGD 500M usually maps to a SAM of SGD 30-80M and a SOM of SGD 2-10M.

**Where to find it:**

- **IMDA** — `imda.gov.sg` publishes annual digital economy reports with segment breakdowns (cloud, cybersecurity, fintech, SME digitalisation, AI adoption). The statistics are SG-specific and current to the prior year.
- **Statista** — category-level global and regional market size, sometimes with SG breakouts. Cross-check the methodology note; Statista often extrapolates rather than surveys.
- **Gartner / IDC** — paid research, but summaries appear in their press releases and vendor-sponsored white papers. IDC SEA specifically covers SG / MY / ID / TH / VN / PH as a cluster, which matches this template's country list. Gartner is stronger on enterprise categories (security, cloud infra, ERP); IDC is stronger on SME-inclusive categories.
- **Industry associations** — SGTech (SG tech sector), AIBP (ASEAN IT buyer surveys), FinTech Singapore Association, SBF (SG Business Federation), SMF (SG Manufacturing Federation). Association reports often have SME-specific slices that generalist research misses.
- **ACRA** — the SG entity registry. For triangulation when no published figure exists, ACRA's active-entity count by UEN classification × estimated ARPU × segment penetration yields a grounded SAM. Active-entity counts are public; ACRA publishes a quarterly registered-entity summary.

**How many entries are required:** one `market_size` object with the full structured shape per `FIELD-DICTIONARY.md` §5.1. Required fields: `tam_sgd`, `sam_sgd`, `som_sgd`, `derivation_flow` (TAM → SAM → SOM stages, see §5.1.1), `implications[]` (3–6 strategic-read cards, see §5.1.2), `methodology_appendix` (verbatim long-form prose), `sources[]` with at least one citation per figure. If TAM and SAM are derived from different sources, cite both. If SOM is your own derivation (team × rep × quota × conversion, or per-year ramp), each row of arithmetic lives inside a stack inside `derivation_flow.som.stacks[]`; the prose stays in `methodology_appendix`.

**Why the structured shape.** Earlier projects (XinceAI 2026 Q1, Lumana GNVC 2026, Elitez Events Q1) shipped market sizing as a single 1,500–2,000 char `reasoning` paragraph plus a similarly dense `implication_for_us` paragraph. The render layer rendered these as two `<p>` tags. Result: reviewers stopped reading after the second sentence and the strategic story landed nowhere. The structured shape is the fix: the funnel diagram makes the TAM → SAM → SOM story scannable, the per-stack inputs/equation chips make every multiplier auditable, and the implication cards put each strategic read on its own line. The legacy `reasoning` and `implication_for_us` strings are now optional — kept for back-compat but never the primary surface.

**Lossless preservation:** the `methodology_appendix` field exists so no fact from the long-form prose is lost. When you migrate a wall-of-text `reasoning` into `derivation_flow`, copy the original verbatim into `methodology_appendix` first, then walk through it sentence by sentence and assign each sentence to either (a) a stack input, (b) a stack source, (c) a stack equation, (d) a stage filter, or (e) an implication card. Any sentence that fits none of those five buckets stays in the appendix. The renderer collapses the appendix inside `<details>`; reviewers who want the full chain expand it.

**Triangulation rubric — use when no public figure exists:**

Start from ACRA. The SG registered-entity counts as of 2026-Q1 are roughly:

- ~580,000 total SG-registered entities
- ~300,000 are "active" (filing returns, trading)
- Of the active, ~95% are SMEs (SSIC-classified employment < 200 / revenue < SGD 100M)
- Filter to your ICP classification: e.g. F&B (SSIC I), construction (F), retail (G), manufacturing (C), professional services (M, N). Each filter cuts the SAM base.

Then estimate ARPU for the category. If your product is SGD 50/mo and adoption rate in the segment is 15%, SAM = (filtered ACRA base) × 15% × SGD 600/yr. Show the arithmetic inline in the `reasoning` field. Every multiplier must have a source or be labelled "estimated; to be validated" in the reasoning text.

**Worked example 1 — SG SME note-taking software TAM/SAM/SOM (structured shape):**

```yaml
tam_sgd: 120000000
sam_sgd: 42000000
som_sgd: 4200000
currency_label: "SGD"

derivation_flow:
  tam:
    stage_label: "STAGE 1 · TAM"
    subtitle: "SG SME knowledge/collaboration tools — total addressable spend before any reach filter."
    result_label: "S$120M"
    total_equation: "S$1.2B × ~10%"
    stacks:
      - name: "SG SME software market"
        source: "IDC SEA SME Software Spend 2026"
        inputs:
          - { label: "SG SME software total", value: "S$1.2B / yr" }
          - { label: "Knowledge/collab share", value: "~10%" }
        equation: "S$1.2B × 10%"
        result_label: "S$120M"
  sam:
    stage_label: "STAGE 2 · SAM"
    subtitle: "Filter to operators we can credibly serve with the current product."
    result_label: "S$42M"
    total_equation: "35% × S$120M"
    filters:
      - "≥ 10 headcount (single-user tools fit poorly)"
      - "English-primary operations (product is EN-only at launch)"
      - "Active filer with ACRA SSIC matching ICP segments"
    stacks:
      - name: "Filtered SG SME base"
        source: "ACRA SSIC × proprietary survey n=240"
        inputs:
          - { label: "TAM", value: "S$120M" }
          - { label: "Filter share", value: "35%" }
        equation: "35% × S$120M"
        result_label: "S$42M"
  som:
    stage_label: "STAGE 3 · SOM (3-year cumulative)"
    subtitle: "What our 2-rep team can credibly close in 3 years at S$600 ARPU."
    result_label: "S$4.2M"
    total_equation: "2 reps × 40 deals × 3 yrs × S$600 × retention"
    stacks:
      - name: "Direct sales"
        source: "Internal capacity model — 2 reps, 40 deals/rep/yr"
        inputs:
          - { label: "Reps", value: "2" }
          - { label: "Deals/rep/yr", value: "40" }
          - { label: "Years", value: "3" }
          - { label: "ARPU", value: "S$600/yr" }
          - { label: "3-yr retention", value: "~75%" }
        equation: "2 × 40 × 3 × S$600 × 75%"
        result_label: "S$4.2M"

implications:
  - headline: "S$42M SAM caps the per-seat pricing thesis"
    body: "At S$600 ARPU the project needs ~70,000 SG SME seats to claim meaningful share. Agent 3 should stress-test whether per-seat pricing reaches that volume or whether a flat-team-tier model compresses the funnel."
    agent_targets: ["agent_3"]
  - headline: "Year-3 ARR target = S$1.4M, ~2,300 seats"
    body: "SOM of S$4.2M / 3yr = S$1.4M ARR by year 3 ≈ 2,300 paying seats. Agent 3's tier sizing must be calibrated against that headcount target so the model triangulates."
    agent_targets: ["agent_3"]

methodology_appendix: "TAM derived top-down from IDC SEA SME Software Spend 2026: SG SME software market SGD 1.2B total, of which ~10% is knowledge/collaboration tools (shared docs, note-taking, wikis) per IDC's category breakdown. SAM filtered to ≥10-headcount English-primary SMEs by ACRA SSIC × proprietary n=240 survey, yielding 35% of TAM. SOM grounded in our own capacity: 2-rep team × 40 deals/rep/yr × SGD 600 ARPU × 3-year cumulative × ~75% net retention ≈ SGD 4.2M."

sources:
  - { title: "IDC SEA SME Software Spend 2026", url: "https://..." }
  - { title: "IMDA Digital Economy Report 2025", url: "https://www.imda.gov.sg/..." }
  - { title: "ACRA Active Entity Counts Q1 2026", url: "https://www.acra.gov.sg/..." }
```

**Worked example 2 — triangulated SAM where no published figure exists (SG SME wastewater monitoring software):**

```yaml
tam_sgd: 8400000
sam_sgd: 3200000
som_sgd: 480000
currency_label: "SGD"

derivation_flow:
  tam:
    stage_label: "STAGE 1 · TAM"
    subtitle: "All PUB-licensed trade effluent reporters at theoretical full ARPU."
    result_label: "S$8.4M"
    total_equation: "2,100 × S$4,000"
    stacks:
      - name: "PUB trade effluent licensees"
        source: "PUB Trade Effluent Licensee Register 2026 (no public TAM exists for this software niche)"
        inputs:
          - { label: "Licensees", value: "2,100" }
          - { label: "Theoretical ARPU", value: "S$4,000 / yr" }
        equation: "2,100 × S$4,000"
        result_label: "S$8.4M"
  sam:
    stage_label: "STAGE 2 · SAM"
    subtitle: "SME-only subset — large industrials run incumbent enterprise tools."
    result_label: "S$3.2M"
    total_equation: "60% × S$5.4M *(reachable SME ARPU pool)*"
    filters:
      - "ACRA SSIC: manufacturing, F&B, industrial services"
      - "Headcount < 200 (SME definition)"
      - "Quarterly discharge reporters (the binding workflow)"
    stacks:
      - name: "SME licensee subset"
        source: "PUB × ACRA SSIC cross-reference"
        inputs:
          - { label: "Licensees (TAM)", value: "2,100" }
          - { label: "SME share", value: "~60%" }
          - { label: "ARPU", value: "S$4,000 / yr" }
        equation: "2,100 × 60% × S$4,000"
        result_label: "S$5.0M *(rounded down to S$3.2M after non-reachable subset removed)*"
  som:
    stage_label: "STAGE 3 · SOM (3-year cumulative)"
    subtitle: "1-rep capacity × realistic 3-year conversion."
    result_label: "S$480k"
    total_equation: "30 deals × 3 × S$4,000 × ~50% retention"
    stacks:
      - name: "Direct sales"
        source: "Internal capacity model"
        inputs:
          - { label: "Deals/yr", value: "30" }
          - { label: "Years", value: "3" }
          - { label: "ARPU", value: "S$4,000" }
          - { label: "Retained share", value: "~50%" }
        equation: "30 × 3 × S$4,000 × 50%"
        result_label: "S$480k"

implications:
  - headline: "Volume play is structurally capped"
    body: "2,100 total licensees, ~1,260 SMEs addressable. SOM of S$480k / 3yr is capital-efficient but caps at a ceiling. GTM cannot be built around volume."
    agent_targets: ["agent_3", "agent_4"]
  - headline: "Adjacent licensee categories unlock 2–3× SAM"
    body: "Air emissions and solid-waste licensee bases are similar in size and have the same SME profile. Agent 4 should consider whether the architecture extends to those categories without product rewrite."
    agent_targets: ["agent_4"]
  - headline: "Specialist premium pricing is justified"
    body: "Buyer base is small and can bear premium pricing for a specialist. Agent 3 should price closer to S$6,000/yr rather than commodity-scale pricing."
    agent_targets: ["agent_3"]

methodology_appendix: "No published TAM exists for SG wastewater monitoring software specifically. Triangulated: PUB (SG national water agency) lists ~2,100 trade effluent licensees required to report discharge data. Of those, ~60% are SMEs per ACRA SSIC cross-reference (manufacturing, F&B, industrial services). TAM = 2,100 licensees × SGD 4,000/yr potential ARPU = SGD 8.4M. SAM = 60% SME subset × SGD 4,000 = ~SGD 3.2M addressable with our SME-focused product. SOM = 15% of SAM over 3 years = SGD 480k cumulative, reflecting 1-rep team × 30 deals/yr × 3 years × SGD 4,000 ARPU, partially retained."

sources:
  - { title: "PUB Trade Effluent Licensee Register 2026", url: "https://www.pub.gov.sg/..." }
  - { title: "ACRA SSIC Active Entity Breakdown Q1 2026", url: "https://www.acra.gov.sg/..." }
```

Both examples show: every multiplier anchored to a source, arithmetic explicit, SOM grounded in team capacity and realistic conversion, and implications written as separate cards that each name a concrete action for Agents 3 or 4. The `methodology_appendix` preserves the original prose so no fact is lost in the migration from the legacy single-string shape.

### Domain 2 — Policy (≥ 3 policies)

**What the agent is looking for:** the government policies, grants, regulations, and standards that materially shape demand, supply, pricing, or compliance in the category. Not a tax-code dump; only policies whose presence or absence changes how a buyer, vendor, or competitor behaves.

**Where to find it:**

- **IMDA** (`imda.gov.sg`) — SG Digital Enterprise Blueprint, grants (PSG, EDG, SME Go Digital), CTO-as-a-Service, cybersecurity programmes. Any project touching SG SME software lives under IMDA's policy umbrella.
- **MAS** (`mas.gov.sg`) — financial-services policy. TRM guidelines, technology risk management, open banking, stablecoin frameworks, e-payment rails (PayNow, SGQR). Relevant if your buyer is in financial services or touches payments.
- **IRAS** (`iras.gov.sg`) — tax policy, e-invoicing (Peppol / InvoiceNow), GST rules for digital services. The InvoiceNow rollout is a forcing function in B2B SaaS.
- **MOM** (`mom.gov.sg`) — manpower. S-Pass / EP thresholds, CPF rates, MOM-stipulated payroll obligations. Relevant for HR-adjacent products and for anyone whose ROI pitch depends on labour cost.
- **WSG** (`wsg.gov.sg`) — workforce development. SkillsFuture, WDG(JR+), PCPs. Relevant for training-adjacent products and when grant-funded consulting is in the mix.
- **STB, EDB, Enterprise SG, MTI, MCI, MINDEF, PDPC** — domain-specific ministries and agencies. Only surface ones that directly touch the category.
- **ASEAN Secretariat** (`asean.org`) — ASEAN Digital Masterplan 2025, cross-border data flow agreements, trade facilitation. Relevant for projects expanding beyond SG.

**How many entries are required:** minimum 3 policies. More if the category is policy-dense (fintech, healthtech, cleantech often have 6-10 relevant policies). Each entry populates the full schema in `FIELD-DICTIONARY.md` §5.2: `title`, `body`, `sentiment` (exactly one of `support | neutral | against`), `effective_date`, `sunset_date` (if known), `url` (primary source), `data_as_of` (when you captured this entry), `implication_for_us`.

**Rubric for `sentiment`:**

- **`support`** — the policy accelerates demand for the category, lowers the buyer's effective price, reduces the vendor's compliance burden, or removes a barrier to entry. Examples: a new grant covering 50% of the category's list price; a gov-mandated digitalisation target that pushes buyers to adopt.
- **`neutral`** — the policy touches the category but doesn't materially shift behaviour. Example: a disclosure requirement that vendors and buyers can comply with at zero marginal cost.
- **`against`** — the policy raises cost, narrows the buyer base, or favours an incumbent. Examples: a data-localisation rule that advantages local vendors and disadvantages globals (if you're a global, it's against; if you're SG-local, it's support); an export-control rule that shrinks the overseas SAM.

**Rubric for `data_as_of`:** the date you read and verified the policy. If you are copying an entry from an earlier version of the file and have not re-verified, the `data_as_of` must stay on the earlier date, not be silently updated to today. See pitfall 7.3 (Stale macro).

**Worked example 1 — IMDA PSG grant for our category:**

See Section 8 for a fully-worked policy entry with every field populated.

**Worked example 2 — IRAS InvoiceNow mandate (against global incumbents, support for SG-local):**

```
title: "IRAS InvoiceNow Peppol mandate for GST-registered businesses"
body: "From 2025-11-01 new voluntary GST registrants must use InvoiceNow (Peppol-based e-invoicing) for B2B transactions. Extends to all GST-registered entities by 2026-05-01 per IRAS. InvoiceNow integration is a functional requirement, not a nice-to-have, for any B2B tool that handles invoices or billing workflows."
sentiment: "support"
effective_date: "2025-11-01"
sunset_date: null
url: "https://www.iras.gov.sg/taxes/goods-services-tax-(gst)/invoicenow"
data_as_of: "2026-04-23"
implication_for_us: "Any competitor without native Peppol / InvoiceNow integration becomes compliance-breaking for SG B2B buyers after 2026-05-01. Agent 4 should treat InvoiceNow integration as a whitespace dimension on the strategy canvas; the Global incumbents in our category are likely behind here. Agent 3 should explore an 'InvoiceNow-ready' tier as a clear SG-local wedge."
```

Note how the `sentiment` value `support` is justified in the implication: the policy supports *us* relative to global competitors who don't natively integrate. The same policy might be `against` from a global incumbent's view; `sentiment` is from *our* project's perspective, not absolute.

### Domain 3 — Cultural signals

**What the agent is looking for:** qualitative patterns in how the buyer thinks, buys, and uses products — specific to the primary geography. Cultural signals are the soft constraints that product and GTM must respect, and they are usually the gap between a deck that looks great in San Francisco and a deck that actually wins SG deals.

**Where to find it:**

- **Edelman Trust Barometer** — annual, with an SG cut. Useful for "does the buyer trust government / business / peers" framing.
- **Hofstede / GLOBE** — cultural dimensions scoring. Use sparingly; the numbers are old and broad. Better as a sanity check than a primary source.
- **Blackbox Research, YouGov SG, Milieu Insight, Rakuten Insight** — SG/SEA consumer and B2B panels. Paid but sometimes freely excerpted in press.
- **Industry-specific surveys** — e.g. SGTech's annual CIO survey, Maybank SME Digitalisation Index, DBS SME Pulse, Visa SMB Sentiment Index. These are the richest cultural signal sources for B2B.
- **Local founder communities and Slack/Discord archives** — SaaS Boss, Build in SEA, Rocketship SG, 1337. Not formal evidence, but useful for spotting cultural patterns (e.g. "SG founders budget quarterly, not annually, because of CPF cashflow cycles").
- **LinkedIn SEA thought-leader content** — look for patterns across 10+ posts in the category, not single anecdotes.

**Entry format and data-point requirement:**

Each entry populates `observation`, `evidence`, `implication_for_us` (`FIELD-DICTIONARY.md` §5.3). Every `observation` must be backed by at least one concrete data point in `evidence` — a survey number, a published report finding, a specific industry benchmark. "Anecdotally, SG buyers prefer X" fails. "In the 2026 Maybank SME Digitalisation Index (n=520 SG SMEs), 68% said 'ease of use' was the top adoption barrier, vs. 31% citing price" passes.

**How many entries are required:** 4-8 signals. Fewer than 4 and you haven't looked; more than 8 and you're probably lumping together generic SG stereotypes.

**Worked example 1 — SME risk aversion:**

```
observation: "SG SMEs strongly prefer proven, locally-referenced tools over 'cutting-edge' category entrants; peer logos matter more than product innovation in the first sales call."
evidence: "DBS SME Pulse 2026 Q1 (n=800 SG SMEs): 74% ranked 'used by similar SG businesses I trust' as a top-3 vendor selection criterion; 'latest technology' ranked 8th at 19%. SGTech CIO Survey 2026 echoed: 61% said they actively waited 6-12 months after a new tool launched before evaluating."
implication_for_us: "Our website must prominently display SG SME logos and named case studies within 2 scrolls of the homepage. Agent 4's whitespace attack plans should lead with proof, not novelty. Agent 5 should score competitor sites on 'SG logos above the fold' as a design dimension. Launch GTM should include 3-5 SG SME design partners before broad market."
```

**Worked example 2 — language and support expectations:**

```
observation: "SG SME owner-operators expect after-hours support in Singlish / Mandarin / Bahasa (for Malay-speaking F&B and retail owners); global vendors' US-time English-only support is a recurring satisfaction gap."
evidence: "G2 reviews SG filter 2026-Q1: of 180 SG SME reviews across our category's top 15 competitors, 38 mentioned 'support hours' or 'language' as a 1- or 2-star issue. Our own 14 user interviews confirmed 9 of 14 want WhatsApp support in local language over ticket-based English support."
implication_for_us: "Founder-led WhatsApp support in Mandarin + Singlish is a structural wedge against Global incumbents. Agent 3 should factor this into the premium pricing justification — SME buyers will pay ~10-15% more for responsive local support per our interview data. Agent 4 should make 'language & channel' a strategy canvas dimension."
```

### Domain 4 — Economic signals

**What the agent is looking for:** macroeconomic indicators that link directly to the category's demand driver. Not a generic SG macro dashboard — only the 4-7 indicators whose movement predicts the buyer's spend on this specific category.

**Where to find it:**

- **MAS Monetary Policy Statement** — quarterly. SG inflation, rate stance, USD-SGD NEER, growth forecast.
- **SingStat / Department of Statistics** — published monthly. CPI, retail sales, industrial production, construction starts, visitor arrivals (STB), labour market statistics.
- **STB** (Singapore Tourism Board) — visitor arrivals, hotel RevPAR, F&B receipts. Critical for hospitality-, F&B-, retail-adjacent categories.
- **BCA** (Building and Construction Authority) — construction starts, contract awards, building demand forecast. Critical for construction, real estate, proptech categories.
- **MOM Labour Market Report** — quarterly. Unemployment, manpower cost index, foreign labour trends. Critical whenever ROI is expressed as "replaces X FTE" or the buyer's cost structure is labour-heavy.
- **ABS (Australian Bureau), BNM (Bank Negara Malaysia), BI (Bank Indonesia), BSP (Philippines), BoT (Thailand), SBV (Vietnam)** — use when the project has country-readiness entries beyond SG.
- **Industry-association barometers** — SBF Business Sentiment Survey, SMF Manufacturing Outlook, REDAS Real Estate Index. These provide forward-looking sentiment where SingStat provides backward-looking hard data.

**Rubric for "link to the service's demand driver":**

An economic signal belongs in the file only if its movement plausibly moves the buyer's decision to buy. Examples of correct linkages:

- **SG manpower cost YoY** → relevant for any product whose ROI pitch includes "replaces part of an FTE" (most productivity SaaS, most automation tools).
- **STB visitor arrivals monthly** → relevant for hospitality PMS, F&B POS, retail analytics, booking tools.
- **BCA construction starts quarterly** → relevant for proptech, construction software, FM tools.
- **MAS 3-month SORA (the successor to SIBOR)** → relevant for any product sold to lenders, borrowers, or buyers whose working-capital cost is the bottleneck.
- **SG CPI YoY** → relevant always, but only a specific implication if your product is in a price-elastic category; don't include generic CPI without a category link.
- **SG SME IT spend YoY** (IDC) → relevant for any B2B SaaS sold into SG SMEs.

Do not include an indicator just because it's a prestigious number. "SG GDP growth 2026-Q1 was 2.1%" without a category linkage fails the "so what" test.

**Entry format:** `indicator`, `value` (with units and period), `source_url`, `implication_for_us` (`FIELD-DICTIONARY.md` §5.4). `value` must include both the unit (SGD, %, thousand, index) and the period (YoY, MoM, QoQ, annualised, latest-quarter).

**How many entries are required:** 4-7 indicators. Fewer than 4 and you're missing demand drivers; more than 7 and the file turns into a macro dashboard nobody reads.

**Worked example 1 — SG SME IT spend, for a B2B SaaS project:**

```
indicator: "SG SME IT spend YoY"
value: "-3.2% YoY for 2026-Q1 (vs +4.1% for 2025-Q1), per IDC SEA SME Spend Tracker"
source_url: "https://www.idc.com/getdoc.jsp?containerId=..."
implication_for_us: "SG SMEs cut IT spend 3.2% YoY — first negative print in 5 years. Expect lengthened sales cycles (Agent 3: factor into SOM velocity), higher price sensitivity in the SGD 50-150/mo band (Agent 3: calibrate Plus tier closer to SGD 80 rather than SGD 120), and higher churn risk for non-essential tools (roadmap: prioritise 'mission-critical' positioning over 'nice-to-have' features in Q2 launch)."
```

**Worked example 2 — SG manpower cost, for a labour-replacing product:**

```
indicator: "SG overall labour cost index YoY"
value: "+7.2% YoY for 2026-Q1 (MOM Labour Market Report 2026-Q1); PMET cost index +8.9% YoY"
source_url: "https://stats.mom.gov.sg/Pages/Labour-Market-Report.aspx"
implication_for_us: "PMET cost rising 8.9% YoY makes our 'replaces 0.4 FTE' ROI pitch sharper: at average PMET salary SGD 7,500/mo, 0.4 FTE saves SGD 36,000/yr vs our SGD 6,000/yr Plus tier — 6× ROI, up from ~5× a year ago. Agent 3 can lift the Plus tier SGD 30/mo without worsening ROI framing; Agent 4 should make 'FTE cost replacement' the primary attack plan against the DIY alternative (hire a junior analyst instead of buying the tool)."
```

### Domain 5 — Adoption patterns

**What the agent is looking for:** how penetrated is the category today, split by SME vs MNC, and how ready is each SEA country to adopt (regulatory, technical, price tolerance). This is the domain that most directly feeds Agent 3's elasticity heuristics and Agent 4's expansion sequencing.

**Where to find it:**

- **IMDA Digital Economy Report** — SG category penetration, SME vs MNC breakdowns.
- **IDC SEA and Gartner APAC** — country-by-country adoption benchmarks.
- **World Bank Digital Development / DESI-equivalent for SEA** — composite readiness indices; use the sub-indices (regulatory, infrastructure, skills) rather than the headline score.
- **ASEAN Digital Masterplan progress reports** — country self-reported readiness on digital dimensions.
- **McKinsey, BCG, Bain SEA reports** — consulting-firm reports often have SEA-6 country breakdowns with proprietary survey data.
- **Country-specific regulators** — MDEC (MY), Kominfo (ID), NBTC (TH), MIC (VN), DICT (PH) — for regulatory readiness reads.

**Required shape:**

- `sme_penetration_pct` (0-100, number): estimated percentage of SG SMEs in the ICP that use *any* tool in the category today (not just our product — the category as a whole).
- `mnc_penetration_pct` (0-100, number): the same for SG MNCs / large enterprises.
- `note` (string): caveats, definitions, methodology. Use this field to record which SSIC classes you included, which employment band defines "SME" in your calc, and what time window the estimate covers.
- `country_readiness[]` (array): one entry per country of interest. **Required countries for SEA projects: SG, MY, ID, VN, TH, PH** — all six of the canonical SEA-6 weighting set from `01-competitor-research-analyst.md`.

Each `country_readiness[]` entry has three integer scores on a 1-5 scale:

- **regulatory** (1 = hostile / prohibitive, 5 = permissive / actively supportive). Reflects how easy it is for a SaaS vendor to sell legally in the country: data localisation, licensing, foreign entity requirements, sector-specific approvals.
- **tech_maturity** (1 = infrastructure gaps, buyer unfamiliarity; 5 = cloud-first, integration-friendly, buyers already on SaaS). Reflects how ready the buyer base is technically.
- **price_tolerance** (1 = extreme price compression; 5 = premium pricing viable). Reflects the buyer's willingness to pay at SG-SaaS-typical price points.

**Rubric for each axis:**

Regulatory:
- 5: Active grant support (SG, MY partially), clear SaaS-friendly regulation, foreign entities welcome
- 4: Neutral regulation, foreign entities operate freely, no major licensing hurdles
- 3: Some friction (data localisation for certain categories, moderate licensing)
- 2: Significant friction (broad data localisation, foreign entity caps, heavy sector licensing)
- 1: Hostile — category restricted, foreign SaaS effectively blocked

Tech maturity:
- 5: Cloud-default, API-first, strong integration ecosystem, buyers expect SaaS
- 4: Cloud-majority, most buyers have moved off on-prem
- 3: Mixed — SME still on-prem, MNC cloud
- 2: On-prem default, cloud adoption mostly at MNC and tech-native startups
- 1: Low cloud penetration across segments

Price tolerance:
- 5: Premium pricing viable (SG, for most categories)
- 4: Mid-market pricing viable with grant support
- 3: Discounted pricing required; 30-40% off SG list typical
- 2: Heavy discounting (50%+) or country-specific SKUs needed
- 1: Free / freemium / ad-supported only

**Worked example 1 — adoption pattern for a SG SME note-taking tool:**

```
sme_penetration_pct: 12
mnc_penetration_pct: 68
note: "SME penetration estimated from G2 SG reviewer filter × ACRA active-entity count: ~36,000 of ~300,000 active SG SMEs use any dedicated note / shared-docs tool (Notion, Confluence, Coda, ClickUp, or local). The 12% figure is 'any tool', not 'our product'. MNC penetration from IDC SG 2026 knowledge-management survey (n=140 MNCs, 95 confirmed tool usage). Definition of SME: ACRA SSIC + headcount < 200."
country_readiness:
  - { country: "SG", regulatory: 5, tech_maturity: 5, price_tolerance: 5 }
  - { country: "MY", regulatory: 4, tech_maturity: 4, price_tolerance: 3 }
  - { country: "ID", regulatory: 3, tech_maturity: 3, price_tolerance: 2 }
  - { country: "VN", regulatory: 3, tech_maturity: 3, price_tolerance: 2 }
  - { country: "TH", regulatory: 3, tech_maturity: 3, price_tolerance: 3 }
  - { country: "PH", regulatory: 3, tech_maturity: 3, price_tolerance: 3 }
implication_for_us: "SG penetration 12% is low — 88% of SG SMEs still on email / paper / shared drives. That's the TAM we have to unlock, not just 'steal share from Notion'. The DIY alternative dominates, which is consistent with Agent 1's Top-5 including ChatGPT + Google Docs at rank 5. Agent 4's attack plans should target the 'first-time adopter' segment before the 'switch from Notion' segment. On expansion: MY is the only country scoring ≥ 4 on both regulatory and tech; it's the natural Wave 2 after SG. ID and VN are long-term plays — wait for price tolerance to recover before investing."
```

**Worked example 2 — adoption pattern for a B2B fintech compliance tool:**

```
sme_penetration_pct: 4
mnc_penetration_pct: 42
note: "Category = SaaS tools for financial-services compliance monitoring, transaction screening, and regulatory reporting. SG FinTech Association 2026 member survey (n=110 SG fintechs): 4% SME use a dedicated tool, remainder use spreadsheet + consultant. MNC figure from MAS TRM survey of licensed entities. SG SME universe here is narrow — only ~1,200 fintech / financial-services SMEs — so 4% is ~48 businesses."
country_readiness:
  - { country: "SG", regulatory: 5, tech_maturity: 5, price_tolerance: 5 }
  - { country: "MY", regulatory: 3, tech_maturity: 4, price_tolerance: 3 }
  - { country: "ID", regulatory: 2, tech_maturity: 3, price_tolerance: 2 }
  - { country: "VN", regulatory: 2, tech_maturity: 3, price_tolerance: 2 }
  - { country: "TH", regulatory: 3, tech_maturity: 3, price_tolerance: 3 }
  - { country: "PH", regulatory: 3, tech_maturity: 3, price_tolerance: 2 }
implication_for_us: "SG SME fintech universe is narrow (1,200 entities, 48 paying today) — SAM is small. Agent 3 must price high (SGD 1,500-3,000/mo) because volume is capped and each buyer has high compliance-cost tolerance. ID and VN score regulatory 2 — their financial regulators have restrictive rules on foreign compliance SaaS; do not attempt expansion before 2027. MY scores regulatory 3 not 4 because BNM licensing adds friction; feasible but slow. Agent 4's expansion plan should stay SG-centric for 24 months and only then add TH / MY."
```

## Trends

**Section 6 of `market-intelligence.json`.** Shorter than the five primary domains. Lists 3-5 emerging shifts that will reshape the category over the next 12-24 months. Each entry populates `title`, `evidence`, `implication_for_us` per `FIELD-DICTIONARY.md` §5.6.

Trends differ from the other five domains in timing: market-size, policies, cultural signals, economic signals, and adoption patterns describe the present. Trends describe the near-future — what's small today but big by the next full refresh cycle. Examples by category:

- **Technology shifts:** generative AI adoption crossing the SME threshold; on-device / edge LLMs replacing cloud calls; Peppol e-invoicing becoming universal in SG B2B.
- **Buyer-behaviour shifts:** SME buyers moving from email sales to self-serve checkout; younger founders (Gen Z) preferring open-source + self-host over SaaS; the "pay with grant or don't pay" expectation becoming default in SG.
- **Competitive shifts:** Global incumbents setting up APAC data centres and neutralising SG-local residency wedges; regional challengers (VN, ID) moving up-market into SG.
- **Regulatory shifts:** PDPA Advanced certification becoming a procurement requirement; MAS extending TRM-style rules to adjacent sectors; ASEAN cross-border data flow agreements coming into force.

Rules:

- **No speculation.** Each `evidence` field must cite a source with a date: an IMDA consultation paper, a Gartner Hype Cycle placement, a specific competitor's earnings call, a named regulator's public statement. "We think AI will be big" is not a trend; "IMDA's 2026-03 AI adoption consultation paper signals a 2027 SME grant launch" is.
- **12-24 month horizon.** Trends shorter than 12 months are "current conditions" and belong in the relevant primary domain (usually economic or cultural). Trends longer than 24 months are speculation and belong in a separate long-range document, not this file.
- **Implication must name the action window.** "By Q3 2026, we should have…" is a usable implication. "Eventually we should consider…" is not.

**Worked example:**

```
title: "Gen AI SME grant expected 2027 per IMDA consultation"
evidence: "IMDA's 2026-03 consultation paper ('Accelerating SME AI Adoption') floated a proposed 60% grant up to SGD 50k for AI-software adoption by SG SMEs, with target launch 2027-Q1. Press coverage on 2026-03-18 (Business Times SG) and 2026-04-02 (Tech in Asia SG) both cited 2027-Q1 timeline from IMDA spokespeople."
implication_for_us: "If the grant lands on the consulted terms, any AI-feature we ship pre-launch becomes 60% discounted for SME buyers in 2027-Q1. We should (a) ensure our AI features meet IMDA pre-approval criteria (cybersecurity baseline, PDPA compliance, data residency attestation) by end-2026; (b) file for PSG pre-approval in parallel; (c) prepare a 2027-Q1 launch campaign timed to grant announcement."
```

Three to five trend entries is the right number. Fewer feels hollow; more dilutes the signal.

## Pitfalls

Three named failure modes to self-audit before handoff.

### 7.1 TAM inflation

**Symptom:** the `tam_sgd` figure is suspiciously large — SGD 500M for an SG-specific category, or SGD 5B for an SG SME niche. Or the TAM comes from a Gartner global figure multiplied by SG's share of Asian GDP.

**Cause:** using a global or APAC-level number without filtering down to the SG SME ICP. The vendor wants big numbers because big TAMs make pitch decks look good; the agent yields to that gravity and lands on a figure that's technically sourced but strategically useless.

**Fix:** anchor SAM in ACRA active-entity count × segment penetration × ARPU, as described in Domain 1's triangulation rubric. If a published TAM exists, use it *as a cross-check* against the bottom-up ACRA build, not as a substitute. If the ACRA build and the published figure disagree by more than 2×, investigate which one is wrong — usually the published figure was built for a different category boundary. Record the arithmetic in `reasoning` so the next reviewer can replicate it. And write the `implication_for_us` against SAM and SOM, not TAM, because TAM is too noisy to anchor a decision against.

### 7.2 Policy dump without strategic read

**Symptom:** the `policies[]` array lists 8 policies with `title`, `body`, `url`, and `effective_date`, but the `implication_for_us` fields are copy-paste generic ("this is relevant to our strategy"), missing, or restated versions of the policy body.

**Cause:** the agent treated the policy section as a bibliography — list every relevant policy, link to it, done. That produces a file that is correct on the facts and useless on the strategy. Agent 3 and Agent 4 then re-do the strategic read themselves, often inconsistently, and the final deck reads as a patchwork.

**Fix:** enforce the "So what?" rule (Section 4) on every entry. Before committing a policy entry, write the `implication_for_us` out loud: "Given this policy, Agent 3 should [specific action], or Agent 4 should [specific action], because [consequence]." If you can't finish that sentence with a concrete action and consequence, either the policy doesn't belong in the file or you haven't thought about it hard enough. A policy without a sharp implication is a trivia fact, not intelligence.

### 7.3 Stale macro

**Symptom:** an economic signal shows "CPI 3.1% YoY" with no date; a policy shows `data_as_of: 2024-11-20` and has not been re-verified in 18 months; a market-size figure cites a Statista page that in turn cites a 2021 report. The reader cannot tell which entries are current.

**Cause:** market intelligence ages fast. Entries captured in an earlier refresh cycle stay in the file long after they stop being true, because re-verification takes more effort than leaving them. The result: a file that looks comprehensive but quietly misleads.

**Fix:** mark every entry with `data_as_of`. Any entry with `data_as_of` older than 12 months at the current `meta.research_date` must be re-verified or replaced before handoff. Add a pre-handoff check: "scan `policies[]`, `economic_signals[]`, and `cultural_signals[]` for any `data_as_of` older than 12 months; re-verify or flag explicitly." If an entry cannot be re-verified (the source page moved, the survey wasn't repeated), it must be replaced or clearly flagged in `implication_for_us` as "[data_as_of 2024-11; no 2026 refresh available — treat as directional only]". Silent staleness is the deception the pitfall describes; flagged staleness is honest.

## Worked example — fully-populated policy entry

A single policy entry, every field filled, showing the texture Agent 2 should aim for. This is the IMDA Productivity Solutions Grant (PSG) — the single most load-bearing policy for SG SME software projects, and the one downstream agents (especially Agent 3) lean on most.

```
{
  "title": "IMDA Productivity Solutions Grant (PSG) — SME SaaS category listing",
  "body": "PSG is a 50% funding grant (up to SGD 30,000 per SME per year) for pre-approved SaaS and digital solutions. SMEs apply via Business Grants Portal (BGP); approval typically 4-6 weeks. Vendors must be pre-approved by IMDA and listed on the PSG solution catalogue for SMEs to claim. Category listings are reviewed quarterly; new categories are added when IMDA identifies a digitalisation gap. Our category currently has 14 pre-approved vendors as of 2026-04; none of the Global incumbents in our Top-5 are listed.",
  "sentiment": "support",
  "effective_date": "2018-04-01",
  "sunset_date": null,
  "url": "https://www.imda.gov.sg/how-we-can-help/productivity-solutions-grant",
  "data_as_of": "2026-04-23",
  "implication_for_us": "PSG pre-approval is the single highest-leverage move for this project. At a SGD 24/mo list price, PSG coverage cuts the effective SG SME cost to SGD 12/mo — a 2× price advantage over any non-PSG competitor. Agent 3 should design the Plus tier at SGD 24/mo list precisely so the after-grant effective price lands at a round SGD 12/mo. Agent 4 should treat 'PSG listing' as a primary whitespace dimension on the strategy canvas — Notion, Confluence, Coda, and ClickUp are all unlisted, giving us a structural wedge for 12-18 months until they catch up. Submit PSG application by 2026-Q3 to access the 2026-Q4 SME budget cycle."
}
```

Points to note:

- `body` is 4 sentences and contains a specific current-state fact ("14 pre-approved vendors as of 2026-04; none of Global incumbents listed") that directly feeds the implication.
- `sentiment: support` is obvious here; the implication explicitly shows why (effective 2× price advantage).
- `effective_date: 2018-04-01` is the PSG's original launch date; `sunset_date: null` because PSG has been re-budgeted every financial year with no announced end. If you used `sunset_date`, it would be the date of the last budget extension.
- `data_as_of: 2026-04-23` is today's date because the agent verified the current pre-approved vendor list today.
- `implication_for_us` names two specific agents (Agent 3, Agent 4), two specific actions (tier pricing at SGD 24/mo; whitespace dimension on strategy canvas), a specific date (2026-Q3 submission), and a specific quantified benefit (2× price advantage). No generic language.

## Handoff to Agent 3 (Pricing Strategy)

Agent 3 reads `market-intelligence.json` as one of its two primary inputs (the other is `competitors.json`). Three specific linkages matter:

1. **Economic signals → elasticity heuristics.** Agent 3's `elasticity_heuristics[]` array scores each segment's demand elasticity on a `low | medium | high` band. That scoring depends on your economic signals: SG SME IT spend YoY drives SME elasticity, PMET cost drives the ROI framing on labour-replacing products, STB arrivals drive hospitality-segment elasticity. If your economic signals don't clearly imply an elasticity direction, Agent 3 will guess — poorly. Every economic signal's `implication_for_us` should make the elasticity direction explicit ("expect higher price resistance" or "ROI framing strengthens premium pricing").

2. **Adoption patterns → pricing tier sizing.** Agent 3's `recommended_tiers[]` must fit inside the SAM you calculated and must respect country-readiness `price_tolerance` scores. If SG price tolerance is 5 and MY is 3, the MY SKU either discounts 30-40% off SG list or uses a different tier structure (fewer features, lower price). Your adoption patterns section is the input that lets Agent 3 build country-specific pricing without re-doing the research.

3. **Market size → tier volumes.** Agent 3's SOM calculation in `recommended_tiers[]` backs out from "how many buyers at each tier × ARPU = SOM." Your SAM and SOM figures are the ceiling. If Agent 3 proposes tiers summing to a SOM larger than yours, either Agent 3 over-reached or your SAM is too narrow — surface the discrepancy rather than letting Agent 3 quietly exceed it.

Handoff note to Agent 3, at minimum:

- One-line summary of SG economic direction (e.g. "SG SME IT spend -3.2% YoY; expect price resistance in the SGD 50-150/mo band").
- Flag which country-readiness rows score `price_tolerance ≤ 2` — these need different pricing or exclusion from the plan.
- Flag any policy entry whose `sentiment: support` materially changes effective price (PSG, EDG, SkillsFuture, WDG(JR+), DigitalNiaga for MY, etc.) so Agent 3 designs tiers with grant math baked in.
- Flag any trend that will shift pricing dynamics in the 12-24 month window (e.g. "Gen AI SME grant expected 2027 — AI features may become grant-discounted by Q1 2027").

## Deliverable checklist

Self-audit against this list before declaring Agent 2 done. Every box must be checked.

- [ ] `market-intelligence.json` covers all 5 primary domains (`market_size`, `policies`, `cultural_signals`, `economic_signals`, `adoption_patterns`) plus `trends`.
- [ ] `market_size` has `tam_sgd`, `sam_sgd`, `som_sgd`, `reasoning`, `sources[]` (≥ 1), and `implication_for_us`.
- [ ] `policies[]` has ≥ 3 entries, each with `sentiment` in `{support | neutral | against}`, `effective_date`, `url`, and `data_as_of`.
- [ ] `cultural_signals[]` has 4-8 entries, each with at least one data-point citation in `evidence`.
- [ ] `economic_signals[]` has 4-7 indicators, each with units + period in `value` and a direct `implication_for_us` linking to the category.
- [ ] `adoption_patterns` has `sme_penetration_pct`, `mnc_penetration_pct`, `note`, and `country_readiness[]` with **SG + at least 5 other SEA countries** (required: SG, MY, ID, VN, TH, PH).
- [ ] Every `country_readiness[]` entry has all three scores (`regulatory`, `tech_maturity`, `price_tolerance`), each integer 1-5.
- [ ] `trends[]` has 3-5 entries with `title`, `evidence` (dated source), and action-windowed `implication_for_us`.
- [ ] **Every entry in every section has a source URL** (in `sources[].url`, `url`, `evidence`, `source_url`, or similar per the dictionary).
- [ ] **Every entry in every section has a non-trivial `implication_for_us`** that names a concrete action or consequence for the project (fails the audit if any implication reads like generic commentary).
- [ ] **No entry's `data_as_of` is older than 12 months** at the file-level `meta.research_date`, unless explicitly flagged as stale in its `implication_for_us`.
- [ ] Handoff note prepared for Agent 3: economic direction summary, flagged country-readiness outliers, grant-relevant policies, 12-24 month pricing trends.
- [ ] `meta.sample_data` flipped to `false` if this is real project data.
- [ ] TAM not inflated (cross-checked against ACRA × ARPU if a published TAM was used).
- [ ] All enum values (`sentiment` in `policies[]`) match Section 8 of `FIELD-DICTIONARY.md` exactly.

If any item fails, fix before handing off. Agent 3 and Agent 4 both read `market-intelligence.json` as ground truth; a half-finished or strategically thin file poisons tier pricing and whitespace analysis downstream.
