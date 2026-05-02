# 05 — Website Design Auditor

## Role one-liner

Rates every competitor's website and our own on a 5-dimension rubric — and audits coherence between brand, service, and customer journey.

## When to dispatch

Dispatch after Agent 1 (Competitor Research Analyst) has produced a reasonably complete `competitors.json`, because this agent depends on the URL list and the stable `id` slugs Agent 1 minted. Without Agent 1's URLs and IDs, there is nothing to audit and no stable filename to screenshot to; starting earlier means you will either re-do the work when IDs shift or produce orphan screenshots that have to be renamed by hand.

Agent 5 is independent of Agents 2 (Market Intelligence), 3 (Pricing), and 4 (Whitespace). None of them read `website_design_rating` or the screenshots, and this agent does not read their outputs. That independence means Agent 5 can run in parallel with 2, 3, or 4 — pick any one to co-run with if you are time-constrained. The most common pairing in practice is Agent 5 in parallel with Agent 3 (Pricing), because the pricing pass and the screenshot pass both hit every competitor homepage anyway; running them together halves the total browser time. Do not run Agent 5 in parallel with Agent 1 itself — Agent 1's URL list is the input, and you cannot audit a moving target.

Re-dispatch this agent whenever (a) a competitor does a visible redesign (hero change, new typography, new colour system — screenshots diverge visibly from the stored one), (b) Agent 1 adds a new competitor record without a screenshot, or (c) our own site ships a visual refresh and the self-audit needs to re-anchor. Partial re-runs are fine and encouraged — you do not need to re-score all 30+ competitors because one changed. Re-score only the changed records, update their screenshots, and leave the rest alone with their original `research_date`.

## Inputs the agent needs

- **`competitors.json`** from Agent 1. You read `competitors[].id`, `competitors[].name`, `competitors[].url`, and `competitors[].website_screenshot_path` (the reserved path). You write back `website_design_rating`, `website_design_notes`, and confirm / correct `website_screenshot_path`.
- **Our own site's live URL** if it exists. If it does not yet exist (pre-launch project), skip the self-audit and note in the handoff that it is deferred until the site ships. Do not audit a staging URL that the buyer will never see; the self-audit must reflect what a live prospect would actually encounter.
- **A real browser with a 1440×900 viewport capability.** Screenshot tools that render at 1024×768 or at mobile widths produce audits that disagree with what a buying analyst sees. Use Playwright, Puppeteer, or a browser extension that can explicitly pin the viewport.
- **WAVE and / or axe DevTools** installed. The Accessibility dimension is not a gut-feel score; it is a tool-run score. If you cannot run WAVE or axe on a given site (e.g. Cloudflare bot wall), record that explicitly in `website_design_notes` rather than gut-feeling the score.
- **A stopwatch or a screen recording** for the UI Clarity dimension. The 10-second findability test is real, not a metaphor; you need to actually time it.
- **Brand tokens** from `meta.brand_tokens` if you plan to generate a side-by-side gallery later. Agent 6 consumes this, but having them at hand during the audit helps frame the self-audit (are we visually coherent with our own tokens?).

## The 5-dimension rubric

Every site is scored on five dimensions, each 1–10. The single `website_design_rating` stored in `competitors.json` is the equal-weighted mean of the five, rounded to the nearest 0.5 (unless the project brief in `AGENT.md` specifies a different weighting — e.g. a regulated-sector project might weight Accessibility higher).

For each dimension below you get the canonical anchors at 1, 5, and 10, plus three common defects that will drop the score. Use the defects as a checklist; if three apply, the score cannot exceed 6 regardless of how pretty the site is.

### 5.1 Modernness

What it measures: how current the site *looks* — typography, whitespace, motion, information density. A modern site feels like it was designed in the last 18 months. A dated site feels like it was last touched in 2016.

- **1 = 2010 look.** Small body text (< 14px), heavy gradients, skeuomorphic buttons with shadows and chrome, stock-photo hero of a handshake, sidebar navigation with 12 items. Feels like a 2010 template that nobody has touched.
- **5 = Competent-but-common.** Clean sans-serif, responsive grid, reasonable whitespace, single-tone CTA button, Unsplash hero image. Looks like any of a hundred SaaS sites launched in 2022. Does not embarrass, does not lead.
- **10 = State of the art.** Reference points: Linear.app, Stripe, Vercel, Framer, Arc. Distinctive typography choice (not Inter by default), deliberate motion (not parallax or cursor trail), dark-mode awareness, dense but legible, clear visual system that reads as its own brand rather than a template. You cannot confuse it with a competitor's site.

Common defects that drop the score:

1. **Gradient overuse** — every button, every card, every background has a gradient. Signals 2019 thinking. Drops Modernness by 1–2.
2. **Stock hero photography** — handshake, laptop-on-a-desk, diverse-people-in-a-meeting. Drops by 1. If the photo is a watermarked Shutterstock image, drops by 2.
3. **Font-stack fallback tells** — the site specs a premium display font that never loads, so you see Arial or Helvetica where the brand wanted Söhne or Inter. Drops by 1 — the craft gap is visible.

### 5.2 Attractiveness

What it measures: gut-feel appeal. Does the site look *good*? Are the colours working together, is the imagery high-quality, does the overall composition feel considered? This is the one dimension where "I know it when I see it" is the honest answer — but pair the gut feel with concrete observations.

