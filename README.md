# Market Tracker — Competitor &amp; Market Intelligence

Live competitor + market intelligence research for **Market Tracker** (Elitez Asia), an AI-narrated equity-analytics product that runs four Chicago Booth EMBA modules — Corporate Finance, Financial Strategy, Operations Management, Competitive Strategy — on live S&amp;P 500 fundamentals.

- **Live product** → [elitez-market.streamlit.app](https://elitez-market.streamlit.app/)
- **Research site** → [derrick-pixel.github.io/market-tracker-research](https://derrick-pixel.github.io/market-tracker-research/) — pit-floor terminal aesthetic, six admin views.

## What's in /template/admin

Six admin views, all driven from typed JSON in `/template/data/*.json`:

- `insights-terminal.html` — **Pit Floor**. Bloomberg-style derivation cascade for TAM/SAM/SOM, persona instrument cards, tier order book, country-readiness futures grid. The headline view.
- `index.html` — **Overview / Roster**. KPI strip, top-5 threats, market sizing funnel, full competitor database with searchable rows.
- `insights.html` — **Canonical insights**. Segment-level competitive observations and structured implications for downstream agents.
- `whitespace.html` — **Whitespace atlas**. Strategy canvas, segment × need heatmap, five ranked attack plans.
- `report.html` — **Board-grade synthesis**. Printable single-document export.
- `design-audit.html` — **Design rubric**. 5-dimension scorecard across the competitor field.

## Methodology summary

Built on the [`derrick-pixel/competitor-intel-template`](https://github.com/derrick-pixel/competitor-intel-template) nine-agent pipeline. Each agent reads its paired `methodology/0N-<slug>.md` brief, writes to its slice of `/template/data/`, and the template renderer reads the JSON live in the browser. No build step.

## Headline numbers

- **TAM** S$18.0B — global retail-investor research-tools spend.
- **SAM** S$220M — SE-Asia self-directed prosumers + EMBA framework-curious cohort.
- **SOM** S$6.8M (3-yr cumulative) — Elitez-channel-led capture.
- **Top-5 threats** — Simply Wall St, Koyfin, Stock Rover, Damodaran NYU spreadsheets, Yahoo Finance. (Damodaran is the largest 'competitor' by mass — the EMBA buyer already has it.)
- **Recommended pricing** — Free guest tier (S&amp;P 500 only) → Pro consumer S$29/mo → Team boutique-fund S$199/mo (3 seats) → EMBA Cohort site licence S$4,500/yr.

## Stack

Vanilla HTML5 + ES2020 + Chart.js + html2canvas + jsPDF. No build step, no framework. Tests: Node 20+ `node:test`.

## License

MIT © 2026 Derrick Teo
