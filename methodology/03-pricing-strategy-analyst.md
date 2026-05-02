# 03 — Pricing Strategy Analyst

## Role one-liner

Builds the pricing playbook — personas, Next-Best-Alternative analysis, elasticity heuristics, tier design, and go-to-market proof points.

## When to dispatch

Dispatch Agent 3 only after Agents 1 and 2 have landed clean deliverables. Pricing is a downstream synthesis task; it cannot run in parallel with competitor research or market sizing because it consumes both as inputs.

Concretely, dispatch when:

- **Agent 1 is complete.** `competitors.json` has ≥ 30 records, the Top-5 is curated, `sg_monthly_sgd` values are populated (or explicitly `null` with `pricing_flag: hidden_estimated` and a source note), and the handoff note enumerates which records have hidden or estimated pricing. Without this, Agent 3 has no competitor pricing matrix to anchor on.
- **Agent 2 is complete.** `market-intelligence.json` carries the TAM/SAM/SOM block, PSG/EDG/SFEC policy entries with `effective_date` and `sunset_date`, and macro signals (FX, inflation, salary benchmarks) relevant to willingness-to-pay. Without this, Agent 3 cannot compute opportunity-cost numbers inside Next-Best-Alternative math.
- **The project brief has not materially changed since Agents 1 and 2 ran.** If the ICP has widened ("SG SME note-taking" → "SEA SME knowledge tools"), pause and re-run Agents 1 and 2 first. Agent 3 must not attempt to repair upstream drift by re-sizing markets mid-pricing.

Re-dispatch when any of the following change:

- A Top-5 competitor's `sg_monthly_sgd` moves > 20% (typical after a pricing relaunch).
- A new grant lands in `market-intelligence.json` or an existing grant sunsets (PSG cap revisions, EDG scope changes).
- The project adds or removes an ICP segment, which changes the persona roster.
- Agent 4 (Whitespace) returns a new `attack_plans[]` niche with a GTM motion that the current tier ladder can't price into cleanly — that's a signal the tier ladder is under-specified.

## Inputs the agent needs

- **`competitors.json` from Agent 1.** Primary source of the competitor pricing matrix. Read the full file, not just the Top-5 — mid-pack competitors often set the price floor the buyer uses as an anchor. For every record with `pricing_flag: hidden_estimated`, read the working log for the source note; if the source is thin, treat that record's price as directional, not anchoring.
- **`market-intelligence.json` from Agent 2.** Read `market_size` for TAM/SAM/SOM, `policies[]` for grant eligibility and coverage, `economic_signals[]` for wage benchmarks (used in opportunity-cost math), and `cultural_signals[]` for payment preferences (annual vs. monthly, CardUp miles, PayNow behaviour).
- **Project brief.** ICP, geography, positioning, and — critically — the founder's current pricing hypothesis if one exists. The hypothesis is a prior, not a conclusion; Agent 3 tests it against personas and NBA math.
- **Historical pricing data, if any.** If the project has live customers, pull actual paid prices, churn-on-price events, and any pricing experiments that shipped. Real cohort data beats inferred elasticity every time.
- **Web access** for spot-checking grant rules (IMDA PSG cap revisions happen quietly) and reading founder-community threads where buyers debate price points.
- **Brand tokens** from `meta.brand_tokens` for the rendering layer; not load-bearing for pricing logic but required for `pricing-strategy.json` to validate against the shared `meta` block.

If any of the above are missing, surface the gap before generating personas. A persona built without wage-benchmark data will have a fabricated `wtp_band_sgd` and everything downstream rots.

## The four pillars

Pricing strategy decomposes into four pillars. Work them in order; each later pillar reads from the earlier ones. All four land in `pricing-strategy.json` per the schema in `FIELD-DICTIONARY.md` §6 — refer there for field types and ranges; the guidance below is *how to fill them well*, not what shape they take.

### Pillar A — Personas (3–5 total)

Personas are the load-bearing fiction of the whole pricing file. Every tier exists to serve a persona; every NBA is computed against a persona's status quo; every elasticity band is grounded in a persona's substitution behaviour. Get personas wrong and the rest of the file is wrong in proportion.

**What to produce**

Build 3–5 personas that collectively cover the ICP. Three is the floor: one core buyer, one adjacent buyer, one stretch buyer. Five is the **hard cap** — Agent 7 in mid-flight mode flags any project shipping with six or more personas. Past five, personas blur together and tiers start double-booking the same buyer under two names.

**Persona-collapse audit (run before declaring Pillar A done):**

For every pair of personas, compute the intersection of their `pains[]` sets. If two personas share **≥ 60% of pains** (e.g. 3 out of 5 pains are duplicated), one of two outcomes is required:

- **Merge** — combine into a single persona with a broader `icp` sentence and the union of pains. The new persona inherits the higher `wtp_band_sgd.upper_stretch`.
- **Differentiate** — rewrite one persona's `pains[]` to focus on what is genuinely distinct. If the rewrite produces fewer than 3 pains, that persona was a shadow of the other and should be cut, not kept.

Skipping this audit produces the failure mode where Tier 2 and Tier 3 target nominally-different personas but are actually pricing the same buyer twice. Agent 4 (Whitespace) inherits the duplication and writes attack plans that point at the same heatmap row from two angles.

Fields per persona follow `FIELD-DICTIONARY.md` §6.1:

- `id` — stable lowercase-with-underscores. Foreign-key target referenced by `pricing_models[].score_by_persona`, `recommended_tiers[].target_persona`, and (new) `attack_plans[]` when Agent 4 wants to bind a plan to a persona.
- `name` — a short memorable label. "Boutique Agency Owner" beats "SME Persona 1."
- `icp` — one sentence describing who they are, by title, company size, and trigger. Include the trigger because the trigger is what makes them buy this quarter. "Founder-operator of an SG boutique creative agency (5–20 staff) preparing to pitch a 2× larger retainer that demands a client-proof project intake flow" beats "SMB creative services."
- `pains[]` — the top pains this persona feels *today*, in their words where possible. 3–5 entries. Anchored in observation (win/loss interviews, G2 1-star review patterns, community threads), not speculation.
- `current_workaround` — what they do today without us. Usually a combination of Excel, WhatsApp, email, and prayer. Name the specific tools.
- `wtp_band_sgd` — willingness-to-pay band with three anchors:
  - `low_anchor` — the price at which adoption becomes easy because it fits inside their existing discretionary spend. Often "less than a current subscription they already pay for."
  - `expected` — the price they'd expect to pay if they solved the problem properly. Derive from NBA math (see Section 5).
  - `upper_stretch` — the price at which they'd still pay but only with visible ROI. Usually 2–3× `expected`. Past `upper_stretch`, they defer.
- `nba` — the Next-Best-Alternative, as a **structured arithmetic block** per `FIELD-DICTIONARY.md` §6.1.1. Carries `method` (`wage` | `competitor_price` | `tooling_stack` | `time_value`), `summary`, `inputs` (the numbers that combine), `monthly_sgd_equivalent` (the single number every other arithmetic flows to), and `confidence` (0.0–1.0). The structured form forces every persona's `wtp_band_sgd.expected` to trace to verifiable arithmetic, not vibes. **Hard rule:** `wtp_band_sgd.expected` must sit between `0.4 ×` and `1.2 ×` `nba.monthly_sgd_equivalent`; outside that band, `nba.confidence` must be `< 0.6` and the persona is flagged as exploratory.
- `whitespace_segment_ids[]` — optional, but populate when known. Foreign keys into `whitespace-framework.json → heatmap.segments[].id`. One persona may map to multiple segments. Lets Agent 8 auto-cross-link "Persona X" to its corresponding heatmap row(s) in the report. If Agent 4 has not yet run, leave empty and Agent 4 will back-fill on its first pass.

**How to score**

Personas don't have a numeric score on their own. They get scored transitively via the `pricing_models[].score_by_persona` map in Pillar B and via the tier-to-persona assignment in Pillar D. What a persona *must* pass before leaving Pillar A:

- **The specificity test.** A stranger reading the `icp` sentence can name at least one real company that fits. If they can't, the `icp` is too abstract. Rewrite.
- **The NBA-with-number test.** `nba` carries a S$ figure or a time-and-wage figure that converts to S$. No bare "do nothing" allowed.
- **The coverage test.** Across all 3–5 personas, > 80% of expected revenue in the first 12 months maps to exactly one persona. If a plausible buyer doesn't fit any persona, add a persona or widen an `icp`. If a persona has no plausible buyer in the SG SOM, cut it.

**Worked example 1 — a full persona entry (structured nba)**

```json
{
  "id": "boutique_agency_owner",
  "name": "Boutique Agency Owner",
  "icp": "Founder-operator of an SG boutique creative or marketing agency (5–20 staff) preparing to pitch a 2–3× larger retainer that demands a repeatable client-intake and scoping flow.",
  "pains": [
    "Every new pitch re-invents the intake brief from scratch; pre-sales eats 8–12 hr/week of founder time",
    "Scope creep kills margin; no systematic record of what was signed vs. what got delivered",
    "Can't hire a junior AE because the process lives in the founder's head",
    "Larger retainers demand a 'we have a system' answer in the pitch — currently a bluff"
  ],
  "current_workaround": "Google Docs templates + WhatsApp briefs + a Notion database the founder maintains alone; scoping happens in a 45-min call with no artefact other than a handwritten note.",
  "wtp_band_sgd": { "low_anchor": 79, "expected": 149, "upper_stretch": 299 },
  "nba": {
    "method": "wage",
    "summary": "Founder spending 8 hr/week on intake & scoping; alternative is hiring a part-time ops lead at SGD 3,000/mo.",
    "inputs": {
      "hourly_sgd": 50,
      "hours_saved_per_month": 32
    },
    "monthly_sgd_equivalent": 1600,
    "confidence": 0.75
  },
  "whitespace_segment_ids": ["sg_creative_smb"]
}
```

Notice: `nba.monthly_sgd_equivalent` is `1600` (= 50 × 32). `wtp_band_sgd.expected` is `149`, which is `0.093 ×` the equivalent — well below the `0.4×` floor. **This is a deliberate signal**: the buyer's perceived budget for software is ~10% of the labour they're displacing, not 50%. The pricing strategy must therefore lean on PSG / annual-contract incentives to lift `expected` toward `0.4 ×` (i.e. SGD 640/mo equivalent, or SGD 320/mo with 50% PSG funding) rather than treat 149 as the ceiling. A `confidence: 0.75` signals the agent is confident in the labour math — the gap to WTP is a known commercial problem, not a measurement defect.

`pains[]` are observable, not speculative ("Can't hire a junior AE because the process lives in the founder's head" is a statement someone said in a win/loss interview, not an assumption). `current_workaround` names specific tools, not a vague "manual processes."

**Worked example 2 — a stretch persona**

```
name: "SG SME Regulated-Sector Ops Lead"
icp: "Operations or compliance lead at an SG SME in a regulated vertical (MAS-licensed fintech, HSA-registered medtech, or IMDA IM8-aligned public-sector supplier) responsible for maintaining audit-ready process documentation across 10–50 operational staff."
pains:
  - "Audit prep requires reconstructing 6–12 months of process decisions across Slack, email, and Confluence"
  - "Regulator-friendly documentation format is non-obvious; we over-document and still get findings"
  - "SG data residency is a hard requirement; most global tools fail this out of the box"
  - "Annual MAS TRM / PDPA Advanced checks cost 40–80 person-hours of compiled evidence"
current_workaround: "Confluence (not SG-residency compliant — flagged in last audit), Google Drive with ad-hoc folder taxonomy, and a 'process binder' Excel that the ops lead owns and no one else updates."
wtp_band_sgd:
  low_anchor: 299
  expected: 599
  upper_stretch: 1200
nba:
  method: "tooling_stack"
  summary: "Confluence (non-SG-residency, flagged in audit) + Google Drive + the ops-lead's personal Excel binder. Migration tail-risk: SGD 15–30k consultant spend if we don't replace Confluence with SG-residency-native tooling."
  inputs:
    tooling_lines:
      - { tool: "Confluence Standard, 25 seats", monthly_sgd: 175 }
      - { tool: "Audit-prep ops-lead time, 5 hr/mo @ SGD 100/hr", monthly_sgd: 500 }
      - { tool: "Confluence-to-compliant migration amortised over 36 mo (one-time SGD 22k midpoint)", monthly_sgd: 611 }
  monthly_sgd_equivalent: 1286
  confidence: 0.65
whitespace_segment_ids: ["sg_regulated_sme_ops"]
```