- **1 = Visually offensive.** Colour clashes (pure red next to pure green, no neutral buffer), low-resolution images, mismatched icon styles (some flat, some 3D, some line), cluttered layouts where nothing is dominant.
- **5 = Inoffensive baseline.** Generic SaaS palette (blue-gray-white), adequate photography, consistent icon set, balanced composition. Nothing repels, nothing attracts.
- **10 = Genuinely beautiful.** Reference points: Stripe's press pages, Apple's product pages, Linear's design blog. Colour choices feel intentional (complementary or constrained palette with one accent), imagery is custom or expensively-licensed, every page feels composed rather than assembled.

Common defects that drop the score:

1. **Palette soup** — the site uses 6+ brand colours with no hierarchy. Drops Attractiveness by 2.
2. **Inconsistent imagery** — hero is a photo, section 2 is a vector illustration, section 3 is an icon, section 4 is a screenshot. No unifying style. Drops by 1–2.
3. **Low-resolution assets on retina screens** — hero image is 800px wide displayed at 1600px, visibly blurry on modern displays. Drops by 1.

### 5.3 Coherence (brand → service → flow)

What it measures: does the visual story match what they sell and how you buy? A beautiful site that obscures what the company does, or buries the buying path, fails Coherence even if it aces Modernness and Attractiveness. This dimension exists specifically to penalise pretty-but-confusing sites that would otherwise score high.

- **1 = Total mismatch.** The visual brand says "playful consumer app," the service is B2B tax compliance software. Or: the hero says "AI for everyone," but clicking through reveals they sell one narrow B2B workflow. The buyer has to decode what's happening.
- **5 = Adequate match.** Visual tone and service category are in the same neighbourhood. A SaaS-looking site for a SaaS product. Buyer understands within 15 seconds what the company does.
- **10 = Reinforcing story.** Visual brand, service description, and customer journey tell the same story with no friction. Hero explains what they sell in ≤ 10 words. The next scroll shows who it is for. The next shows proof. The CTA matches the stage of buyer intent. Every page's visual language supports, not distracts from, the next step.

Common defects that drop the score:

1. **Pretty-but-burying-pricing.** The site is visually polished but pricing is three clicks deep or behind "Contact Sales" with no indication of magnitude. **Hard cap: if the buyer cannot find pricing in 10 seconds, Coherence caps at 5 regardless of other factors.** This is the pitfall #9.1 fix below.
2. **Brand-service mismatch.** Visual tone targets one buyer but service targets another — e.g. playful illustrated brand selling into banks. Drops by 2.
3. **CTA confusion.** Three competing CTAs in the hero ("Book a demo," "Start free trial," "Watch video") with no visual hierarchy. Buyer doesn't know which one matches their intent. Drops by 2.

### 5.4 UI Clarity

What it measures: can the buyer find what they came for in ≤ 10 seconds? The three canonical buyer intents — pricing, demo / trial, contact — are the stopwatch tests. You actually time them. If pricing takes 14 seconds to locate, that's a 14-second record, and the score drops.

- **1 = Buyer lost.** Three intents tested; zero of three findable in 10 seconds. Navigation is either missing, unlabelled, or labelled with marketing-speak ("Solutions" → "For Your Business" → "Get Started" chain that leads nowhere near pricing).
- **5 = Two of three findable.** Pricing and contact are reachable in ≤ 10 seconds; demo / trial is buried or absent. Nav is labelled plainly.
- **10 = All three in ≤ 5 seconds.** Pricing, demo / trial, and contact each have a clear path from the hero — usually visible in the top nav, a visible footer, or a clearly-styled CTA. No guessing required.

Common defects that drop the score:

1. **Marketing-speak navigation.** "Solutions / Platform / Why Us / Resources" instead of "Product / Pricing / Docs / Contact." Drops UI Clarity by 2 — the buyer has to decode the taxonomy.
2. **Footer-only pricing.** Pricing exists but only in the footer, no top-nav entry. Drops by 1–2 depending on how quickly the buyer scrolls to footer.
3. **Modal-gated intent.** Clicking "Demo" triggers a 12-field form with no preview of what comes after. Buyer bounces. Drops by 1.

Stopwatch protocol: load the homepage, start a timer, click naturally as a first-time visitor would. Stop when you arrive at a page that shows the thing (a pricing table, a demo booking widget with calendar, a contact page with an email or form). If you're still clicking at 10 seconds, that intent scores zero for findability.

### 5.5 Accessibility

What it measures: whether a user with low vision, keyboard-only navigation, or a screen reader can use the site. This dimension is **not** scored by gut feel. Run WAVE or axe DevTools for every site. Record contrast ratios for at least the hero CTA and primary body text. A site can look stunning and fail Accessibility; both things can be true.

- **1 = Egregious failures.** No alt text on any images, body text fails WCAG AA contrast (< 4.5:1), focus states invisible or removed, 200% zoom breaks the layout, no semantic landmarks. Fails every axe rule.
- **5 = Partial pass.** AA contrast on body text but marginal on CTAs, alt text on most images but missing on decorative ones, focus states present but styled minimally, zoom works to 200% with minor overflow. Several axe issues flagged but none critical.
- **10 = Clean WAVE / axe run.** Zero errors and zero contrast warnings on WAVE, all images have alt or aria-hidden, visible focus states on every interactive element, 200% zoom reflows cleanly, semantic HTML with landmarks, skip-to-content link present.

Common defects that drop the score:

1. **Contrast failure on the primary CTA.** The "Book Demo" button uses brand colour on brand colour and ratios below 4.5:1. Drops Accessibility by 2. The *entire* buying flow hinges on that button and it's unreadable for ~4% of users.
2. **Missing alt text on content images.** Product screenshots without alt attributes. Drops by 2 — the screen-reader user has no idea what the product does.
3. **Zoom-breaks-layout.** At 200% zoom, the nav collapses, content overlaps, or horizontal scrolling appears. Drops by 2 — WCAG 1.4.10 reflow failure.

