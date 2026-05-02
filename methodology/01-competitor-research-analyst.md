# 01 — Competitor Research Analyst

## Role one-liner

Hunts 30–50 competitors weighted ≥ 60% SEA/SG, builds the database, curates Top-5.

## When to dispatch

Dispatch at project start, before any other analytics agent runs, because every downstream agent (market, pricing, whitespace, design, viz, report) reads `competitors.json` as its foundational substrate. Re-dispatch whenever the competitor universe shifts materially — a new market entrant with noticeable share-of-voice, a major pivot or product relaunch by a ranked competitor, or an acquisition that collapses two records into one or splits one record into two.

## Inputs the agent needs

- **Project brief** — target ICP (industry, company size, buyer persona), geography (primary market and expansion order), and service category (what the product *is*, in the buyer's words, not the founder's).
- **Web access** — live web, not just cached training data. Pricing, headcount, and funding change quarterly; stale data is worse than no data.
- **Existing `competitors.json`** if this is a re-run. Diff against it rather than rebuild, so you preserve stable IDs and the `top_five[]` rationales.
- **Brand tokens and project name** for the `meta` block, if this is the first run against a fresh clone of the template.
- **A human escalation channel** — a Slack handle, an email, or a live session. The coverage rubric in Section 5 has a hard stop that requires human judgment; the agent cannot paper over a thin universe alone.

## Research sources (prioritised)

Work top-down. Higher sources are more reliable for the fields they cover; lower sources fill gaps and cross-check.