Note the higher `wtp_band_sgd` relative to the boutique agency. Regulated-sector buyers have larger budgets and harder walls (SG data residency, audit trails) that justify a 3–4× price multiple on the same underlying product if the compliance story is real. `nba.monthly_sgd_equivalent: 1286` makes the math explicit: `wtp_band.expected: 599` is `0.47 ×` the displaced spend — comfortably inside the `0.4–1.2 ×` band. `confidence: 0.65` reflects the migration-amortisation guess (the SGD 15–30k range introduces material variance). This is where the pricing ladder earns its top tier.

### Pillar B — Pricing models

The pricing model is the *shape* of how money moves — flat subscription, per-seat, per-transaction, hybrid, outcome-based. It is not the same as the tier ladder (Pillar D), which is the specific S$ values and what's in each tier. Pick the model first; the ladder instantiates it.

**What to produce**

A scored list of candidate pricing models. The schema in `FIELD-DICTIONARY.md` §6.2 stores `{ name, rationale, score_by_persona }` per model. Score every candidate model against every persona; 1–5 per intersection.

Candidate models to always consider:

- **Flat subscription.** Fixed SGD/mo, unlimited or generously-bounded usage. Lowest friction; highest alignment risk if a 2-person team pays the same as a 20-person team.
- **Per-seat.** SGD/mo per user. Default SaaS pattern. Works when the product's value scales with number of users (collaboration, CRM). Hostile to buyers where 1 power user serves many consumers.
- **Per-transaction.** SGD per invoice, per report, per workflow run. Works when usage is episodic and the vendor's cost scales with usage. Hard to budget for; buyers hate surprise bills.
- **Hybrid (platform fee + usage).** A base SGD/mo plus variable SGD/unit. The honest middle when flat under-captures and pure usage terrifies buyers. Slightly harder to explain; needs a pricing page that shows a calculator.
- **Outcome-based.** SGD per deal won, per ticket closed, per dollar saved. Maximum alignment; minimum adoption unless the outcome is trivially measurable and attributable to the vendor. Rare, powerful when it fits.

You may add a sixth if the category demands it (e.g. "rev-share on client billings" for agency products, or "% of annual budget managed" for procurement tools). Document the new model with the same `{ name, rationale, score_by_persona }` shape.

**How to score**

Score each model 1–5 per persona against these questions:

- **5 — Perfect fit.** Aligns with the persona's mental model of value, scales gracefully with their usage, and is easy for finance to approve. They'd pick this model even if a competitor offered another.
- **4 — Strong fit.** Works well but has one minor friction (e.g. seat counts are awkward during seasonal hiring).
- **3 — Workable.** No strong objection, no strong affinity. Persona will accept it if the price is right.
- **2 — Uphill.** Persona actively prefers a different model; they'll pay but will grumble and churn faster.
- **1 — Non-starter.** Persona's budget structure or usage pattern makes this model block the deal. (E.g. per-seat for a persona where 1 licensed user represents 40 consumers.)

**Justify the top and runner-up.** In the `rationale` field for each model, write 1–2 sentences on why it might work for *us*, and in the working log (not the JSON), record why the top model beat the runner-up. The runner-up matters because Pillar D may borrow from it for higher tiers — a flat-subscription core with a per-seat enterprise add-on is a common hybrid.

**Rule: pick the model that maps to the highest-value persona × highest-score intersection.**

Value = `wtp_band_sgd.expected × expected persona seat count × estimated segment size`. Compute this for each persona; the persona with the highest value is your primary revenue-driver. The model scored highest against that persona wins — even if a different model scores higher on average across all personas. You design for the revenue, not the mean.

If two models tie at the primary-persona intersection, break the tie by scoring the secondary-value persona. If they still tie, pick the simpler model (flat over per-seat over hybrid over usage over outcome) — simpler models reduce friction in the pricing page, which matters more than theoretical optimality.

**Worked example 1 — per-seat wins for a shared-docs product**

```
models:
  - name: "Flat subscription"
    rationale: "Simplest; buyers understand it instantly. Caps revenue at larger teams."
    score_by_persona:
      Boutique Agency Owner: 4
      Mid-Market Ops Lead: 2
      Regulated-Sector Ops Lead: 3
  - name: "Per-seat"
    rationale: "Standard SaaS pattern in shared-docs; scales with team growth which is the moment of peak willingness to pay."
    score_by_persona:
      Boutique Agency Owner: 3
      Mid-Market Ops Lead: 5
      Regulated-Sector Ops Lead: 5
  - name: "Per-transaction"
    rationale: "Doesn't fit docs — the unit is vague (document created? edit?). Skip for this category."
    score_by_persona:
      Boutique Agency Owner: 1
      Mid-Market Ops Lead: 1
      Regulated-Sector Ops Lead: 1
```

Primary-value persona = Mid-Market Ops Lead (expected SGD 149 × avg 12 seats × ~3,000 SG SMEs in segment = largest pool). Per-seat scores 5 there. Pick per-seat as the core model. Keep flat-subscription as the starter tier's guise (a flat monthly price that caps seats, which is per-seat maths dressed as flat) and borrow it for the "Starter" tier in Pillar D.

**Worked example 2 — hybrid wins for a workflow automation tool**