If WAVE / axe is blocked by a bot-detection wall (Cloudflare challenge, aggressive fingerprinting), note it in `website_design_notes` and score conservatively on what you can observe, rather than scoring optimistically. A site that blocks axe is frequently a site that doesn't run axe internally either.

## Weighted single rating

Unless the project brief says otherwise, the single `website_design_rating` stored in `competitors.json` is the **equal-weighted mean** of the five dimensions, rounded to the nearest 0.5. Example: scores of 7, 6, 5, 8, 6 yield a mean of 6.4, which rounds to 6.5.

If the project brief specifies different weights — e.g. a government / regulated-sector project that weights Accessibility double — apply those weights to the mean before rounding and note the weighting in the handoff. Do not change the weights silently; the next agent who reads the `website_design_rating` will assume equal weighting unless told otherwise.

Storage: `website_design_rating` is a single number (e.g. `6.5`) per `FIELD-DICTIONARY.md` §3. The per-dimension scores live in your working log or an auxiliary file, not in `competitors.json` — the dictionary does not define per-dimension storage, so keep the JSON schema minimal and write the audit detail elsewhere. Agent 6 renders only the single number; Agent 8 may quote your per-dimension breakdown in the Report if it's in the working log.

## Required-notes trigger

Any dimension scored ≤ 6 requires a `website_design_notes` entry of ≤ 160 characters, pointing to the specific defect. Per `FIELD-DICTIONARY.md` §3, this field is required on every record anyway — the required-notes trigger determines whether it must be *substantive* vs. allowed to be an empty string.

Good notes (specific, defect-named, actionable):

- "Dated typography (14px body, heavy gradients); PSG badge is clearest CTA on hero; pricing two clicks deep."
- "Coherence fail: playful illustrated brand sells into MAS-regulated banks; buyer tone mismatched."
- "Accessibility: primary CTA fails 4.5:1 contrast (WAVE); alt text missing on 6 of 9 screenshots."

Bad notes (vague, un-actionable):

- "Looks old."
- "Not great."
- "Dated."

The rule of thumb: a reviewer reading only `website_design_notes` should be able to identify the specific defect without re-opening the site. If your note doesn't clear that bar, rewrite.

If multiple dimensions scored ≤ 6, concatenate the defects with semicolons up to the 160-char cap. Prioritise the dimension with the lowest score. If all five dimensions scored ≤ 6, the site is a genuinely weak design — the note should lead with whichever dimension was worst and acknowledge the breadth ("Weak across all dimensions; worst: Accessibility 3 — ...").

## Screenshot protocol

Screenshots are the visual substrate for Agent 6's `design-audit.html` gallery. A bad screenshot pipeline makes the gallery look inconsistent and makes side-by-side comparison impossible. Follow this exactly.

### 7.1 Capture settings

- **Viewport: 1440×900.** This is the canonical audit viewport. Not 1920×1080 (too wide for most buyer monitors), not 1280×720 (legacy). Every screenshot in the gallery must share the viewport so visual comparisons are valid.
- **Delay: ≥ 2 seconds after DOMContentLoaded.** Modern sites animate the hero in, lazy-load images, or wait for fonts to swap. A screenshot taken at t=0 often captures a half-rendered hero. Pin a 2-second settle delay minimum; some sites need 4–5.
- **Page: the homepage, full hero visible.** Not a sub-page, not the pricing page, not a blog post. The gallery compares hero-against-hero.
- **DPI: 2× (retina).** Otherwise the images look soft on modern displays and the gallery itself reads as low-quality.
- **Cookie / consent banners: dismissed.** If a cookie banner covers 30% of the hero, dismiss it before capture. If dismissing requires a sign-in or country-specific rules you cannot satisfy, capture with the banner and note it in `website_design_notes`.

### 7.2 Filename and path

- **Filename: `<competitor_id>-home.png`.** Use the exact same `id` slug Agent 1 minted in `competitors.json`. No variations ("Notion-home.png", "notion_home.png" — both wrong). The slug is a foreign key; changing it breaks the link between record and file.
- **Directory: `/template/assets/screenshots/`.** Relative to the repo root, not to the methodology folder.
- **Field: `website_screenshot_path` stores the relative path.** Example: `"template/assets/screenshots/notion-home.png"`. No leading slash. Forward slashes, not backslashes (Windows-safe).

### 7.3 When a site blocks capture

Some sites are uncapturable:

- **Paywalls / sign-in walls** that hide the entire homepage.
- **Aggressive bot detection** (Cloudflare interactive challenge, PerimeterX, Akamai Bot Manager) that the headless browser cannot pass.
- **Geo-blocking** that returns a "Not available in your region" page instead of the real homepage.

Handling:

1. Try once with stealth flags (Playwright with `stealth` plugin, or real-browser automation). Many blockers fail against real Chromium with stealth; only a few require genuine manual capture.
2. If stealth fails, try a manual screenshot from a real browser as a last resort. Same viewport, same 2-second delay, same filename.
3. If even manual fails (paywall with no free tier, genuine geo-block), note it in `website_design_notes` ("Site blocks automated capture behind Cloudflare; hero audited from cached Google Images snapshot") and **leave `website_screenshot_path` as an empty string** (`""`). Do not substitute a logo or a Google-cached thumbnail in place of the real screenshot; downstream agents will quietly inherit the substitution.

### 7.4 Stability of paths across re-runs