- **Crunchbase** — funding round, stage, investors, last-round date. Anchor for whether a competitor is venture-scale, bootstrapped, or dormant. Treat "last funded" older than 36 months as a dormancy flag and double-check whether the company still operates. Crunchbase is strong on the US/EU/IN capital stack but patchy on SG-only bootstrapped players, so do not treat a Crunchbase miss as "not a real company" — cross-check ACRA.
- **LinkedIn company pages** — headcount band, HQ city, office count, employee trajectory (are they hiring or shrinking?). Headcount growth over the last 6 months is a better activity signal than a press release. If the SG headcount is 1 and the company claims to "serve Singapore," that mismatch is itself a finding — capture it in `weaknesses` with the specific LinkedIn URL.
- **G2 / Capterra with SEA filter** — user reviews, feature comparison grids, category placement, alternative lists. Use the SEA reviewer filter to weed out global-only feedback that misses local objections (billing in SGD, support in Bahasa, data residency). Read the 1-star and 3-star reviews before the 5-star reviews; dissatisfaction is more specific and more useful than praise.
- **Local VC portfolio pages: Sequoia India/Peak XV, Wavemaker Partners, Jungle Ventures, Antler, Openspace, East Ventures, Vertex SEA** — funded regional challengers who often do not show up on global indexes. Scan the portfolio pages directly; press releases miss half the list. Each fund tends to have a thesis cluster (Antler = pre-seed breadth, Jungle = SEA scale-ups, Wavemaker = B2B SaaS), so scanning by fund gives you category-adjacent names in one pass.
- **tech.in Asia / e27 / DealStreetAsia** — regional press coverage of launches, rounds, and pivots. Cross-reference dates against Crunchbase; SEA rounds sometimes land in regional press first and Crunchbase weeks later. Be alert to "rebranded from X" lines — the same product can have two records if you don't catch the rename, and you'll also miss cases where the Crunchbase entry is still under the old name.
- **IMDA PSG pre-approved vendor list** — SG localisation signal. If a competitor is on the PSG list they have done the compliance work, have an SG entity, and have proven their price fits inside the PSG cap. This is a structural advantage — capture it in `strengths` and factor it into `beatability`. The PSG list also bounds the SG price ceiling: if no one in the category is on PSG, your own PSG listing is a potential wedge worth noting for Agent 3 (Pricing).
- **RFQ/RFP repositories + founder communities** — GeBIZ (SG gov), GovInsider pieces, SaaS Boss, Indie Hackers SEA threads, r/singaporefi, r/singapore business threads, SG Tech subreddit, and private Slack/Discord groups for the vertical. This is the only path to hidden or "contact us" pricing. Quote the source when you use it and tag `pricing_flag: hidden_estimated`. GeBIZ historical tenders are particularly useful for big-SI pricing because the awarded amounts are public.
- **Ancillary: Wayback Machine, Google Maps for SG office photos, ACRA for entity status, company Glassdoor pages** — useful for sanity-checks, not primary sources. Wayback is how you tell whether a "new" feature actually shipped 18 months ago; Glassdoor is how you spot a 5-person "regional HQ" that's actually a sales desk.
- **Product Hunt + SEA maker communities (Build in SEA, 1337, Lenny's Workspace SG)** — useful for catching new entrants in the last 90 days that haven't hit Crunchbase or press yet. Skim the last six months of launches in the category.
- **Company blog + changelog** — read the latest 6 posts and the last 10 changelog entries. If the last changelog is 9 months old, the product is probably coasting; note it in `weaknesses` with the date.

Order matters. Start with Crunchbase + LinkedIn to build the skeleton, then layer G2 / VC portfolio / regional press for depth, then hunt the long tail of hidden pricing in RFQs and communities. Skipping the VC portfolios is the single most common reason a SEA competitor database ends up Global-heavy.

### 4.1 Source-to-field mapping

Which source fills which field, roughly. When two sources disagree, the leftmost column wins.

| Field | Primary source | Secondary | Fallback |
|---|---|---|---|
| `name`, `url` | Company website | LinkedIn company page | Crunchbase |
| `hq`, `hq_region` | LinkedIn | Crunchbase | ACRA / SSM / OSS |
| `countries_covered` | Homepage logos + case studies | G2 reviewer geography | LinkedIn jobs-by-country |
| `target_market` | Case studies + G2 reviewer profiles | Homepage | Blog segmentation |
| `sg_monthly_sgd` | Pricing page (SGD or converted USD) | RFQ repository | Community post / founder DM |
| `pricing_range_published` | Pricing page | Sales deck leaked on Slideshare | Founder community thread |
| `features` | Pricing page feature matrix | Product docs | Changelog |
| `strengths` / `weaknesses` | G2 reviews (1, 3, 5 star mix) | Trustpilot SG | Reddit + Discord |
| `market_share_estimate_pct` | Published market report | Funding disclosure + seat count | Triangulation (see 7.3) |
| `category`, `pricing_flag`, `threat_level`, `beatability` | Your judgment, per rubric | — | — |

The right column exists for when the left is missing, not to cross-check the left. If the pricing page says SGD 12/mo and a Reddit post says SGD 15/mo, the pricing page wins — the Reddit post is probably old.

## Coverage rubric

These targets are non-negotiable. Hitting them is the definition of "Agent 1 is done."

- **≥ 30 competitors total.** Below 30, downstream whitespace and pricing analysis lacks the variance needed to find gaps. 50 is a soft upper bound; more than 50 without deduping is usually noise.
- **≥ 60% HQ or primary-market in SEA/SG.** The template exists to produce SEA-relevant intel. A Global-heavy database produces Global-flavoured recommendations that miss the actual market. Weighting, descending: `SGP > MYS > IDN > THA > VNM > PHL`. A competitor HQ'd in KL serving ID is a MYS record for this purpose; a competitor HQ'd in SFO serving SG is a Global record, not an SEA record, even if they have revenue here.
- **≥ 3 DIY alternatives.** The buyer's real options include in-house hire, ChatGPT-plus-spreadsheet, and big-SI contract (Accenture, Deloitte, PwC SEA, NCS, NTT Data). Omitting these makes the category look more differentiated than it is.
- **STOP and escalate if you can't hit the rubric with real competitors.** Do not pad with fake entries, shell companies, or defunct startups. If the agent returns fewer than 30 real records, the honest answer is "the category is thin; here are the 18 real players and here is what that implies about TAM." That escalation is useful; faked rows corrupt every downstream agent.

### Weighting in practice

Treat weighting as a soft prior on how many records per country to seek, not a hard quota. A reasonable distribution for an SG-primary project aiming at 35 records:

- SGP: 14 records (40%)
- MYS: 6 records (17%)
- IDN: 3 records (9%)
- THA / VNM / PHL combined: 3 records (9%)
- Regional (multi-SEA, no single HQ): 2 records (6%)
- Global / APAC-broad: 7 records (20%)

That sums to ~60% SEA + ~20% regional on top. The Global 20% is where you list the Notions, HubSpots, and Salesforces that the buyer has heard of even if they don't buy them. If you find yourself with 25 Global and 10 SGP, you have not done the work — rerun the VC portfolio pass.

## Working cadence

A reasonable sequencing for a first-run project aiming at 35 records:

1. **Hour 1 — skeleton pass.** Crunchbase + LinkedIn sweep. Produce a list of 50+ candidate names with just `name`, `url`, `hq`, `hq_region`, and a provisional `category`. Over-collect; you will prune.
2. **Hour 2 — SEA weighting pass.** Walk the VC portfolios (Peak XV, Wavemaker, Jungle, Antler, Openspace, East Ventures, Vertex SEA), Product Hunt SEA, and tech.in Asia / e27 / DealStreetAsia. Add the missing SEA records until you clear the 60% bar with margin.
3. **Hour 3 — category balance pass.** Confirm `category` distribution: you should have at least one record each in `global_incumbent`, `sg_local`, `regional_challenger`, `diy_alternative`, `adjacent`, `big_si`. If any bucket is empty, that's a blind spot; backfill before moving on.
4. **Hour 4 — pricing pass.** Visit every pricing page. Where hidden, search GeBIZ, SaaS Boss, and founder communities for quotes. Set `sg_monthly_sgd`, `pricing_range_published`, `pricing_flag`. This is the slowest pass; budget accordingly.
5. **Hour 5 — depth pass on Top-15.** For the 15 that look highest-threat, read 5+ G2 reviews each, the pricing page feature matrix, the last 6 blog posts, and the last 10 changelog entries. This populates `features`, `strengths`, `weaknesses`, and updates your threat / beatability prior.
6. **Hour 6 — rubric + curation pass.** Score `threat_level` and `beatability` for every record. Compute rank scores. Curate Top-5 with rationales. Final pass against the deliverable checklist.

If you are tempted to shortcut the SEA weighting pass because the skeleton already looks "mostly done," resist. That shortcut is the mechanical cause of pitfall #9.1 (Global bias).

## De-duplication and ID stability

Two distinct problems that look similar and have different fixes.

### 5.1 De-duplication

Two records that refer to the same company must collapse to one. Triggers:

- **Parent and subsidiary.** Record the operating entity that the SG buyer actually contracts with. If Atlassian sells Confluence in SG through Atlassian Pte Ltd, the record is `confluence`, not `atlassian`, with HQ in Sydney (Atlassian's operational HQ) and a note that the SG entity is the contracting party.
- **Rebrand.** "OldName" becomes "NewName." Collapse into one record using the current name; keep a research note of the former name so Crunchbase cross-refs still work.
- **Product line vs. company.** Microsoft sells many products; each relevant product is one record (e.g. `microsoft_365_copilot` is separate from `microsoft_teams`). Do not collapse products that are bought separately into one parent record.

### 5.2 ID stability

An `id` is a foreign key. Once `whitespace-framework.json` references `competitors[].id = "notion"`, you cannot change it to `"notion_inc"` without breaking the whitespace file. Rules:

- Pick the ID on first insert, lowercase-with-underscores, short. `notion`, not `notion_labs_inc`.
- Never rename an existing ID. If a rename seems necessary (e.g. two companies merged and the old ID is misleading), route through Agent 7 (Methodology Curator) — the rename must cascade through every file that references the ID.
- If two candidate names collapse to the same slug (e.g. `notion` the note tool and `notion` the HR product), disambiguate with a short suffix: `notion`, `notion_hr`.

## Per-competitor field collection checklist

Refer to `FIELD-DICTIONARY.md` Section 3 for canonical types, required flags, and allowed values. The guidance below is *where* to find each value, not what shape to store it in.

- **`id`** — lowercase-with-underscores slug of the name. `"Notion"` → `notion`, `"ChatGPT + Spreadsheet"` → `chatgpt_spreadsheet`. Keep it stable across re-runs; never change an ID once downstream files reference it.
- **`name`** — company display name. Strip trailing "Inc." / "Pte Ltd" / "Sdn Bhd" unless the suffix is how the market refers to them.
- **`url`** — homepage URL. Prefer the country-specific site if it exists (`.sg`, `/en-sg/`). Visit the URL; dead sites disqualify the record.
- **`category`** — one of the Section 8 enums. `global_incumbent` for the Notions and HubSpots; `sg_local` for homegrown SG startups; `regional_challenger` for SEA-wide players; `diy_alternative` for non-vendor options; `adjacent` for tools used as a workaround; `big_si` for consultancies offering the same outcome as a project.
- **`hq`** — "City, Country" format. LinkedIn company page → About → Headquarters. Cross-check Crunchbase; if they disagree, LinkedIn wins for current, Crunchbase wins for original.
- **`hq_region`** — `SEA | APAC | Global | Other`. SEA = the six countries in the weighting list plus Brunei, Cambodia, Laos, Myanmar. APAC = rest of Asia-Pacific (IN, JP, KR, AU, NZ, CN, TW, HK). Global = US/EU/UK majority footprint. Other = MEA, LATAM.
- **`target_market`** — the segments they *actually* serve, not aspirationally target. Look at case studies, logos on the homepage, and G2 reviewer profiles. "SMB manufacturing in SG" beats "any business anywhere."
- **`countries_covered`** — countries where they have at least one paying customer you can verify. Logos + case studies + LinkedIn jobs in-country are acceptable evidence. "Available globally" is not evidence of customers.
- **`sg_monthly_sgd`** — monthly price in SGD for the SG buyer. Public price page → convert if USD. If hidden, triangulate from RFQs and community posts and set `pricing_flag: hidden_estimated`. If they don't sell into SG, use `null`.
- **`pricing_range_published`** — human-readable range as you found it ("From USD 15/seat/mo", "Contact sales", "SGD 300–1,200/mo per tier"). Preserve source wording; this is the field a reader will cross-check.
- **`pricing_flag`** — see Section 7.4 below.
- **`primary_value_prop`** — ≤ 120 chars, paraphrased. Describe what the *buyer gets*, not what the vendor says they do. "Shared docs that replace your wiki" beats "The connected workspace for modern teams."
- **`features`** — 4–8 short phrases. Pull from the pricing page feature matrix, not the homepage. The pricing page lists what they actually sell; the homepage lists what they wish they sold.
- **`strengths`** — evidence-anchored. Each entry should be traceable to a feature, a pricing move, a PSG listing, a funding round, or a recurring review theme. See pitfall #3 below.
- **`weaknesses`** — same standard. "No SG data residency (AWS us-east-1 only per their docs)" beats "weak on compliance."
- **`threat_level`** — integer 1-5 per rubric in Section 7.1.
- **`beatability`** — integer 1-5 per rubric in Section 7.2.
- **`market_share_estimate_pct`** — `null` by default. See Section 7.3.
- **`research_date`** — the date you populated this record. Per-record, not file-level. A competitor you touched last month and didn't refresh today keeps its older date.
- **`website_design_rating`** — `null` at this stage. Agent 5 populates it from the 5-dimension rubric in `05-website-design.md`. Your job is to surface the URL, screenshot, and `website_screenshot_path`; Agent 5 scores.
- **`website_design_notes`** — same delegation. Leave empty string if you haven't observed anything; Agent 5 fills it.
- **`website_screenshot_path`** — relative path inside the repo where the screenshot will live once Agent 5 captures it. Reserve the path (`template/assets/screenshots/<id>.png`) even if the file isn't there yet, so Agent 5 has a target.
- **`implications[]`** — optional. Use only when a single competitor fact has narrow, agent-specific consequences a downstream agent must act on. Each entry is `{ headline, body, agent_targets[] }` per `FIELD-DICTIONARY.md` §5.1.2. Examples worth recording: *"Pico's 350-staff in-house broadcast crew → agent_4 must score them 5/5 on hybrid_capability"*; *"Visionnaire is the only ISO 20121 + EcoVadis Gold holder → agent_3 must defend a price 30–40% below Visionnaire's premium tier"*. **Do not** mass-populate; one or two competitors with a structurally interesting fact suffice. Generic implications belong in `weaknesses` or `strengths`, not here.

### 6.1 Reading from Agent 0 (brand-assets.json) before you start

If `/template/data/brand-assets.json` exists, Agent 0 already ran. Read it before you start screenshotting. Two practical effects:

- **Don't capture the client's own photos as competitor evidence.** Agent 0's `imagery[]` lists every photo lifted from the client's reference deck. If a competitor's homepage carousels look suspiciously like one of those photos, the competitor is likely re-using shared event-industry stock — flag it in `weaknesses`, do not save the screenshot.
- **`brand-assets.json → palette` is the client's own colour identity.** When you note "competitor X uses orange/charcoal" in your `weaknesses` or `strengths`, that is only relevant if it overlaps with the *client's* palette (a brand-collision risk). Agent 0's palette tells you which collisions matter.

If Agent 0 has not run (no `brand-assets.json`), proceed normally — this is an information advantage when present, not a gate.

## Scoring rubrics (0–5 scale each)

These rubrics are canonical. Every other agent assumes these definitions; do not redefine them locally.

### 7.1 `threat_level` (1–5)

`threat_level` measures how directly a competitor threatens *your ICP and positioning*, not how big the competitor is in absolute terms. A global giant serving a different ICP is a lower threat than a tiny local that is already winning your buyers.

- **1 = Irrelevant** — different category, different ICP, no realistic overlap. Keep in the database only for completeness.
- **2 = Adjacent** — different primary ICP but some edge overlap, or a different category that the buyer uses as a workaround.
- **3 = Competes on one axis** — shares one dimension (price, feature set, or channel) with you but differs on the others.
- **4 = Direct competitor at a different scale** — same ICP and same category, but meaningfully larger or smaller in resources, which changes how you compete with them.
- **5 = Direct head-to-head, already winning your ICP** — same buyer, same category, same price band, and they already have the logos you want. Treat every entry here as a must-beat.

**Worked examples (assume we are a Singapore SME note-taking product):**

1. **Notion for SG SME note-taking: threat 5.** Same ICP (SG SMEs, 10–200 headcount), same category (shared workspace / docs), overlapping price band at the SG Plus tier (SGD 12/seat/mo ≈ what we charge), and they already have thousands of SG SME seats per G2 and LinkedIn evidence. They are who our buyer defaults to when they haven't heard of us yet. Threat 5 because they are already winning our ICP.
2. **Confluence for SG SME note-taking: threat 3.** Same category, but primarily serves the SG enterprise and regulated-sector buyer (banks, gov agencies). SMEs find it heavy and expensive. It competes with us on the "structured docs" axis but not on price or onboarding time. Threat 3 because it's a real competitor on one axis and a different ICP on the others.
3. **Airtable for SG SME note-taking: threat 2.** Sold as a database / lightweight app builder, not primarily a note tool. Some SG SMEs use it as a project tracker that incidentally stores notes. Adjacent overlap, not direct. Threat 2 because the buyer who wants notes rarely lands on Airtable first.

**Common scoring mistakes:**

- Scoring every well-known vendor at 5 because they're "big." Big is not the axis; ICP overlap is the axis. IBM is a huge company and a threat level 1 to most SG SME plays.
- Scoring every SEA-local at 5 because they're "close." Same mistake, inverted. Local SG presence does not make a competitor threat 5 if their ICP is different (e.g. an SG-local clinic management tool is threat 1 to a note-taking product).
- Refusing to assign any 5s because "it feels harsh." A category without a threat 5 either (a) has no real incumbent — which is itself a finding — or (b) was mis-scored. Re-read your `target_market` fields; if a competitor truly owns your ICP, score 5.

### 7.2 `beatability` (1–5)

`beatability` measures how hard it is for *you* to beat this competitor in the next 12 months. High numbers mean structural advantage you can exploit; low numbers mean they have something you cannot replicate in a year.

- **1 = Structurally untouchable** — they have a moat (network effect, regulatory monopoly, 10-year R&D lead) you cannot dent in 12 months.
- **2 = Harder than even** — they win on 2+ structural axes. You need execution plus a bet.
- **3 = Comparable, wins via execution** — roughly even structurally. Whoever ships, sells, and supports better wins the quarter.
- **4 = Slight structural advantage** — you have one clear structural edge (local presence, PSG listing, a differentiated feature) that compounds over 12 months.
- **5 = Clear 12-month structural advantage** — you have a genuine, exploitable structural advantage: PSG listing, SG data residency, founder-led support in Mandarin/Bahasa, integration with SG-specific systems (PayNow, Peppol, IRAS), or a sector-specific compliance story (MAS TRM, PDPA Advanced).

**Worked examples (same SG SME note-taking context):**

1. **Notion: beatability 2.** Multi-billion valuation, 10-year engineering lead, massive template marketplace, global brand. We cannot beat them on product breadth. We might beat them on SG-local onboarding, PSG pricing, and human support in Singlish, but that's one edge against three. Beatability 2 because we need excellent execution plus a clear wedge.
2. **A well-funded regional challenger (e.g. a KL-based docs startup with USD 8M raised): beatability 3.** Comparable scale. Whichever team ships faster and lands SG channels first wins. Beatability 3 because there's no structural moat on either side.
3. **A SG-local wiki tool that isn't on PSG and has 2 engineers: beatability 5.** We are bigger, we have PSG, we have founder-led support. If we choose to, we can compete them out of the market in 12 months. Beatability 5.

**Calibrating beatability in practice:**

Beatability is a 12-month horizon, not an all-time horizon. "Could we eventually win?" is almost always yes and almost always useless. The useful question is: "given our team, capital, and channels today, can we take measurable share from this competitor in the next four quarters?"

Structural advantages that legitimately score 4–5:

- **PSG pre-approval** in a category where the competitor is not listed. The 50% grant is a 2× price advantage for an SG buyer; that's structural, not executional.
- **SG data residency** in a category where the buyer is regulated (MAS, IMDA, PDPA-sensitive). A US-east-1 competitor can't fix this in 12 months.
- **Founder-led support in Mandarin/Bahasa/Tagalog** when the buyer segment prefers to escalate in their own language. Competitor would need to hire and train; 12 months barely enough.
- **Integration with SG-specific rails** (PayNow, Peppol, IRAS e-invoicing, SGFinDex). Competitor engineering roadmaps aren't built around these; you can lead.
- **Sector compliance posture** (MAS TRM, MOM, HSA medical device reg) — regulatory work has long lead times; existing posture is real moat.

Things that *feel* like advantages but score 3, not 4:

- "We're more Agile." Executional, not structural.
- "Our UX is better." Opinion, and closable in 12 months.
- "We care about customers more." Not a moat.
- "Founder is from Singapore." Only counts if it translates to a specific capability (language, network, channel).

### 7.3 `market_share_estimate_pct`

Market share is the field most often filled with fiction. The rule is strict: fill it *only* with a cited source or a ≥ 2-point triangulation. Otherwise leave it `null`. `null` is the correct, honest value in most cases; the project does not demand share numbers for every record.

- **Cited source** — a published market research report, a competitor's public filing, a press quote with a named analyst. Include the source URL in your research notes.
- **≥ 2-point triangulation** — at least two independent estimates that agree. Example: Crunchbase revenue estimate + G2 seat-count disclosure. A single estimate is a guess, not a triangulation.
- **Never guess** — if you cannot cite two points, leave `null`. Downstream agents treat `null` as "unknown"; they treat a number as a fact. Guessing here pollutes the pricing and whitespace agents.

**Worked triangulation example:**

> Notion SG share of the SG SME "on a note tool" subset.
>
> - ACRA: ~200,000 active SG SMEs as of 2025Q4.
> - G2 reviewer filter for SG + note-taking category: ~5% of responding SMEs report using any dedicated note tool (vs. email, paper, or shared drive). That yields ~10,000 SG SMEs on *any* note tool.
> - Notion share of that subset, per G2 reviewer SG cut: 28% of the note-tool responses name Notion. 28% × 10,000 = ~2,800 SG SME Notion seats.
> - Cross-check: Notion's publicly-disclosed APAC expansion and SG LinkedIn headcount (~12 SG staff) is consistent with a few thousand SG seats.
>
> Triangulated estimate: **~30% of the SG SME "on-a-note-tool" subset.** Store `market_share_estimate_pct: 30` and note in research that this is share *of the on-tool subset*, not of all SG SMEs. Record the two triangulation points in your working notes so the next re-run can refresh them.

If a triangulation requires a caveat ("share of the on-tool subset, not of all SG SMEs"), that caveat must live in `website_design_notes` or in research notes, not invisibly inside the number.

**Second worked triangulation (big-SI category):**

> Accenture SG share of the SG enterprise "digital transformation consulting" spend.
>
> - GeBIZ historical tenders: Accenture awarded SGD ~180M across SG gov tenders over the last 24 months (direct query).
> - IDC SG IT services report (2025): SG enterprise consulting spend ~SGD 2.1B / year.
> - Accenture share = 180M / 24 months × 12 = ~90M / year. 90M / 2100M = ~4% of the SG consulting spend.
> - Cross-check: Accenture SG LinkedIn headcount ~1,800, average billable rate SGD 280k/head implies ~SGD 500M revenue ceiling. 90M is 18% of that, consistent with consulting being a subset of their SG work.
>
> Triangulated estimate: **~4% of SG enterprise consulting spend**. Store `market_share_estimate_pct: 4` and note in research that this is share of *SG enterprise consulting spend*, not of the overall category we compete in. If we are an SME play, Accenture's 4% of enterprise is still a threat to watch but a different buyer than ours.

**When triangulation fails:**

You will often reach the end of a triangulation attempt with only one credible data point. The correct output is `null`, not a single-point guess. Examples:

- Only Crunchbase funding total is available, no seat count, no revenue disclosure → `null`.
- Only a press release from the vendor claiming "thousands of SG customers" → `null`. Vendor claims are not evidence.
- Only a Reddit thread estimating a price point → `null` for share (but can inform `pricing_range_published` with `hidden_estimated` flag).

A `null` on 20 of 35 records is normal and honest. A number on 35 of 35 records is a red flag that someone is guessing.

### 7.4 `pricing_flag`

Three canonical values, no others.

- **`public`** — pricing is visible on the competitor's own website, without a gate. A `/pricing` page with SGD or USD prices per tier is `public`.
- **`partial`** — a "starting from" price is visible but full tier-by-tier pricing is hidden behind a sales call. Common SaaS pattern. Use `partial` when you can anchor a price but not enumerate tiers.
- **`hidden_estimated`** — no price on the website. You triangulated from RFQ repositories, founder community posts, or a leaked proposal. Must be accompanied by at least one source note in your working log. If you cannot source the estimate, leave `sg_monthly_sgd: null` and `pricing_range_published: "Contact sales"` rather than invent a number.

## Top-5 curation rubric

The Top-5 is not a popularity ranking. It is the list of competitors the rest of the pack should pay most attention to — the threats that are both high-stakes and in play.

### 8.1 Ranking formula

**Rank by `threat_level × (6 − beatability)`.** This privileges threats that are both serious *and* exploitable. A competitor with threat 5 but beatability 1 (structurally untouchable) lands mid-pack; a competitor with threat 5 and beatability 4 (exploitable) tops the list.

**Worked example:**

- Competitor A: threat 5, beatability 2. Score: 5 × (6 − 2) = 5 × 4 = **20**.
- Competitor B: threat 5, beatability 4. Score: 5 × (6 − 4) = 5 × 2 = **10**.
- Competitor C: threat 4, beatability 5. Score: 4 × (6 − 5) = 4 × 1 = **4**.
- Competitor D: threat 3, beatability 5. Score: 3 × (6 − 5) = 3 × 1 = **3**.

Order: A (20), B (10), C (4), D (3). Counter-intuitively, the highly-beatable local (C, D) scores low because they're not existential threats; the high-threat / moderately-beatable incumbent (A) tops the list because it threatens the most and you still have a fighting chance. If you think the formula is ranking wrong for your project, that's a signal to re-check your `threat_level` and `beatability` scores, not to override the formula.

### 8.2 Tie-breakers

1. **Higher `market_share_estimate_pct`** (descending). When two competitors score identically on the formula, the one with more of the market is the bigger threat today.
2. **Alphabetical by `name`** — if both are `null` on share or tied, alphabetise. Deterministic ordering matters so that re-runs don't jiggle the Top-5 arbitrarily.

### 8.3 Rationales

Every `top_five[]` entry requires a 1–2 sentence `rationale` (≤ 200 chars per `FIELD-DICTIONARY.md` §4). The rationale must name the specific threat vector — not "strong competitor" or "market leader." Good:

> "Owns the SG SME mindshare for shared docs (28% of the on-tool subset) and has PSG eligibility we don't; whoever lands SG channel partners in Q3 wins."

Bad:

> "Strong competitor with large market share."

If two rationales in the Top-5 read the same, one of them is wrong. Each of the five must articulate a *different* threat vector: mindshare, price, distribution, feature, regulation. If the top five all say "strong brand," you have picked the wrong top five, not written them well.

### 8.4 Worked Top-5 construction

Given 30 records with scored `threat_level` and `beatability`, compute the formula for all, sort descending, and cut at 5. Example final-pass output:

| Rank | Competitor | Threat | Beatability | Score | Market share | Rationale (truncated for display) |
|---|---|---|---|---|---|---|
| 1 | Notion | 5 | 2 | 20 | 30% | Owns SG SME shared-docs mindshare; beatable only on SG-local wedges (PSG, residency, Singlish support). |
| 2 | Confluence | 4 | 3 | 12 | 18% | Default for SG regulated-sector buyers; structural weakness in SME pricing we can exploit via PSG. |
| 3 | Coda | 4 | 3 | 12 | null | Same category, similar price; tie-broken alphabetically below Confluence on null share. |
| 4 | ClickUp | 3 | 3 | 9 | 8% | All-in-one productivity pitch is a workaround substitute; threat concentrated on cross-functional SME buyers. |
| 5 | DIY: ChatGPT + Google Docs | 4 | 2 | 8 | null | Real buyer NBA; the "do nothing + improvise" option that kills 40% of SG SME deals per our win/loss interviews. |

Notes on the table:

- Confluence and Coda tie at score 12. Confluence has a triangulated 18% share; Coda is `null`. Confluence wins the tie on share (descending). If both were `null`, alphabetical: Coda before Confluence.
- ClickUp at rank 4 beat two regional challengers with higher raw threat but lower beatability (threat 4, beatability 1 = score 20 also — but with beatability 1, we can't win, so the formula correctly ranks an exploitable mid-threat competitor higher than an unexploitable high-threat one).
- The DIY alternative made the list at rank 5. DIY alternatives often beat branded competitors into the Top-5 in SME markets because the NBA for most SG SMEs is "keep doing what we do." Missing DIY from the Top-5 is a common mistake; it's usually the single biggest NBA you compete with.
- No rationale exceeds 200 chars. No rationale uses the words "strong," "leading," or "market leader." Each names a specific vector (mindshare, regulated-sector, all-in-one pitch, NBA).

## Worked end-to-end example: one record

A fully-worked example of a single record, to show the texture the rest of the file should aim for.

**Scenario:** you are building `competitors.json` for a Singapore SME note-taking / shared-docs product. One of the candidate records is Notion.

**Step 1 — skeleton.** From Notion's site and LinkedIn:

```
id: notion
name: Notion
url: https://www.notion.so
hq: San Francisco, United States
hq_region: Global
```

**Step 2 — SEA relevance check.** Do they sell into SG? Yes: pricing page shows SGD option at checkout, and their SG LinkedIn page lists a dozen staff across sales / success. They're a Global record, not an SEA record (HQ is SF, primary market US/EU), but they have real SG revenue. That's why the Global 20% quota exists — they belong.

**Step 3 — pricing.** The pricing page is public:

```
sg_monthly_sgd: 12
pricing_range_published: "Free tier; Plus SGD 12/seat/mo; Business SGD 20/seat/mo; Enterprise contact sales"
pricing_flag: public
```

Note: when the pricing page shows four tiers, `sg_monthly_sgd` stores the SG-relevant mid-tier (Plus at SGD 12), with the full range in `pricing_range_published`. The single-number field isn't strictly "the price" — it's the price an SG SME buyer is most likely to pay, which downstream agents use for bar charts and elasticity analysis.

**Step 4 — value prop and features.** From the pricing page feature matrix and homepage, paraphrased:

```
primary_value_prop: "Shared workspace combining docs, wikis, and lightweight project tracking for teams under ~200."
features:
  - Nested docs and databases
  - Real-time collaborative editing
  - Templates marketplace
  - AI writing + Q&A (paid add-on)
  - Mobile + web + desktop apps
  - API and 100+ integrations
```

Note: no marketing adjectives ("beautiful," "powerful," "modern"). Each feature is a thing you can point to on the pricing page.

**Step 5 — strengths and weaknesses, evidence-anchored.**

```
strengths:
  - "Template marketplace with 10k+ community templates (per notion.so/templates, 2026-03)"
  - "Native AI features at SGD 10/seat/mo add-on — in-product, not bolted on"
  - "28% of SG SME note-tool respondents name Notion first (G2 SG filter, 2026-03)"

weaknesses:
  - "No SG data residency — docs hosted in AWS us-east-1 per trust page"
  - "Not on PSG pre-approved list as of 2026-03 — SG SME can't claim the 50% grant"
  - "Offline mode still limited vs. Apple Notes / Obsidian (recurring 1-star review theme on G2)"
```

Note: each entry traces to a specific artefact or URL or review pattern. A skeptical reader could verify in 60 seconds.

**Step 6 — rubric scores.**

- `threat_level: 5` — same ICP, same category, overlapping price, already winning our ICP. See Section 7.1 worked example.
- `beatability: 2` — 10-year product lead and global brand; beatable only on SG-local wedges (PSG, data residency, Singlish support). See Section 7.2 worked example.
- `market_share_estimate_pct: 30` — triangulated on the "on-a-note-tool SG SME subset." Not all SG SMEs. See Section 7.3 worked example.

Formula: 5 × (6 − 2) = 20. Highest score in the set; lands at Top-5 rank 1.

**Step 7 — rationale for Top-5.**

```
rationale: "Owns SG SME shared-docs mindshare (~30% of on-tool subset); beatable only on SG-local wedges (PSG, residency, founder support in Singlish)."
```

198 chars, under the 200-char cap. Names specific threat vectors (mindshare) and specific exploitable gaps (PSG, residency, language). Not "strong competitor."

**Step 8 — delegation to Agent 5.**

```
website_design_rating: null
website_design_notes: ""
website_screenshot_path: "template/assets/screenshots/notion.png"
```

The path is reserved. Agent 5 will capture the screenshot and score the five dimensions later.

**Step 9 — `research_date`.** Today's date. If you re-run in six months, only the records you re-touched get the new date; the rest keep their older date so staleness is visible.

This whole record takes ~15 minutes of focused research when the sources are responsive. Thirty records at that rate is a one-day job; the half-day comes from the pricing pass (Hour 4 above) where "contact sales" walls make every record a separate hunt.

## Common pitfalls

Three named failure modes to self-audit for before handing off.

### 9.1 Global bias

**Symptom:** you end up with 22 Global records and 13 SEA records, violating the 60% quota.

**Cause:** global vendors dominate press, reviews, and Crunchbase. They are easy to find; SEA challengers are not. The agent drifts toward the easy path.

**Fix:** before submitting, apply the 60% SEA quota as a gate. If you fall short, you have not done the VC portfolio pass properly — return to Sequoia/Peak XV, Wavemaker, Jungle, Antler, Openspace, East Ventures, and Vertex SEA portfolio pages and hunt by funded-in-SEA. Backfill until the quota is met. Do not trim Global to fake compliance; add SEA.

### 9.2 Marketing paraphrase theft

**Symptom:** `primary_value_prop` reads like vendor homepage copy. "The all-in-one workspace for modern teams." "AI-powered insights for every business."

**Cause:** copy-paste from the competitor's hero section. It sounds authoritative but it's marketing, not analysis. It also bloats the field past 120 chars and fails the dictionary constraint.

**Fix:** paraphrase in your own words, ≤ 120 chars, describe what the *buyer gets*. Rewrite until a skeptical buyer would nod. "Shared docs + wiki that replaces Confluence for teams under 200" is honest; "The connected workspace for modern teams" is marketing.

### 9.3 Vague qualitative fields

**Symptom:** `strengths` and `weaknesses` read as adjectives. "Good product." "Expensive." "Great UX." "Weak support."

**Cause:** the agent summarised an impression without anchoring to evidence. Adjectives are unfalsifiable; the next reader has no way to verify or argue.

**Fix:** anchor every entry in a concrete artefact — a feature list, a pricing tier, a G2 review theme, a PSG listing, a funding round, a specific integration or lack thereof. Good:

- Strength: "Native PayNow + Peppol integration (per their /integrations page, 2026-03)."
- Weakness: "No SG data residency — docs hosted in AWS us-east-1 per their trust page."

Bad:

- Strength: "Strong integrations."
- Weakness: "Weak on compliance."

Adjectives lose; evidence wins.

### 9.4 Price-anchor fixation

**Symptom:** every SG monthly price you capture is USD-converted at today's rate, producing prices like SGD 10.87. The buyer doesn't care about three decimal places.

**Cause:** the agent treated the pricing page as ground truth without looking for an SG-localised page.

**Fix:** check for an SG-localised pricing page first (many vendors publish in SGD for SG IP). If only USD exists, round to the nearest SGD 1 and add a note: "USD 8/mo converted at 1.35, 2026-04." Downstream pricing analysis breaks on false precision.

### 9.5 Dormant-startup inclusion

**Symptom:** a regional challenger you found on a VC portfolio page turns out to have no changelog in 18 months, no LinkedIn hiring, and a dead Twitter account. You included them anyway because the name was recognisable.

**Cause:** press and portfolio pages lag. A company can appear alive to Google for years after it has effectively shut down.

**Fix:** before including, check (a) last changelog or blog post, (b) LinkedIn headcount trajectory, (c) last funding date. Two of three stale → exclude, with a research note. If you include anyway because they still have live customers, flag in `weaknesses`: "Company appears dormant (no changelog since 2024-11, LinkedIn shrinking)."

### 9.6 Feature-list bloat

**Symptom:** `features` has 18 entries for every record, and most are obvious table-stakes ("mobile app", "user login", "dark mode").

**Cause:** the agent copied the full pricing matrix without filtering.

**Fix:** 4–8 entries per record. Include only features that *differentiate* or that the buyer explicitly asks about. "SSO / SAML" on a SaaS record is worth including because some buyers demand it; "dark mode" is not. If a feature appears on every record in the set, cut it from every record — it's table stakes, not a differentiator.

## Re-run protocol

When Agent 1 is dispatched against an existing `competitors.json` rather than a blank slate, the work changes shape. You are not rebuilding; you are diffing.

### 10.1 Before touching anything

- Read the existing `competitors.json` end to end.
- Note the `meta.research_date` — is this refresh routine (quarterly) or triggered (new entrant, acquisition)?
- List every record whose `research_date` is older than 30 days. These are the refresh candidates.
- List every record whose `pricing_flag = hidden_estimated`. These are highest-value to re-check because hidden prices drift silently.

### 10.2 Change types and their consequences

- **New record added** → no cascade unless it pushes the set over 50 (prune) or under the 60% SEA bar (add more). Notify Agent 4 (Whitespace) because strategy canvas and heatmap may need a new column or row.
- **Record deleted** (company shut down / acquired into another) → cascade: every foreign-key reference in `whitespace-framework.json` (scores, heatmap competitors) must be removed. Route through Agent 7 if uncertain.
- **`threat_level` or `beatability` changed** → recompute the Top-5. If the Top-5 membership changes, rewrite rationales; do not leave a stale rationale attached to a new rank.
- **`sg_monthly_sgd` changed materially (>20%)** → notify Agent 3 (Pricing), because tier-pricing elasticity recommendations may shift.
- **`features` changed** → notify Agent 4 (Whitespace), because strategy canvas dimensions may need re-scoring for that record.
- **`category` changed** → rare but disruptive. A record moving from `regional_challenger` to `global_incumbent` changes the SEA-weighting calculation. Re-verify the 60% bar.

### 10.3 What to preserve

- `id` values. Never rename. See Section 5.2.
- Historical `research_date` on any record you did not re-check; do not backfill today's date across untouched records.
- Top-5 rationales, unless the rank or the threat vector changed. A rationale written six months ago may still be correct; don't rewrite for rewriting's sake.

### 10.4 What to surface in the handoff note

- Which records were re-checked and which were not.
- Which records were added or removed, and why.
- Which rubric scores moved materially and what caused the move.
- Which foreign-key references in downstream files need updating.

Agents 2–6 each have a short "what changed upstream" read. The cleaner your handoff note, the less work they spend diffing your output themselves.

## Handoff note to Agent 2

At the end of every Agent 1 run (first or re-run), produce a short handoff note. It can live in the research working log, in a commit message, or as a plain-text section in the project README — the medium doesn't matter, but the content does. Agent 2 (Market Intelligence) reads it to know where your coverage is thin so its own market sizing can compensate.

Minimum contents:

- **Country coverage by count:** "SGP: 14, MYS: 6, IDN: 3, THA: 2, VNM: 1, PHL: 0, Regional: 2, Global: 7."
- **Category coverage by count:** "global_incumbent: 7, sg_local: 10, regional_challenger: 8, diy_alternative: 4, adjacent: 3, big_si: 3."
- **Hidden-pricing records:** list the `id`s where `pricing_flag = hidden_estimated`, with the source note for each. Agent 3 will want to re-verify these.
- **Dormancy flags:** list any records you included despite low activity signals. Agent 2 should not use these as "live competitor" evidence for market sizing.
- **Known gaps:** e.g. "PHL coverage is weak (0 records). SEA quota met via other countries but the Philippines market-sizing will lack a local competitor anchor."
- **Top-5 threat vectors, one line each:** so Agent 2 can frame `implication_for_us` with those in mind when it writes market intelligence.

## Escalation criteria

Certain findings require pausing and escalating to the human rather than pushing through. Pushing through is tempting because the agent optimises for "done" — but in each of these cases, a silent default harms every downstream agent.

### 12.1 Fewer than 30 real competitors

Described in Section 5. Do not pad. Return the real number and a paragraph on why the category is thinner than assumed. The right follow-up is usually a brief conversation about whether the ICP should widen (e.g. "SG SME note-taking" → "SEA SME knowledge tools") before Agent 1 is re-run.

### 12.2 Cannot hit the 60% SEA bar even after VC portfolio pass

This means the category is genuinely Global-dominated in SEA. The right finding is "SEA has no native incumbents and is served by Global vendors." That is actionable — it reshapes Agent 4's whitespace thesis. Faking SEA records to hit the quota hides this finding and misguides the whole pack.

### 12.3 A competitor's structural advantage is larger than expected

If during research you discover a competitor has, say, an exclusive MAS licence you didn't know about, or a 10-year Peppol contract with IRAS, flag it. This is a `beatability: 1` signal that should restructure the pricing and whitespace analysis, not just land as a footnote in `competitors.json`.

### 12.4 The project brief's ICP is too narrow or too broad to score competitors

You will sometimes find the ICP in the brief is "AI for SMEs" or "note-taking software" — too broad to differentiate threat levels; everyone is a 3. Or "knowledge tools for ISO27001-certified SG fintech startups with 50–200 headcount" — too narrow to find 30 real competitors. Both cases require clarifying the ICP before scoring. Escalate.

### 12.5 Pricing cannot be sourced for more than a third of records

If >33% of records end up `pricing_flag: hidden_estimated`, the set is weak for downstream pricing work. That's a finding to surface — the category has opaque pricing — and it may also mean your RFQ / community hunt pass was too shallow. Do another pass before escalating.

## Quality gates before handoff

Self-administered tests. If any fails, fix before declaring done.

### 13.1 The "read at random" test

Pick three records at random. For each:

- Can you justify the `threat_level` in one sentence, citing evidence?
- Can you justify the `beatability` in one sentence, citing evidence?
- Does `primary_value_prop` sound like analysis or like marketing copy?
- Are `strengths` and `weaknesses` anchored in artefacts a reviewer could verify?

If two of three fail any dimension, you have a systemic issue, not a record-level one. Re-run that dimension across the set.

### 13.2 The "diversity" test

Look at the set across `category`:

- At least one record in each of: `global_incumbent`, `sg_local`, `regional_challenger`, `diy_alternative`, `adjacent`, `big_si`.
- If any bucket is empty, that is a blind spot — go find the missing category.

Look at the set across `hq_region`:

- SEA records are the 60% majority.
- Global records are present (usually ~20%) because the buyer compares you to them.
- APAC records (Japan, Korea, Australia, India outside SEA) are present if relevant to the category.
- If the spread is monochrome (all SEA or all Global), you've mis-scoped the search.

### 13.3 The "fresh eyes" test

Imagine an analyst who knows the category but not your project opens `competitors.json` for the first time. Can they:

- Understand who each competitor serves from `target_market` alone?
- Form a price-per-seat picture from `sg_monthly_sgd` across the set?
- Identify which competitors threaten which segments from reading `strengths` / `weaknesses`?
- Justify the Top-5 order without external context?

If any answer is "not really," the issue is in the field content, not the schema. Rewrite.

### 13.4 The "six-month" test

Will this file still read as useful in six months? That means:

- `research_date` per record is honest (not bulk-set to today).
- `pricing_flag: hidden_estimated` records have source notes so the next re-run can refresh them.
- IDs are stable enough that downstream files won't break on a rename.
- Rationales name specific vectors, not ephemeral moods ("currently struggling," "seems to be losing momentum").

A competitor database that ages gracefully is worth more than one that is pristine today but rotten in a quarter.

## Tooling notes

The agent runs inside Claude Code, so tool usage is part of the methodology.

- **Web access** via built-in fetch / browse tools. Prefer structured fetches (specific URLs) over open-ended search; the latter burns budget on irrelevant results.
- **Reading pricing pages** — many vendors render prices in JavaScript. If the fetched HTML has no price, try the pricing page's `__NEXT_DATA__` blob, their JSON API if discoverable, or Wayback for a recent stable snapshot.
- **Screenshots** — this agent does *not* take screenshots. Agent 5 (Website Design Auditor) owns the screenshot pipeline. Agent 1 only reserves `website_screenshot_path`.
- **Commits** — commit after each full pass of the cadence (Section 4.2 skeleton, Section 4.2 SEA weighting, etc.), not just at the end. A small commit per pass means the next re-run can pick up from a mid-point if the session is interrupted.
- **Working log** — keep a scratch file in `/working/01-research-log.md` (git-ignored). It's where source URLs, triangulation notes, and exclude-decisions go. Do not stuff those into `competitors.json`; the dictionary constrains what lives in the JSON and the log is where the rest lives.
- **Time budget** — ~6 hours for a first-run 35-record pass per the cadence in Section 4.2. A re-run is typically 1–2 hours. If you hit 10+ hours on a first run, either the category is unusually deep (good — surface that) or you are over-researching; cut the depth pass to Top-10 instead of Top-15.

## Deliverable checklist

Self-audit against this list before declaring Agent 1 done. Every box must be checked.

- [ ] `competitors.json` populated with ≥ 30 entries.
- [ ] ≥ 60% of entries SEA-weighted (SGP > MYS > IDN > THA > VNM > PHL).
- [ ] ≥ 3 DIY alternative entries (in-house hire, ChatGPT + spreadsheet, big-SI contract).
- [ ] `top_five[]` filled with 5 entries, each carrying a ≤ 200-char `rationale` that names a specific threat vector.
- [ ] Top-5 ranked by `threat_level × (6 − beatability)`, tie-broken by `market_share_estimate_pct` desc then alphabetical.
- [ ] Every entry's `research_date` within 30 days of project kick-off.
- [ ] Every `pricing_flag` set to exactly one of `public | partial | hidden_estimated`.
- [ ] Every `hidden_estimated` entry has a source note in the working log.
- [ ] Every `website_screenshot_path` populated with a target path (coordinate with Agent 5 on the actual file).
- [ ] Every `strengths` and `weaknesses` entry evidence-anchored (artefact, URL, or review theme), not an adjective.
- [ ] `primary_value_prop` ≤ 120 chars for every entry, paraphrased (not vendor copy).
- [ ] All enum fields (`category`, `hq_region`, `pricing_flag`) match Section 8 of `FIELD-DICTIONARY.md` exactly — spelling, case, punctuation.
- [ ] `id` values are lowercase-with-underscores and stable across re-runs.
- [ ] `market_share_estimate_pct` is `null` unless cited or ≥ 2-point triangulated; no guesses.
- [ ] `meta.sample_data` flipped to `false` if this is real project data.
- [ ] Handoff note prepared for Agent 2: which segments, countries, and categories you under-covered, so Agent 2 knows where its market sizing has thinner competitor-side support.

If any item fails, fix it before handing off. Agent 2 reads `competitors.json` as ground truth; a half-finished database poisons every downstream deliverable.
