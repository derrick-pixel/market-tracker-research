# Agent 0 — Asset Extractor

## 1. Why this agent exists

Every project this template ships has the same opening hour wasted: the human drops a brand deck, a slide PDF, or links to a public site, and an analytics agent then has to manually run `pdftoppm`, `pdfimages`, or eyeball-pick a hex from a screenshot. The Elitez Events build (2026-04-27) burned an hour extracting 30 event photos and a client-logo wall by hand because no agent owned this step.

Agent 0 closes that gap. It runs **before Agent 1** on any project where the human supplied reference materials — PDF deck, slide deck, public site URL, Figma export, brand book — and produces a single canonical artefact: `/template/data/brand-assets.json`. Every later agent that needs a logo, a palette, a typeface, an event photo, or a gradient reads from that one file.

Without Agent 0 the project still works — Agent 9 (Aesthetics Presenter) does a live read of the public site at run time. But Agent 9's read is brittle (the public site can be redesigned mid-project, palette tokens may not be exposed in `:root`), and it never captures imagery, only colour and typography. Agent 0 is the persistent, lossless capture step.

## 2. When to run Agent 0

| Situation | Run Agent 0? |
|---|---|
| Human supplies a PDF deck, slide deck, or brand book | **Yes** |
| Human supplies a live public site URL with rich brand expression | **Yes** |
| Human supplies a Figma file or brand-token export | **Yes** |
| Human gives a one-line brief and no visual references | **No** — Agent 9 does a best-effort live read at the end |
| Quarterly refresh of an existing project | **Re-run if** the brand has been refreshed; otherwise skip |

Agent 0 is **idempotent**: running it twice on the same source produces the same `brand-assets.json` (modulo the `meta.research_date` timestamp). It is safe to re-run.

## 3. Inputs

- **Reference materials** in a `/briefs/` folder at the project root (PDF, JPG, PNG, SVG, MP4 thumbnails) OR
- **A list of URLs** the human pastes in the brief

The agent does not need network access if all references are local files. PDF parsing uses `pdftoppm`, `pdfimages`, `pdfinfo` — all part of poppler. SVG rasterisation uses `rsvg-convert` if needed. JPG/PNG resizing uses `sips` (macOS) or `convert` (ImageMagick).

## 4. Outputs

### 4.1 `/template/data/brand-assets.json`

Schema: `FIELD-DICTIONARY.md §8b`. One file per project.

Required top-level keys: `meta`, `source`, `palette`, `typography`, `logo`. Optional: `imagery[]`.

### 4.2 Asset files committed to the repo

| Asset type | Target path | Notes |
|---|---|---|
| Primary logo (SVG if extractable) | `/template/assets/img/logo.svg` | Vector preferred; rasterise only if no SVG path is recoverable |
| Logo mark / favicon | `/template/assets/img/logo-mark.svg` | Square variant for nav and favicons |
| Logo on dark | `/template/assets/img/logo-light.svg` | If the deck shows a light-on-dark variant |
| Event / lifestyle photography | `/template/assets/img/<slug>.jpg` | Slugs are kebab-case, descriptive (`mandai-colours-of-world`, not `image-12`). JPG quality 76–82, max 1100px on long edge. |
| Composite assets (client logo wall, partner grid) | `/template/assets/img/clients-wall.jpg` | Cropped from deck pages where multiple logos appear together |

Every imagery file is referenced from `brand-assets.json → imagery[].path`. Files not in `imagery[]` should not be committed.

## 5. Method

### 5.1 Extract palette

**From PDF:** open the deck in a viewer, identify pages where brand colours are rendered as solid blocks (cover, divider pages, palette specimens). Pick hex values via:

```bash
# Crop a known-solid page region to a tiny image, sample its average colour
pdftoppm -r 72 -x <px_x> -y <px_y> -W 60 -H 60 -f <page> -l <page> -png deck.pdf out
sips -g pixelHeight -g pixelWidth out-001.png  # confirm crop
# Then use a colour picker or ImageMagick `identify -format "%[pixel:p{0,0}]"`
```

**From a public site:** read `/index.html` for `<style>:root { --brand-*: ... }`. If absent, fetch the rendered CSS via `curl <url> | grep -oE 'background[^;]*' | sort -u` and identify dominant colours.

Capture at minimum: `palette.primary`, `palette.neutral_dark`, `palette.neutral_light`. Optional: `secondary`, `accent`, `gradients[]`.

**Gradients are valuable** — most decks use one or two signature gradients. Capture them as literal CSS strings under `palette.gradients[]` so Agent 9 can re-use them.

### 5.2 Extract typography

**From PDF:** `pdfinfo deck.pdf | grep -i font` and `pdffonts deck.pdf | head` reveal embedded fonts. Pick the headline-weight typeface (Manrope, Playfair, Inter, etc.) and the body face. Default fallback: `'Manrope', 'Helvetica Neue', -apple-system, sans-serif`.

**From a public site:** scrape `<link href="https://fonts.googleapis.com/...">` from `<head>`.

Record under `typography.display`, `typography.body`, optional `typography.weights[]`.

### 5.3 Extract logo

Logos in PDFs come in two forms: vector (in the PDF stream, recoverable as SVG with `pdfimages` or `mutool`) or raster (PNG embedded). Vector recovery is cleaner — try first.