`website_screenshot_path` is a foreign-key-like reference that Agent 6 and Agent 8 read. Do not rename the file on a re-run unless the competitor's `id` itself changed (which it should almost never do — see `01-competitor-research-analyst.md` §5.2). On a re-run where a competitor has redesigned, overwrite the file at the same path; the filename stays stable, the content updates, the `research_date` on the record updates.

### 7.5 Mobile-viewport pass (required for the Top-15)

The 1440×900 desktop capture is the canonical comparison frame, but a single-viewport audit misses mobile-first competitors who look dated at 1440 yet polished at 375. For the **Top-15** (Top-5 plus the next-10 ranked by `attack_plans[].rank` proximity), capture a second screenshot at **375×667 (iPhone SE/8 baseline)** with the same 2-second settle, same DPI, same filename suffix:

- Filename: `<competitor_id>-home-mobile.png`
- Path: same `/template/assets/screenshots/` directory
- Field: `website_screenshot_path_mobile` (per `FIELD-DICTIONARY.md` §3) — leave unset (no key) for competitors below Top-15

The mobile capture changes scoring on **Coherence (5.3)** and **UI Clarity (5.4)** materially. A site whose desktop hero scores 6 on Coherence may drop to 3 on mobile if the hero stack collapses to an unscannable wall of text; a site whose desktop nav hides pricing behind a hover may score better on mobile because the hamburger surfaces it. Score both viewports and use the lower of the two as the dimension score, then average to the single `website_design_rating`. Note the divergence in `website_design_notes` if it is > 2 points on any single dimension ("desktop 8, mobile 4 on UI Clarity — pricing hidden behind hover on desktop, accessible via hamburger on mobile").

### 7.6 Three-intent findability triplet (stopwatch test)

For every Top-15 competitor, run the **three-intent timing test** on the live desktop site at 1440×900. Open the homepage cold (no prior session, no cookies), and time how long it takes to reach each of three buyer intents:

| Intent | Definition of "found" | Stopwatch upper bound |
|---|---|---|
| `pricing` | Any artefact showing a price, a tier table, "from S$X/mo," or even an explicit "Contact for pricing" CTA | 30 seconds |
| `demo` | A demo / trial / sandbox CTA, free-tier signup, or a calendar booking link | 30 seconds |
| `contact` | A sales contact form, sales email, phone number, or scheduling link to a sales rep (not a generic support page) | 30 seconds |

Record under `competitors[].findability_seconds` per `FIELD-DICTIONARY.md §3.1`:

```json
"findability_seconds": { "pricing": 8, "demo": 4, "contact": 22 }
```

Use `null` when an intent could not be found inside 30 seconds. Examples worth recording verbatim because they are diagnostic, not just numbers:

- **Pricing = null** is the strongest single signal of `pricing_flag: hidden_estimated`. Cross-check against Agent 1's flag; mismatches surface as defects.
- **Demo = null** for a B2B SaaS suggests sales-led GTM only — a structural advantage if the buyer is enterprise, a structural weakness if the buyer is SMB self-serve.
- **Contact > 20s** with `pricing > 20s` is the "designed-not-to-sell" pattern — common on agency sites that prefer warm referrals.

The triplet feeds two downstream consumers:
- **Agent 6** can render a "Findability Speed" mini-stat-card on each competitor row (median: <8s green / 8–20s amber / >20s or null red).
- **Agent 8** can include a one-page "Findability scoreboard" appendix in the report for procurement teams.

The triplet does NOT replace the **UI Clarity (5.4)** dimension score — UI Clarity reads broader (typography, hierarchy, hover state legibility); findability is a hard-numeric subset of UI Clarity. Both ship.

### 7.7 Cross-check against Agent 0 (brand-assets.json)

If `/template/data/brand-assets.json` exists, read it before screenshotting. Two practical effects:

- **Avoid lifting the client's own photos as competitor evidence.** Agent 0's `imagery[]` lists every photo extracted from the client's reference deck. If a competitor's hero carousels match a slug there, they are likely re-using shared event-industry stock — record the observation in `website_design_notes` (`"Hero photo matches client's deck imagery — likely shared stock"`) but do not flag the competitor as a copycat without further evidence.
- **Detect palette collisions.** When a competitor's palette (sampled from their hero) overlaps materially with `brand-assets.json → palette`, that is a brand-collision risk for the project. Flag in `website_design_notes` with the hex values: *"Hero palette `#FF6A00`-led overlaps client primary `#FF6A00`; brand-collision risk."*

Agent 5 does **not** own brand-asset extraction — that is Agent 0's job. If the human did not supply reference materials and Agent 0 did not run, Agent 5 proceeds normally without the cross-check.

## Self-audit

After rating every competitor, score our own site on the same rubric. This is the diagnostic section: where are we behind the top-scoring competitor, and by how much?

### 8.1 Where it lives

Our self-audit is **not** a row in `competitors.json`. Per the pitfall #10.3 fix below, we are not a competitor and treating ourselves as one corrupts the Top-5 curation. Instead, the self-audit lives at the end of `market-intelligence.json`, under a top-level `self_audit` key (or similar — confer with Agent 2 and Agent 7 on the exact key name; the important invariant is that it is *in* `market-intelligence.json` and *not in* `competitors.json`).

Minimum self-audit shape:

```
"self_audit": {
  "url": "https://our-site.sg",
  "captured_at": "2026-04-24",
  "screenshot_path": "template/assets/screenshots/_us-home.png",
  "scores": {
    "modernness": 7,
    "attractiveness": 6,
    "coherence": 8,
    "ui_clarity": 7,
    "accessibility": 5
  },
  "weighted_rating": 6.5,
  "notes": "Accessibility: primary CTA contrast 4.2:1 (fails AA); alt text missing on 4 product screenshots. Otherwise clean.",
  "design_debt_flags": [
    {"dimension": "accessibility", "our_score": 5, "top_competitor_id": "linear", "top_competitor_score": 10, "gap": 5}
  ]
}
```

The `design_debt_flags` array is the practical output. Any dimension where we scored ≥ 2 points below the top competitor on that dimension is flagged. Those flags are the raw material for Agent 8's Section 8 of the Report.

### 8.2 The ≥ 2-point rule

Scoring our site 5 on Accessibility when the top competitor scored 10 is a 5-point gap — a clear debt. Scoring 7 when the top scored 8 is a 1-point gap — not flagged; noise floor. The 2-point threshold is deliberately loose to avoid flagging every small gap, but strict enough to catch real structural weakness.

Concretely: for each dimension, find the highest score any competitor achieved on that dimension. If our score is ≥ 2 points below that highest, flag it. One flag per dimension; do not flag the same dimension twice against different competitors.

### 8.3 Self-audit screenshot

Take the same 1440×900 / 2-second delay / retina screenshot of our own site. File it at `template/assets/screenshots/_us-home.png` (leading underscore marks it as "us," not a competitor slug, and sorts it out of the alphabetical gallery). Store the path in `self_audit.screenshot_path`.

### 8.4 If our site doesn't exist yet

If the project is pre-launch and there's no live site, omit the self-audit entirely and note in the Agent 5 handoff: "Self-audit deferred — no live site at <project_name> yet. Re-run Agent 5 once the site ships." Do not self-audit a Figma file or a staging URL; the self-audit reflects what a live prospect actually sees.

## Worked example: one fully scored competitor

Scenario: auditing `notion` on the SG SME note-taking project. Competitor URL: `https://www.notion.so`.

### 9.1 Capture

- Opened `https://www.notion.so` in Playwright with viewport 1440×900.
- Waited 3 seconds for hero illustration to settle.
- Dismissed cookie banner (click "Accept all" — consent decision is not the audit subject).
- Captured. Saved to `/template/assets/screenshots/notion-home.png`.
- `website_screenshot_path` = `"template/assets/screenshots/notion-home.png"`.

### 9.2 Per-dimension scores

