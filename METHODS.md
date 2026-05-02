# METHODS.md — methodology changelog

Append-only log of changes to methodology, agents, or scaffold. Entries added by Methodology Curator (Agent 7) after human approval.

## v0.1.0 — 2026-04-24 — initial release

- Eight agents established (see `AGENT.md`).
- Sample dataset: fictional collaborative note-taking SaaS, 30 competitors, 63% SEA-weighted.
- Strategy canvas: Chart.js radar, 8-dimension default, `"us"` line thick/filled, `headline_thesis` field required.
- Heatmap: HTML+CSS grid, tri-colour banding (green ≤ 1, amber 2–3, red ≥ 4) derived from `score ≥ 3` at render time. Cell-detail with pair-specific `specialisation_for_cell`.
- Report Generator: html2canvas + jsPDF, full-bleed, auto-TOC, design-token skinned, Cell Detail Appendix for heatmap.
- XSS-safe rendering convention: `h()` helper, no HTML-string setters anywhere.