```bash
# Attempt vector extraction
mutool extract deck.pdf  # produces image_NNN.png/svg in cwd
# Check for *.svg in output; rename the logo-shaped one
```

If vector recovery fails, crop the highest-resolution page where the logo appears at a usable size:

```bash
pdftoppm -r 300 -x <px_x> -y <px_y> -W <w> -H <h> -f <page> -l <page> -png deck.pdf logo
```

If the logo is a proprietary mark with custom typography (e.g. the Elitez Events person-glyph T), you may need to **approximate as SVG** by hand — preserve geometry, not pixel-for-pixel fidelity.

Save under `/template/assets/img/logo.svg` (or `.png` fallback). Record path in `logo.svg_path` / `logo.png_path`.

### 5.4 Extract imagery

This is the highest-leverage and most-skipped step. Decks usually contain 10–40 photographs the agent can lift to populate hero blocks, case-study cards, and showcase sections instead of stock placeholders.

```bash
# Probe page contents
pdfinfo deck.pdf | head
pdfimages -list deck.pdf | head -50  # see what's embedded

# Crop event photos from specific pages
pdftoppm -r 120 -x <x> -y <y> -W <w> -H <h> -f <page> -l <page> -jpeg deck.pdf /tmp/crop
sips -Z 1100 -s formatOptions 76 /tmp/crop-001.jpg --out /template/assets/img/<slug>.jpg
```

**Naming convention:** kebab-case slugs that describe content (`dsta-harry-potter`, `henkel-safari`, `nkf-race-2024`), never `image-12` or `IMG_4521`. The slug is the foreign key the human and later agents will use to reference the photo.

Each captured image gets an entry in `imagery[]`:

```json
{
  "slug": "dsta-harry-potter",
  "path": "assets/img/dsta-harry-potter.jpg",
  "caption": "DSTA D&D — Harry Potter immersive theme, 2024",
  "source_page": 12
}
```

**Stop conditions:** capture at most 40 images. Anything more is a bigger problem (decks rarely contain >40 distinct usable photos; 40+ usually means the agent is grabbing every page including text-heavy slides).

### 5.5 Validate before handoff

Run the §6 self-check before writing `brand-assets.json` and committing.

## 6. Self-check before handoff

- [ ] `palette.primary`, `palette.neutral_dark`, `palette.neutral_light` populated
- [ ] All hex values are valid `#RRGGBB` (no shorthand `#RGB`, no named colours, no `rgb(...)`)
- [ ] `typography.display` and `typography.body` populated with full font-stack strings (not just `"Manrope"`)
- [ ] At least one of `logo.svg_path` / `logo.png_path` populated AND the file exists at that path
- [ ] If `logo.svg_path` is set, the SVG renders correctly at 32×32 (favicon size) — many vector extractions break at small sizes
- [ ] Every `imagery[].path` resolves to a file under `/template/assets/img/`
- [ ] No image larger than 600 KB on disk (downscale if so)
- [ ] `meta.sample_data: false`, `meta.research_date` is today's date
- [ ] `source.references[]` cites every reference used (PDF path, public URL)

## 7. Handoff

After Agent 0 commits, downstream agents can read `brand-assets.json` instead of re-deriving brand identity:

- **Agent 5** uses `imagery[]` to know which client-supplied photos exist and skips capturing them as competitor screenshots (avoids accidentally lifting a competitor's marketing photo as the client's). Agent 5 also reads `palette` to detect when a competitor's site uses similar branding (a coherence-test signal).
- **Agent 6** uses `imagery[]` to populate hero/showcase blocks on the public site (`index.html`, `services.html`, `work.html`) and to back service-detail cards. Falls back to placeholder gradients only when `imagery[]` is empty.
- **Agent 8** embeds `logo.svg_path` in the PDF cover page and uses `palette` for full-bleed page backgrounds.
- **Agent 9** prefers `brand-assets.json` over a live read when present (`extracted_from.type: "brand_assets_json"`). The advantage: the project carries its own canonical palette regardless of what happens to the public site mid-project.

## 8. Failure modes

**The deck is image-only (scanned, no extractable structure).** Capture is best-effort: rasterise pages at 300 DPI, crop visually. Vector logo recovery is impossible; record `logo.png_path` only and flag in `logo.usage_notes` that the logo is raster-only.

**The public site is JS-rendered with no `:root` CSS variables.** Agent 9 will fail a live read; Agent 0's persistent capture is the only way to get a palette. Use the rendered DOM via headless browser if available, otherwise sample colours from a screenshot.

**The deck uses CMYK colour profiles.** Most agent outputs are sRGB. Convert via `sips --setProperty colorspace sRGB <input> --out <output>` before sampling hex.

**Multiple logos in the deck (current + legacy + sub-brand).** Capture only the current primary; record alternates in `logo.usage_notes` as a free-text list. Do not commit alternate logos to `/template/assets/img/` unless explicitly requested.

## 9. Re-running

Agent 0 is safe to re-run. Each run produces a fresh `brand-assets.json` with updated `meta.research_date`. The convention: if any field changes between runs, the `notes` field at the top of the file should describe what shifted. Agent 7 (mid-flight mode) flags any case where Agent 0 was last run > 90 days ago and the project is still active.
