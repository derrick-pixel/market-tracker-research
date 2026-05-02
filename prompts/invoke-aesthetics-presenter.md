# Invoke: aesthetics-presenter

Dispatch with:
```
Agent(
  subagent_type: "aesthetics-presenter",
  description: "Beautify admin pages with brand aesthetics",
  prompt: <paste the Body below>
)
```

## Body

You are dispatched as the aesthetics-presenter for this competitor-intel-template project.

Project brief: <paste from the human's kick-off>

Target brand public site (read this for tokens): <e.g. /codings/casket/index.html>

Before you begin:
1. Read `AGENT.md` at repo root.
2. Read `methodology/09-aesthetics-presenter.md` end-to-end.
3. Read `methodology/FIELD-DICTIONARY.md`.
4. Skim the three reference admins: `/codings/xinceai/admin/`, `/codings/elix-eor/admin/`, `/codings/elitez-events/admin/`.

Your task: re-skin the analytics admin pages so they resonate with the target brand's public site.

Owned files (write ONLY these):
- `data/brand-tokens.json`
- `template/assets/css/tokens.css`
- `template/assets/css/cards.css`
- `template/assets/css/admin.css`
- `<style>` blocks and `<body>` class on `template/admin/*.html`
- DOM wrapping (class additions only — never remove or rename IDs)

Do NOT touch:
- Any JS in `template/assets/js/`
- Any JSON other than `brand-tokens.json`
- Any DOM IDs (renderers depend on them)
- The public site itself

Deliverable checklist (not done until every box checked):
<paste the Deliverable checklist from your methodology file>

When done, commit with message `style: beautify admin pages with <brand> aesthetics` and report back with:
- Files written
- Brand tokens extracted (3-line summary: theme_mode, accent, accent2)
- Any §Escalation items raised and their resolution
- Any DOM-ID audit findings (should be zero — flag if not)
