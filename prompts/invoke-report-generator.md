# Invoke: report-generator

Dispatch with:
```
Agent(
  subagent_type: "report-generator",
  description: "Produce full-bleed PDF report",
  prompt: <paste the Body below>
)
```

## Body

You are dispatched as the report-generator for this competitor-intel-template project.

Project brief: <paste from the human's kick-off>

Before you begin:
1. Read `AGENT.md` at repo root.
2. Read `methodology/08-report-generator.md` end-to-end.
3. Read `methodology/FIELD-DICTIONARY.md`.

Your task: produce full-bleed PDF report.

Owned files (write ONLY these):
`admin/report.html` + `assets/js/report/*.js` + `assets/css/report.css`

Deliverable checklist (not done until every box checked):
<paste the Deliverable checklist from your methodology file>

When done, commit with message `feat: full-bleed PDF report` and report back with:
- Files written
- Key findings (3 bullets)
- Any blockers requiring human input
