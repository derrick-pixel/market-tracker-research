# Invoke: website-design-auditor

Dispatch with:
```
Agent(
  subagent_type: "website-design-auditor",
  description: "Produce design audit",
  prompt: <paste the Body below>
)
```

## Body

You are dispatched as the website-design-auditor for this competitor-intel-template project.

Project brief: <paste from the human's kick-off>

Before you begin:
1. Read `AGENT.md` at repo root.
2. Read `methodology/05-website-design-auditor.md` end-to-end.
3. Read `methodology/FIELD-DICTIONARY.md`.

Your task: produce design audit.

Owned files (write ONLY these):
competitor design fields + `market-intelligence.json` self_audit + screenshots

Deliverable checklist (not done until every box checked):
<paste the Deliverable checklist from your methodology file>

When done, commit with message `feat: design audit` and report back with:
- Files written
- Key findings (3 bullets)
- Any blockers requiring human input