```
models:
  - name: "Flat subscription"
    score_by_persona: { Boutique Agency Owner: 4, Scale-Up COO: 2 }
  - name: "Per-seat"
    score_by_persona: { Boutique Agency Owner: 2, Scale-Up COO: 2 }
  - name: "Per-transaction (per workflow run)"
    score_by_persona: { Boutique Agency Owner: 2, Scale-Up COO: 3 }
  - name: "Hybrid: platform fee + per-run overage"
    score_by_persona: { Boutique Agency Owner: 4, Scale-Up COO: 5 }
```

Primary-value persona = Scale-Up COO (higher wtp, larger segment revenue). Hybrid scores 5 there. Pick hybrid. The platform fee maps to a flat `price_sgd` on each tier; the per-run overage appears in `what_in[]` as an included monthly run allowance with an explicit overage rate.

### Pillar C — Elasticity heuristics per segment

Elasticity is the answer to "how much does demand drop if we raise price by 10%?" Cheap to say, expensive to get wrong. The default in this template is **medium** — buyers care about price but other factors matter too. Overriding to `low` (inelastic — buyers don't care about price) or `high` (elastic — buyers are hyper-price-sensitive) requires specific evidence.

**What to produce**

An array of `elasticity_heuristics[]` entries, one per segment, per `FIELD-DICTIONARY.md` §6.3. Each entry carries `{ segment, elasticity_band, evidence }`. "Segment" usually matches a persona `name`, but can also be a broader band (e.g. "SG SMEs with <5 staff" cutting across two personas).

**How to score**

**Default = medium.** Only move off medium with evidence. SG SME markets are mostly medium-elastic: buyers have budgets, price shows up in their deliberation, but quality, trust, and local support can override price at the margin.

**Never claim `low` (inelastic) for SG SMEs without concrete evidence.** SG SME buyers are famously price-aware. Claiming low elasticity says "this segment will pay anything for this product" — a strong claim that needs strong proof. The only common cases where `low` is defensible:

- **Regulated-sector compliance tools** where the alternative is a SGD 100,000 fine or loss of licence. Even then, only `low` if a named competitor's recent price hike didn't show cohort churn.
- **Deeply-embedded infrastructure** already carrying customer data, with high switching cost documented in G2 reviews.
- **Outcome-based pricing that pays for itself** (e.g. a tool that reclaims SGD 5,000/mo of cost for a SGD 500/mo price). Here elasticity is low because the ROI is self-evidently large.

If your candidate case isn't one of these three, use `medium` and move on.

**Evidence required per claim.** For any band other than medium, the `evidence` field must cite at least one of:

- **Past cohort data** from the project's own customers (churn-on-price events, conversion rate at different price anchors, annual vs. monthly mix).
- **Competitor price experiments** with observable outcomes (a named competitor raised price by X% and their G2 review volume dropped or headcount stalled).
- **Community pricing threads** where at least 3 distinct buyers in the segment discuss the category's price sensitivity with specific dollar figures.
- **Structured win/loss interviews** where price was explicitly named as the reason for "no."

Vendor homepage claims ("our customers love our pricing") are not evidence. Anecdotes from a single founder friend are not evidence — they're a single data point that might inform an investigation but don't support a band claim.

**Worked example 1 — medium (the common case)**

```
segment: "Boutique Agency Owner"
elasticity_band: "medium"
evidence: "Three agencies interviewed in Mar 2026 all named price as a factor but not the deciding factor; each had a discretionary ~SGD 200/mo slot for tooling. One switched from Notion (SGD 12/seat) to Coda (free) because a retainer was lost, but switched back within 90 days because the workflow friction outweighed the SGD savings. Competitor Coda's entry-free tier has not collapsed the paid-shared-docs segment — consistent with medium, not high."
```

Notice the evidence is specific: a date, a count, a named switch, a named competitor, and a directional signal. A reviewer can weigh it. "Market research says SGD SMEs are moderately price-sensitive" is not evidence — it's hand-waving.

**Worked example 2 — high (aggressive segment)**

```
segment: "SG Solo Founder / Indie Hacker"
elasticity_band: "high"
evidence: "r/singapore and Indie Hackers SG threads (2025-Q4 and 2026-Q1) show repeated 'I'll use the free tier forever' sentiment; a competitor (Craft) ran a 30% discount in Feb 2026 and their subreddit activity spiked 4×. The solo-founder segment treats tooling as discretionary and churns at 3× the SME rate in our own cohort data (n=42 paid solo users, 14 churned within 90 days, 9 cited price). Pricing above SGD 19/mo in this segment drops conversion by ~40%."
```

High is defensible here because (a) community evidence is plural and specific, (b) competitor price-experiment data shows strong response, and (c) the project's own cohort numbers directly show the elasticity. Three legs make the claim hold.

**Rule of thumb:** across a typical 3–5 persona set, expect 3 `medium`, 1 `high` (solo / indie / student segments), and at most 1 `low` (regulated / infrastructure-locked). Anything outside that ratio deserves a second look before handoff.

### Pillar D — Recommended tiers (3 tiers standard)

Tiers are where the four pillars compile into something a customer clicks "buy" on. Three tiers is the standard; four is acceptable if the ICP truly splits into four WTP bands; two is a strong simplification signal that you're underselling; five or more is a pricing page buyers abandon mid-scroll.

**What to produce**

A `recommended_tiers[]` array per `FIELD-DICTIONARY.md` §6.4. Fields per tier:

- `name` — tier display name. "Starter / Team / Business" is fine; "Bronze / Silver / Gold" is tired; "Boutique / Agency / Studio" lands harder for a creative-market positioning. The name should feel native to the persona who buys the tier.
- `price_sgd` — list price. Monthly, unless the category is clearly annual-only.
- `target_persona` — the persona (`personas[].name`) this tier is designed for. One persona per tier, not multiple. See pitfall 7.2 below.
- `what_in[]` — features included. 4–7 entries. No duplicates across tiers (deliverable checklist requirement).
- `what_excluded[]` — features deliberately *not* in this tier. 2–4 entries, phrased as what the next tier unlocks. This is the up-sell mechanic.
- `psychological_anchor` — the one-line reason the price makes sense to the customer's mind. This is the sales line, not the feature list. Examples: "Less than a kopi-a-day," "Half the price of Confluence," "Billable to the client at 1x — pure margin."
- `effective_price_after_psg` — the price the SG buyer actually pays after PSG coverage (if the tier qualifies). Computed per Section 6 below. If the tier doesn't qualify for PSG, set this equal to `price_sgd`; if it qualifies, compute the discounted value.

**How to design**

**Rule: name the target persona FIRST, then assemble features.** See pitfall 7.2. Walk through each persona from Pillar A and ask: if I were pricing a tier just for this buyer, what would it cost, what would they need, and what would they not pay for? Then consolidate: if two personas want the same three features at the same price, collapse them into one tier serving both. If a persona doesn't fit cleanly into any tier, either add a tier or cut that persona (they may not be a real target).

**Anchor price on NBA, not on competitor pricing.** See Section 5 and pitfall 7.1. The reference point is the buyer's Next-Best-Alternative cost, not Notion's SGD 12. If the buyer's NBA is "hire a part-time ops lead at SGD 3,000/mo," your tier can price at SGD 300 and still look like a screaming deal — even if every competitor is at SGD 50. If you anchor on the SGD 50 competitor, you leave SGD 2,700 of value on the table.

**Use the WTP band.** The target persona's `wtp_band_sgd.expected` is the default target for `price_sgd`. Go lower to drive volume (entry tier), equal for the core tier, higher for the stretch tier that includes a compliance or white-glove story.

**Stack one tier's `effective_price_after_psg` to diverge from `price_sgd`.** At least one tier must show the PSG-adjusted price. That's a deliverable checklist item — and more importantly, it's the marketing wedge that makes SG buyers calculate "so I only pay S$75?" and click.

**Worked example — 3-tier ladder for a shared-docs product**

Context: primary persona is Mid-Market Ops Lead (wtp expected SGD 149, 12 seats avg). Secondary is Boutique Agency Owner (wtp expected SGD 149, 7 seats avg). Stretch is Regulated-Sector Ops Lead (wtp expected SGD 599, 18 seats avg). Pricing model from Pillar B: per-seat.

```
recommended_tiers:
  - name: "Boutique"
    price_sgd: 79
    target_persona: "Boutique Agency Owner"
    what_in:
      - "Up to 10 seats"
      - "Shared workspace with client-ready templates"
      - "Client-portal link-sharing (view-only)"
      - "Import from Notion / Google Docs"
      - "Email support, SG business hours"
    what_excluded:
      - "SG data residency (upgrade to Agency)"
      - "Advanced permissions and SSO (upgrade to Agency)"
      - "Audit trail export (upgrade to Studio)"
    psychological_anchor: "Less than two kopi-a-day — billable back to any one retainer and you've paid for the year."
    effective_price_after_psg: 79

  - name: "Agency"
    price_sgd: 199
    target_persona: "Mid-Market Ops Lead"
    what_in:
      - "Up to 25 seats"
      - "SG data residency (AWS ap-southeast-1)"
      - "SSO (Google Workspace, Microsoft 365)"
      - "Granular permissions + guest seats"
      - "Priority support, SG business hours"
      - "Integration: PayNow, Peppol, Xero"
    what_excluded:
      - "Audit trail export (upgrade to Studio)"
      - "MAS TRM compliance pack (upgrade to Studio)"
      - "Dedicated CSM (upgrade to Studio)"
    psychological_anchor: "Half the price of Confluence at the same seat count, and PSG-eligible — net price is SGD 99/mo."
    effective_price_after_psg: 99.50

  - name: "Studio"
    price_sgd: 599
    target_persona: "Regulated-Sector Ops Lead"
    what_in:
      - "Up to 50 seats"
      - "Audit trail export (MAS TRM / PDPA-friendly format)"
      - "SG data residency + contractual DPA"
      - "Compliance pack: MAS TRM, PDPA Advanced"
      - "Dedicated CSM with monthly review"
      - "Custom integrations (Peppol, IRAS, SGFinDex)"
      - "24/7 SG-hours support with 2-hr SLA"
    what_excluded:
      - "White-labelled deployment (ask sales)"
      - "On-premises install (ask sales)"
    psychological_anchor: "One afternoon saved per audit-prep cycle pays for six months. PSG-eligible; net SGD 299/mo."
    effective_price_after_psg: 299.50
```

Notice:

- Each tier names exactly one `target_persona`. No tier is "for everyone."
- `what_in[]` has no duplicates across tiers. Every upgrade unlocks something new. A buyer who only needs "SSO" moves from Boutique to Agency; the price delta (SGD 120) is buying the SSO and the residency together.
- `what_excluded[]` points to the *next* tier, not the one after. Upsells happen one step at a time.
- `psychological_anchor` varies per tier and maps to the persona's mental model: agency owner thinks "billable back"; mid-market thinks "half of Confluence"; regulated-sector thinks "audit cycle cost."
- `effective_price_after_psg` is stored as SGD, rounded to two decimals. Agency's SGD 199 × 50% PSG = SGD 99.50. Studio's SGD 599 × 50% = SGD 299.50. Boutique doesn't qualify for PSG at this price point (below the SGD 3k cap but some PSG pre-approved solutions require ≥ 1-year subscription — check the actual grant letter; see Section 6 for the eligibility walk-through).

## NBA analysis rubric

Next-Best-Alternative analysis is the load-bearing math in this whole pillar. It's what decides whether a tier can be priced at SGD 199 or SGD 599 — not what Notion charges, not what the founder dreams of charging, but what the buyer's alternative actually costs.

**For each persona, compute three numbers and one inequality:**

1. **Status-quo cost.** What is the buyer paying today to *not* solve this problem? Usually hours × wage. Example: Boutique Agency Owner spends 8 hr/week on re-inventing pitch intake. At SGD 50/hr founder-productive rate (a conservative SG rate — founders routinely self-assess at SGD 80–150/hr but discount it to SGD 50 for conservatism), that's 8 × 50 × 4.33 weeks = **SGD 1,732/mo opportunity cost**.

2. **Best-alternative cost.** The cheapest credible substitute that actually solves the problem. This can be:
   - A competitor product (use `competitors[].sg_monthly_sgd`, adjusted for seat count). If Notion Plus is SGD 12/seat × 7 seats = SGD 84/mo, and the persona would need Notion AI (SGD 10/seat add-on) to match us, that's SGD 154/mo.
   - A DIY solution (in-house hire, custom build). Fully-loaded SG part-time ops lead at SGD 3,000/mo; SG junior dev to build + maintain the workflow in Airtable at SGD 4,500/mo amortised over 6 months = SGD 750/mo of build cost plus the Airtable subscription.
   - A consultancy retainer (big-SI or specialised agency). Not usually the NBA for SME personas but relevant for regulated-sector buyers.

3. **Our price.** The `price_sgd` of the tier targeting this persona.

**Our price must beat the alternative on *perceived* value, not necessarily raw dollars.**

The inequality to satisfy:

> **Perceived value of our tier >> Best-alternative cost, AND perceived value of our tier ≥ Status-quo cost − friction of switching.**

"Perceived" is the operative word. If our SGD 199 tier replaces a SGD 1,732/mo status-quo cost, the raw dollar math is trivially in our favour. But perceived value is what drives the buy; a SGD 199 monthly bill *feels* larger to a founder than 8 hours a week of unquantified pain. The tier's `psychological_anchor` is the translation layer — it makes the perceived value legible.

A tier passes the NBA test when:

- Our price is ≤ 30% of the fully-loaded best-alternative cost (a conservative threshold; most buyers need a 3× ROI story to switch from status quo).
- Our `psychological_anchor` maps the price into a unit the buyer already budgets for ("kopi-a-day", "half of Confluence", "one afternoon per audit cycle").
- Our pitch includes a concrete status-quo-cost number the buyer can check against their own timesheet.

**Worked example — NBA math for the "Agency" tier (Mid-Market Ops Lead persona)**

```
Persona: Mid-Market Ops Lead
Status-quo cost:
  - Ops lead spends 10 hr/week on documentation fragmentation across Slack / Google Drive / Confluence
  - Fully-loaded ops lead at SG SGD 8,000/mo ÷ 160 hr/mo = SGD 50/hr
  - 10 hr/week × 50 × 4.33 = SGD 2,165/mo opportunity cost
  - Plus: 1 audit per year pulls 40 additional hours ≈ SGD 2,000/yr = SGD 167/mo amortised
  - Total status-quo cost: SGD 2,332/mo

Best-alternative cost (Confluence + Notion hybrid, observed in 3 of 5 similar SMEs):
  - Confluence Standard: USD 5.75/user/mo × 25 users × 1.35 FX = SGD 194/mo
  - Notion Plus for client-facing docs: SGD 12/seat × 10 external guests = SGD 120/mo
  - SSO add-on (Atlassian Access): USD 3/user/mo × 25 × 1.35 = SGD 101/mo
  - Total: SGD 415/mo
  - Plus switching-cost amortisation: 20 hr migration × SGD 50 = SGD 1,000 one-time, amortised over 24 months = SGD 42/mo
  - Total best-alternative cost: SGD 457/mo

Our price: SGD 199/mo (Agency tier)
Our effective price after PSG: SGD 99.50/mo

Ratios:
  - Our price as % of best-alternative: 199 / 457 = 43% (passes the <30% bar only after PSG: 99.50 / 457 = 22%)
  - Our price as % of status-quo: 199 / 2,332 = 8.5% (easily passes)
  - Perceived value: "Half the price of Confluence + Notion combined, PSG-eligible, SG data residency included, one integration deploy not two."

Verdict: tier passes NBA at list price against status-quo; passes against best-alternative only with PSG included. PSG-eligible story is load-bearing for the mid-market sale — build that into the pitch, don't hide it.
```

Keep the NBA math in the working log, not in `pricing-strategy.json`. The JSON stores the output (`wtp_band_sgd`, `nba`, `psychological_anchor`); the log stores the arithmetic. A reviewer or re-runner can check the math without it cluttering the data file.

## Grant-stacking (SG-specific)

Three Singapore grants show up in almost every SG SaaS pricing conversation. Know the rules; they move `effective_price_after_psg` by up to 70%.

### 6.1 PSG — Productivity Solutions Grant

- **Coverage:** up to 50% of the qualifying cost.
- **Cap:** SGD 30,000 per year per company (was SGD 3,000 historically; check `market-intelligence.json > policies[]` for the current figure — IMDA revises this).
- **What qualifies:** IMDA pre-approved solutions only. If the product is not on the PSG list, PSG cannot be claimed.
- **Eligibility checklist (buyer side):**
  - SG-registered business (ACRA).
  - ≥ 30% local shareholding.
  - Revenue ≤ SGD 100M OR ≤ 200 employees.
  - Purchase must be for business use, not resale.
  - Can demonstrate no prior funding from the same PSG package.
- **Eligibility checklist (vendor side):**
  - Listed as PSG pre-approved solution for the specific solution category.
  - Submits pricing and deliverable scope to IMDA for listing; takes 2–4 months.
  - Must carry the PSG badge and reference the IMDA listing page on the pricing page.
- **Effective price math:** `price_sgd × 0.5`, capped at `(price_sgd − (SGD_cap / 12))` per month. For a SGD 199/mo tier with a SGD 30,000 annual cap: 50% of 199 × 12 = SGD 1,194 in grant vs. SGD 30,000 cap, so the 50% rule binds. Monthly `effective_price_after_psg = 99.50`.

### 6.2 EDG — Enterprise Development Grant

- **Coverage:** up to 70% of qualifying project costs (SMEs; Non-SMEs get up to 50%).
- **Cap:** no fixed cap; scoped per project. Typical SME projects range SGD 50,000–500,000.
- **What qualifies:** strategic capability projects in three pillars: core capabilities (incl. business strategy, HR, finance), innovation & productivity (digitalisation, automation), or market access. SaaS subscriptions rarely qualify on their own; the qualifying version is typically a bundled *project* — implementation, consultancy, training, plus the subscription as a deliverable inside the project.
- **Eligibility checklist:**
  - Registered in Singapore.
  - ≥ 30% local shareholding.
  - Viable business with financial capacity to begin and complete the project.
  - Project delivers measurable outcomes (revenue uplift, cost savings, headcount capability).
  - Application submitted via Business Grants Portal (BGP) before project start.
- **Effective price math:** applied to the full project cost, not per-month subscription. If the engagement is SGD 80,000 (incl. 12 months of the Studio tier at SGD 7,188 + SGD 72,812 in implementation + training), EDG at 70% covers SGD 56,000 → buyer pays SGD 24,000 effective. Don't compute an `effective_price_after_psg` for EDG inside the monthly tier schema; record EDG in the `grants[]` array and call it out in the sales motion for the Studio tier only.

### 6.3 SFEC — SkillsFuture Enterprise Credit

- **Coverage:** SGD 10,000 one-time credit per eligible enterprise, co-funding up to 90% of out-of-pocket costs for approved training and transformation programmes.
- **Cap:** SGD 10,000 per enterprise lifetime (as of 2026). Check current policy.
- **What qualifies:** training programmes and transformation consultancy — SaaS subscriptions rarely qualify, but SaaS-plus-training packages can.
- **Eligibility checklist:**
  - Contributed ≥ SGD 750 in Skills Development Levy (SDL) over the qualifying period.
  - Has ≥ 3 SG local employees.
  - Has not claimed SFEC against another qualifying expense that exhausts the credit.
- **Effective price math:** applied against a bundled training package. Agent 3 rarely computes an SFEC-adjusted tier price; instead, flag it as an optional funding mechanism for the stretch tier when training is part of the engagement. Record SFEC in the `grants[]` array with `applies_to_tiers: []` if not directly applicable to monthly subscriptions; use it in the pitch, not the tier price.

### 6.4 Showing `effective_price_after_psg` in each tier

The rule is simple: if a tier qualifies for PSG, compute `effective_price_after_psg`; if it doesn't, set the value equal to `price_sgd`. At least one tier must have `effective_price_after_psg < price_sgd` (deliverable checklist).

Worked again with the three-tier ladder above:

- **Boutique (SGD 79/mo):** suppose the PSG package requires a 12-month subscription commitment and Boutique is offered monthly only. PSG doesn't apply. `effective_price_after_psg = 79`.
- **Agency (SGD 199/mo, 12-month commit available):** PSG applies. 50% × 199 = SGD 99.50. `effective_price_after_psg = 99.50`.
- **Studio (SGD 599/mo, 12-month commit standard):** PSG applies. 50% × 599 = SGD 299.50. `effective_price_after_psg = 299.50`. EDG may also apply when bundled as a project — note in the sales motion but don't double-count in the tier schema.

In the `grants[]` array:

```
grants:
  - name: "PSG"
    coverage_pct: 50
    cap_sgd: 30000
    eligibility: "SG-registered, ≥30% local shareholding, ≤SGD 100M revenue or ≤200 staff, subscription ≥12 months on PSG pre-approved listing."
    applies_to_tiers: ["Agency", "Studio"]
  - name: "EDG"
    coverage_pct: 70
    cap_sgd: null
    eligibility: "SG-registered, ≥30% local shareholding, applied via BGP before project start, bundled with implementation + training deliverables."
    applies_to_tiers: ["Studio"]
  - name: "SFEC"
    coverage_pct: 90
    cap_sgd: 10000
    eligibility: "SG enterprise with ≥SGD 750 SDL paid, ≥3 SG local employees; bundled with approved training programme."
    applies_to_tiers: []
```

`SFEC.applies_to_tiers: []` is correct when SFEC cannot be claimed against the monthly subscription alone. Don't invent a tier to hold the grant; record it honestly and use it in the sales narrative.

## Pitfalls

Three named failure modes to self-audit for before handing off.

### 7.1 Copying competitor pricing

**Symptom:** the tier ladder reads like a Notion-minus-10% or Confluence-minus-5%. Every `price_sgd` is suspiciously close to a competitor's tier.

**Cause:** the agent anchored on `competitors.json > sg_monthly_sgd` as the reference point, because it's the most concrete number in the inputs. Concrete beats abstract in a tired mind, but "concrete and wrong" is worse than "abstract and right."

**Fix:** anchor on NBA — the buyer's status quo plus their best alternative — not on competitors. Competitor pricing informs the *lower bound* of what the buyer will perceive as "reasonable for this category." It does not set the price. If the buyer's status quo costs SGD 2,000/mo and the best alternative costs SGD 400/mo, your tier can price anywhere from SGD 100 (aggressive wedge) to SGD 600 (slightly above best alternative, justified by specific advantages). The right number is inside that band, driven by WTP and grant math — not by whatever Notion happens to charge.

Concrete test: open `pricing-strategy.json`, cover the `price_sgd` column with a hand, and ask — if I didn't know what Notion charges, would I still set these prices? If the answer is "honestly no," you've anchored wrong. Redo the NBA math and justify every tier to its persona's substitute set, not to a competitor.

### 7.2 Tier-by-features

**Symptom:** tiers are built around what the team has already built. "Starter has the things we launched first; Pro has the things we launched in Q2; Enterprise has the things we're planning." Each tier's `target_persona` is vague ("SMBs", "growing teams"), or the same persona shows up under multiple tiers.

**Cause:** the agent reasoned bottom-up from the feature list instead of top-down from personas. Feature-led tiering is a product-engineering default because it mirrors how the code is organised. It's also how you produce a pricing page that doesn't convert.

**Fix:** **name the target persona per tier FIRST, then assemble features.** This is the rule. Pick the persona; ask what they need to get the outcome; assemble those features into `what_in[]`; assemble what the *next* persona needs (and this one doesn't) into `what_excluded[]`. The tier falls out of the persona, not the other way around.

Concrete test: read each tier's `target_persona`, then read its `what_in[]`. Every item in `what_in[]` should earn its place because the target persona explicitly needs it. If an item is there because "we built it so we might as well include it," cut it or move it to the tier where a persona actually needs it.

### 7.3 Ignoring grants

**Symptom:** tiers quote pure list prices. `effective_price_after_psg` is either missing or set equal to `price_sgd` across every tier. The sales motion has no grant story.

**Cause:** the agent treats grants as a finance-team afterthought, separate from pricing. In SG SME sales, this costs deals — the buyer's finance lead is often the one pushing for PSG eligibility as a condition of purchase.

**Fix:** always model `effective_price_after_psg` for at least one tier. Ideally for every tier that qualifies. The tier's `psychological_anchor` should reference the grant-adjusted price when it's the honest figure ("PSG-eligible — net SGD 99/mo"). Include a `grants[]` array populated with at least PSG (always) and EDG and SFEC (if relevant). Bake the grant check into the sales motion: the founder's first call with a qualified buyer should include "have you claimed PSG yet?" as a default question.

Concrete test: open `pricing-strategy.json`, find every tier where PSG applies, and confirm `effective_price_after_psg` is strictly less than `price_sgd`. If any tier qualifies but the effective price is identical to the list, the math or the field is wrong.

## Handoff to Agent 4 (Whitespace)

Your tiers feed the whitespace attack plans' `gtm.pricing` field. Agent 4 reads `recommended_tiers[]` and picks the tier that maps best to each whitespace niche, then writes a 1–2 sentence `gtm.pricing` string that tells the attack plan's reader which tier they'd sell into the niche.

Minimum handoff contents:

- **Tier summary table.** Three (or four) lines, one per tier: name, price, target persona, effective price after PSG. So Agent 4 can pick at a glance.
- **Persona-to-tier map.** One line per persona naming which tier they buy. If a persona spans two tiers (e.g. Boutique Agency Owner starts on Boutique and graduates to Agency), say so.
- **Grant coverage list.** Which tiers are PSG-eligible, which are EDG-bundleable, which don't qualify. Agent 4's niche-specific GTM may lean on a specific grant.
- **Elasticity band per segment.** Copied from Pillar C. Agent 4's attack plans for high-elasticity niches will price lower; for low-elasticity niches may price higher.
- **One-paragraph pricing thesis.** The headline story of the pricing strategy, in under 100 words. "We anchor on NBA (ops-lead opportunity cost for mid-market; audit-prep cycle cost for regulated), price the core tier at ~8% of status-quo cost, and stack PSG to bring the mid-tier to SGD 99/mo — which beats every SG-local competitor on headline, and beats global incumbents on total-cost-of-ownership once data residency is counted." Agent 4 quotes or paraphrases this into each attack plan.

Deliver the handoff via a commit message on `pricing-strategy.json`, a section in the project README, or — if the project runs a live handoff session — a verbal walkthrough. The medium doesn't matter; the content does.

## Deliverable checklist

Self-audit against this list before declaring Agent 3 done. Every box must be checked.

- [ ] `pricing-strategy.json` populated with all four pillars: `personas[]`, `pricing_models[]`, `elasticity_heuristics[]`, `recommended_tiers[]`. `grants[]` also populated.
- [ ] 3–5 personas defined, each with `name`, `icp`, `pains[]` (3–5), `current_workaround`, `wtp_band_sgd{low_anchor, expected, upper_stretch}`, and `nba`.
- [ ] **Every persona has an explicit NBA with a numeric S$ cost.** No "do nothing"; no bare adjectives.
- [ ] Every persona's `icp` sentence names a concrete enough profile that a stranger can name at least one real company that fits.
- [ ] `pricing_models[]` scored 1–5 per persona across at least three models; top model's `rationale` and runner-up documented.
- [ ] Top model maps to the highest-value persona × highest-score intersection per the rule in Pillar B.
- [ ] `elasticity_heuristics[]` has one entry per persona (or broader segment); default is medium; any `low` or `high` is backed by `evidence` citing past cohorts, competitor experiments, community threads, or structured interviews.
- [ ] No `low` elasticity claim for an SG SME segment without at least one of: regulated-sector lock-in, data-embedded switching cost, or self-paying ROI.
- [ ] 3 tiers (or 4 if justified) in `recommended_tiers[]`. Two-tier or five-plus tier ladders require a written justification in the working log.
- [ ] Each tier has exactly one `target_persona`. No tier serves multiple personas.
- [ ] **No tier's `what_in` duplicates another's.** Every item in a later tier is additive, not restated.
- [ ] `what_excluded[]` on each tier points to the next tier up, not an arbitrary tier.
- [ ] `psychological_anchor` present on every tier, unique per tier, mapped to the target persona's mental model.
- [ ] **≥ 1 tier has `effective_price_after_psg` different from `price_sgd`.** PSG math shown; buyer-side eligibility checklist referenced.
- [ ] `grants[]` populated with at minimum PSG; EDG and SFEC included if applicable (even with `applies_to_tiers: []`).
- [ ] `meta.sample_data` flipped to `false` if this is real project data.
- [ ] Handoff note prepared for Agent 4 (tier summary, persona-to-tier map, grant coverage, elasticity bands, one-paragraph thesis).
- [ ] Working log contains NBA arithmetic per persona (status-quo cost, best-alternative cost, ratios) and elasticity evidence notes — not in the JSON, but available for re-run and review.
- [ ] All enum fields (`elasticity_band`) match `FIELD-DICTIONARY.md` §8 exactly — spelling, case, punctuation.

If any item fails, fix it before handing off. Agent 4 reads `pricing-strategy.json` and treats `recommended_tiers[]` as ground truth for GTM pricing language; a half-finished pricing file poisons every attack plan's pitch.