**Modernness: 9.** Typography is crisp (Inter-like custom stack, 16px body, proper line-height), whitespace is generous, motion is subtle (hero animates one icon, no cursor trails or parallax), density is dense-but-legible. Reads as 2024–2025 state-of-the-art. Not a 10 because the hero illustration leans into a slightly-dated 2022 flat-illustration style; a 10 would have something more distinctive (e.g. Linear's gradient hero).

Defects: none from the canonical list apply. No gradient overuse, no stock photography, no font-stack fallback tells.

**Attractiveness: 8.** Palette is black/white/grey with a single red-orange accent. Imagery is custom (their own product screenshots and illustrations), consistent style. Composition is balanced — strong hero, clear sections, confident CTAs. Not a 10 because the overall feel is understated rather than genuinely beautiful; it's tasteful but not surprising.

Defects: none. Palette is constrained (3 colours + accent), imagery is consistent, assets are retina.

**Coherence: 8.** Hero says "The happier workspace" — which is a brand statement, not a what-we-sell statement. Next scroll clarifies: "Write, plan, and organise." Pricing is in the top nav, visible immediately, clickable to a well-structured pricing page in under 5 seconds. Flow: hero → features → social proof → pricing → CTA. All pages reinforce the same brand tone.

Not a 10 because the hero line itself is soft — a first-time buyer has to scroll once to learn what the product actually does. A 10 would have both the brand line and the what-we-sell line visible in the first viewport.

Defects: none. Pricing is findable in < 10 seconds (no cap triggered), brand-service match is clean, CTAs have clear hierarchy.

**UI Clarity: 9.** Three-intent stopwatch:

- Pricing: clicked "Pricing" in top nav → 2 seconds. Arrives at a tiered pricing table immediately. **PASS, 2s.**
- Demo: no "Demo" CTA in hero; the closest analogue is "Start for free" (top-right), which opens signup. For a free product like Notion, "demo" and "trial" collapse; trial is 3 seconds to signup form. **PASS, 3s.**
- Contact: footer link "Contact sales" → 4 seconds, clicks to a form with named email for general enquiries visible. **PASS, 4s.**

All three intents under 5 seconds. Score 9 rather than 10 because the "Demo" intent is technically the signup flow, not a bookable demo with a salesperson — fine for Notion's self-serve model, but a buyer expecting an assisted demo would be mildly confused.

Defects: none.

**Accessibility: 6.** Ran WAVE:

- 0 errors, 2 contrast warnings on secondary text (grey-on-white, 4.3:1 ratio — just under AA). 
- 3 alerts on "redundant links" in the footer.
- Alt text present on all hero images, missing on 2 decorative SVGs (flagged as alerts, not errors).
- Focus states visible on every interactive element (tested with keyboard).
- 200% zoom: reflows cleanly on the hero, but the pricing table at 200% causes horizontal scroll on a 1440 viewport. WCAG 1.4.10 alert.

Defects applicable:
- Contrast warning on secondary text (not primary CTA, which passes). Drops by 1.
- Alt text missing on decorative SVGs (low severity, decorative). Drops by 0.5.
- 200% zoom causes horizontal scroll on pricing table. Drops by 2.

From a baseline of 10, − 3.5 → 6.5 → round down to 6 because the zoom failure is a real WCAG 1.4.10 regression, not a gray-area issue. The site looks accessible but has one structural flaw.

### 9.3 Weighted rating

Equal-weighted mean: (9 + 8 + 8 + 9 + 6) / 5 = 40 / 5 = **8.0**. No rounding needed; exactly 8.0.

Storage in `competitors.json`:

```
"website_design_rating": 8.0,
```

### 9.4 Required notes

Accessibility scored 6 → required-notes trigger fires. Note, ≤ 160 chars:

> "Accessibility 6: pricing table horizontal-scrolls at 200% zoom (WCAG 1.4.10); secondary text contrast 4.3:1 borderline. Otherwise modern and coherent."

That's 147 characters. Names the specific WCAG failure, anchors the contrast issue with a number, and signals the otherwise-healthy state. A reviewer could find and verify the defect in 60 seconds.

### 9.5 What does not go into `competitors.json`

The per-dimension breakdown (9 / 8 / 8 / 9 / 6) lives in the working log, not in `competitors.json`. The dictionary defines a single `website_design_rating` field; adding per-dimension fields would require going through Agent 7 and updating `FIELD-DICTIONARY.md` first. Keep the JSON to the dictionary shape; put detail in the log.

## Common pitfalls

Three named failure modes. Self-audit for these before declaring done.

### 10.1 Coherence rewards aesthetic over clarity

**Symptom:** you scored a beautiful site 9 on Coherence because it "just feels right," even though pricing is three clicks deep and the hero doesn't say what the product does. The visual gestalt hypnotised the scorer into ignoring the buying-flow failure.

**Cause:** Coherence is the only dimension of the five that mixes aesthetic and functional judgment, and the aesthetic half is louder. A site that is pretty and fluent in a design idiom fires the "good" reflex; the scorer forgets to run the buying-flow test.

**Fix:** apply the hard cap. **If the buyer cannot find pricing in 10 seconds, Coherence caps at 5 regardless of other factors.** Run the stopwatch before you score Coherence, not after. If the stopwatch says 14 seconds, write "5" and don't let yourself argue upward. The cap exists because Coherence's whole purpose is to penalise pretty-but-confusing sites; removing the cap makes Coherence redundant with Attractiveness.

A secondary check: if you scored Coherence ≥ 8 but UI Clarity ≤ 5, you almost certainly mis-scored Coherence. A site whose UI isn't clear cannot be coherent — the service-to-flow link is broken. Re-score.

### 10.2 Accessibility-from-gut

**Symptom:** Accessibility scores cluster at 6–8 across the set with no variance, because the scorer eyeballed each site and declared it "probably fine." Zero tool runs were performed.

**Cause:** Accessibility is the only dimension that rewards running a tool, and tools feel like interruption. Gut-feel scoring is faster in the moment and invisible to the reader of the output. The cost lands on the self-audit, which also gets a gut-feel score and therefore misses our own real debt.

**Fix:** actually run WAVE or axe DevTools for every site. Every single one. Record the contrast ratios you actually observed (e.g. "4.3:1 on secondary text, 4.6:1 on primary CTA"), the number of WAVE errors ("0 errors, 2 alerts"), and the result of a 200% zoom test ("reflows cleanly" / "horizontal scroll on pricing"). If a site blocks the tool, note the block rather than substituting a gut-feel score.

A reasonable audit budget is ~3–5 minutes per site for Accessibility alone: load, run WAVE, screenshot the WAVE panel, test zoom, test keyboard focus. That budget is real; do not compress it.

### 10.3 Treating our own site as a competitor

**Symptom:** our own site appears as a row in `competitors.json`, with `id: "us"` or `id: "<our_brand>"`. The Top-5 curation in Agent 1's rubric now has to explicitly exclude us. Agent 4's whitespace framework scores us as a competitor. The gallery in Agent 6 shows us in the lineup.

**Cause:** it feels symmetric and tidy to score ourselves with the competitors. It is, mechanically, easier to write one rubric-runner and point it at every URL. The symmetric output feels complete.

**Fix:** the self-audit lives in `market-intelligence.json` under a dedicated `self_audit` key, not in `competitors.json`. We are not a competitor to ourselves. The Top-5 is not a "Top-5 threats *and* us"; it's a Top-5 of the threats against us. Agent 4's whitespace framework scores us on the `our_score` axis of the heatmap, which is separate from the competitor columns. Maintaining this separation keeps every downstream calculation honest.

If you find a row with `id: "us"` in `competitors.json` during handoff, delete it, re-run the self-audit section into `market-intelligence.json`, and notify Agent 7 (Methodology Curator) that the separation was breached so the next re-runner doesn't repeat the mistake.

## Tooling notes

The agent runs inside Claude Code, so tool usage is part of the methodology.

- **Browser automation** — Playwright with Chromium is the canonical choice. Puppeteer is acceptable. Avoid `curl`-based HTML fetchers; they cannot render JavaScript-heavy heroes, lazy-loaded images, or font swaps, so the screenshots they produce understate the design. If Playwright is unavailable, use a real browser with a viewport-pinning extension (Responsive Viewer, Window Resizer) and take manual screenshots at 1440×900.
- **Stealth mode for bot walls** — install `playwright-extra` with the `stealth` plugin before attempting sites that sit behind Cloudflare or PerimeterX. A plain Playwright fingerprint is trivially detected by Cloudflare's interactive challenge; stealth mode changes enough fingerprints that ~70% of bot-walled sites capture successfully on first try.
- **WAVE vs. axe DevTools** — WAVE is the faster eyeball tool (Firefox/Chrome extension, renders error markers directly on the page). axe is the more rigorous programmatic tool (Chrome extension, produces a structured issue list). Use WAVE for the quick-scan score; use axe when you need to cite a specific WCAG rule in `website_design_notes`. For the self-audit, run both; the self-audit demands more rigour than competitor audits because it drives our own remediation.
- **Contrast ratio tools** — WebAIM's Contrast Checker (online) or the Contrast tab inside Chrome DevTools (Inspect → Accessibility). Record ratios to one decimal place ("4.3:1" not "~4"). A ratio between 4.4:1 and 4.6:1 is a borderline pass; note it as borderline in the notes rather than silently passing or failing it.
- **Viewport pinning** — Playwright has `viewport: { width: 1440, height: 900 }` in the browser context options. For manual browser capture, use Chrome DevTools device toolbar set to "Responsive" and dial to 1440×900 exactly. Do not trust a maximised browser window on a 1440-wide display; browser chrome steals 80–120 pixels of height and your screenshot will be 1440×780 instead.
- **Screenshot file size** — a raw 2× PNG at 1440×900 is ~400–800KB. Do not aggressively compress; the gallery needs crisp images. If repo size is a concern, write a build step that compresses on publish rather than on commit. Raw screenshots are the source of truth.
- **Commits** — commit screenshots and the JSON updates together, per record or per batch of 5. One commit per record is ideal for bisecting, but 5-record batches are fine when the audit is a bulk first-run. Do not commit the full 30-record audit as one giant commit; it makes re-runs harder to diff.
- **Working log** — keep a scratch file at `/working/05-audit-log.md` (git-ignored). Record, per competitor: per-dimension scores (1–10 each), the WAVE / axe output (raw counts), the stopwatch timings for the three buyer intents, and any oddities observed. This log is what Agent 8 quotes from in Section 8.
- **Time budget** — ~10–15 minutes per competitor for a thorough audit: 2 min to capture and settle the screenshot, 3–5 min to run WAVE or axe and record ratios, 2–3 min for the stopwatch test across three intents, 2–3 min to score and write notes. For 30 competitors that is 5–7.5 hours — a focused day. Do not compress below 10 min per site; you will miss defects and regress to gut-feel scoring.

## Re-run protocol

When Agent 5 is dispatched against an existing `competitors.json` rather than a blank slate, the work is partial, not complete. Re-scoring every site is wasteful and noisy; re-score only what changed.

### 12.1 Before touching anything

- Read the existing `competitors.json` and note which records have `website_design_rating` already populated.
- List every record whose `research_date` is older than 90 days. Design lifespans are longer than pricing lifespans — a site that was scored 6 months ago may still be accurate, unless the competitor has clearly redesigned. Spot-check by opening a handful and comparing hero against the stored screenshot.
- List every record where Agent 1 added a new URL or changed an existing one. These records need a first audit or a re-audit.
- List every record where the `website_screenshot_path` file is missing on disk. These are silent breakages — the JSON says there's a screenshot, but Agent 6 will render a broken image.

### 12.2 Change types and their consequences

- **New competitor added by Agent 1** → full 5-dimension audit, screenshot capture, notes populated. No cascade beyond this agent unless the new competitor sets a new ceiling on any dimension (in which case re-run the self-audit's design-debt flags).
- **Existing competitor's URL changed** → treat as new; re-audit and overwrite screenshot at the same `<id>-home.png` path.
- **Existing competitor has redesigned (visible hero change)** → re-audit all five dimensions. Scores frequently move 2+ points on a redesign in either direction.
- **Existing competitor shut down / acquired** → route back to Agent 1; Agent 5 does not delete records.
- **Our own site ships a visual refresh** → re-run self-audit only. Do not touch competitor scores; the top-competitor ceilings have not changed just because we moved.
- **The project brief's weighting guidance changes** (e.g. "now we care about Accessibility double") → no re-capture needed; recompute weighted ratings from existing per-dimension scores in the working log. This is why per-dimension scores live in the log even though they don't live in the JSON.

### 12.3 What to preserve

- Existing screenshots for competitors that have not redesigned. Overwriting with a fresh capture at a different time of day introduces subtle cosmetic differences (A/B test variants, time-of-day hero changes) that make the gallery look noisier than it is. Only re-capture when the site has visibly changed.
- Existing `website_design_notes` for competitors that have not changed. Editing notes on untouched records makes diffs noisy and signals activity where none happened.
- The `_us-home.png` screenshot if the self-audit itself was not re-run.

### 12.4 What to surface in the handoff note

- Which records were re-audited and which were not.
- Which records had rating movements ≥ 1.0 (material shifts) and what drove them.
- Any newly-flagged `design_debt_flags` on our self-audit.
- Any sites that blocked capture on this run but didn't on the previous run (emerging bot-wall trend).

## Quality gates before handoff

Self-administered tests. If any fails, fix before declaring Agent 5 done.

### 13.1 The "gallery preview" test

Mentally (or actually — Agent 6 can stub a preview) render the `design-audit.html` gallery with the current data. Walk the gallery top to bottom:

- Does every screenshot load (no broken images)?
- Is every screenshot at the same aspect ratio (no stretched or squashed entries)?
- Are any screenshots obviously older than the rest (different cookie-banner behaviour, different font-load states)?
- Are the ratings spread across the scale, or do they cluster at 6–7?

A healthy gallery shows a range of 3 to 9 across the set. A gallery where every rating is 6.5 or 7 is a symptom of scoring caution, not of an unusually uniform category — redo the rubric pass and push yourself to score both lower and higher.

### 13.2 The "tool-run evidence" test

Pick three records at random. For each, can you produce:

- A WAVE or axe screenshot showing the tool output, or a cited rule ID in the notes?
- A specific contrast ratio to one decimal place?
- A stopwatch time for each of the three buyer intents?

If two of three fail any of these, Accessibility and UI Clarity across the set were likely scored from gut feel. Re-run those two dimensions for every record with the tools actually running.

### 13.3 The "read at random" test

Pick three records at random. For each:

- Does `website_design_notes` name a specific defect a reviewer could verify in 60 seconds?
- Is `website_design_rating` backed by the per-dimension scores in your working log?
- Does the screenshot at `website_screenshot_path` actually exist at that path, and is it 1440×900 at 2× DPI?

If two of three fail, your notes or your screenshot pipeline has a systemic issue; fix it across the set, not just on the three you tested.

### 13.4 The "self-audit honesty" test

Look at the self-audit in `market-intelligence.json`. Two questions:

- Did you score our site on exactly the same rubric — same anchors, same tool-run for Accessibility, same stopwatch for UI Clarity — that you applied to competitors? If you were gentler on us (scored 7 for what would be a 5 on a competitor), that is a calibration failure that will mis-state our design debt.
- Did you flag every dimension where we are ≥ 2 points below the top competitor? Or did you soften the flag because it's uncomfortable?

A well-run self-audit often produces 1–3 design-debt flags for a reasonable-quality site, and more for a weak site. Zero flags on a site that isn't a state-of-the-art reference (Linear, Stripe) is a symptom of softening, not of a genuinely flawless site.

## Handoff to downstream agents

### 11.1 To Agent 6 (Visualisation Designer)

Agent 6 renders the `design-audit.html` gallery directly from `competitors.json`. It reads:

- `name`, `url`, `website_design_rating`, `website_design_notes`, `website_screenshot_path`.

For the gallery to look right, every record needs a populated `website_screenshot_path` (or an explicit empty-string with notes explaining why). Agent 6 does not read the per-dimension breakdown from your working log; if you want dimension-level rendering, escalate to Agent 7 to add dimension fields to the dictionary.

Things that will break Agent 6's render and that you must prevent:

- **Missing screenshot files.** The path is in the JSON but the file is not in `/template/assets/screenshots/`. Check that every reserved path resolves to an actual file on disk.
- **Inconsistent viewport.** A gallery with one 1440×900 shot and one 1920×1080 shot looks ragged. Enforce the 1440×900 standard before handoff.
- **Null ratings with non-empty notes.** A rating of `null` with notes like "site was down" is fine (and documented in the dictionary), but make sure the notes are substantive enough that Agent 6 can render a meaningful tombstone.

### 11.2 To Agent 8 (Report Author)

Agent 8 writes Section 8 of the Report, which is the design-audit summary. It reads:

- The full set of `website_design_rating` values across `competitors.json`.
- The `self_audit.design_debt_flags` array from `market-intelligence.json`.
- Your working-log per-dimension breakdowns if available (optional, but enriches the Section 8 commentary).

What Agent 8 needs from you, specifically: a one-paragraph narrative in the handoff note that answers "what is the design pattern across the set, and where do we stand?" Example:

> "Modernness is the dimension with the widest range (3 to 10) — the category has both 2024-polished leaders and 2016-stale laggards. We score 7 on Modernness, below the top (Linear, 10) but above the median (6). Our worst dimension is Accessibility (5), and the top accessibility score in the set is 9 (Stripe). Accessibility is flagged as our top design debt."

Agent 8 can expand this into Section 8 without re-running the rubric.

## Deliverable checklist

Self-audit against this list before declaring Agent 5 done. Every box must be checked.

- [ ] Every `competitors.json` entry has a non-null `website_design_rating` (a number rounded to the nearest 0.5), **or** a null with an explanation in `website_design_notes` ("site down since 2026-03," "blocked by Cloudflare, unable to audit").
- [ ] Every `competitors.json` entry has a populated `website_design_notes` — substantive (≤ 160 chars, names specific defect) for any entry where a dimension scored ≤ 6, and either substantive or an acceptable empty string for entries scoring > 6 on every dimension.
- [ ] Every `competitors.json` entry has a `website_screenshot_path` that either (a) resolves to an actual file at `/template/assets/screenshots/<id>-home.png`, or (b) is an empty string with an explicit note in `website_design_notes` explaining why the screenshot could not be captured.
- [ ] Every screenshot captured at 1440×900 viewport, 2+ second settle delay, 2× DPI.
- [ ] Every screenshot filename matches the pattern `<competitor_id>-home.png`, using the exact `id` slug from `competitors.json`.
- [ ] Our self-audit recorded in `market-intelligence.json` under `self_audit` (or project-equivalent key), with per-dimension scores, weighted rating, notes, and the `design_debt_flags` array.
- [ ] Our self-audit screenshot captured at `template/assets/screenshots/_us-home.png` (or skipped with explicit note if no live site yet).
- [ ] Every dimension scored ≤ 6 on any record has a corresponding specific entry in that record's `website_design_notes`.
- [ ] Accessibility score for every record is backed by a WAVE or axe DevTools run (not gut-feel), or an explicit note that the tool was blocked.
- [ ] Working log captures per-dimension scores for every record, so Agent 8 can quote them in Section 8.
- [ ] Handoff note prepared for Agents 6 and 8: design pattern across the set, our relative position, our top design-debt flag.

If any item fails, fix before handing off. Agent 6's gallery and Agent 8's Section 8 both read from these fields as ground truth; a half-finished audit produces a gallery with visible gaps and a Report section that glosses over our real design debt.
