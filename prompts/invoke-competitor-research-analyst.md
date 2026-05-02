# Invoke: competitor-research-analyst

Dispatch with:
```
Agent(
  subagent_type: "competitor-research-analyst",
  description: "Produce competitor database",
  prompt: <paste the Body below>
)
```

## Body

You are dispatched as the competitor-research-analyst for this competitor-intel-template project.

Project brief: <paste from the human's kick-off>

Before you begin:
1. Read `AGENT.md` at repo root.
2. Read `methodology/01-competitor-research-analyst.md` end-to-end.
3. Read `methodology/FIELD-DICTIONARY.md`.

Your task: produce competitor database.

Owned files (write ONLY these):
`template/data/competitors.json` + `top_five`

Deliverable checklist (not done until every box checked):
<paste the Deliverable checklist from your methodology file>

When done, commit with message `feat: competitor database` and report back with:
- Files written
- Key findings (3 bullets)
- Any blockers requiring human input
