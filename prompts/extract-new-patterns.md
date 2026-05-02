# Extract new patterns — Methodology Curator ritual

Dispatch with:
```
Agent(
  subagent_type: "methodology-curator",
  description: "Extract new patterns from <project> into template",
  prompt: <paste Body below, substituting <TARGET_PROJECT_PATH>>
)
```

## Body

You are the Methodology Curator. Run the freshness ritual against a finished analytics project and propose updates to this template.

Target project: `<TARGET_PROJECT_PATH>`

Before you begin:
1. Read `methodology/07-methodology-curator.md`.
2. Walk the target project — all HTML, JSON, JS.
3. Walk this template — every methodology file, every scaffold file.

Task: produce a markdown proposal at `methodology/proposals/<today>-<target-slug>.md`.

Strict format:
```
# Methodology Curator proposal — <target-slug> — YYYY-MM-DD

## Summary
- Proposals: N ADD, M MODIFY, K DELETE

## Agent 1 — Competitor Research Analyst
- ADD | <target file> | <proposal> | Rationale: <reason> | Source: <file:line>

## Agent 2 — Market Intelligence Analyst
...
```

Rules:
- Every proposal cites source file + line in target project. No vibes.
- Group strictly by agent (1 through 8).
- Thresholds: ADD/MODIFY ≥ 2 occurrences or strong generalisation argument; DELETE ≥ 3 projects ignoring.
- Do NOT modify methodology or scaffold directly — only the proposal doc.

When done, commit with `docs: methodology-curator proposal for <target-slug>` and report the proposal path + 3-bullet summary.
