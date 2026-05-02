// pdf-generator.js — rasterise each .pdf-page into an A4 PDF (full-bleed).
// Depends on global html2canvas and jspdf.jsPDF loaded via <script> tags.
//
// Size tuning: scale 1.0 + JPEG 0.62 + compress:true + FAST image pipeline
// keeps a 15-page sample report under ~800 KB while staying legible on screen
// at 100% zoom. Chart.js canvases are already rendered at devicePixelRatio,
// so scale 1.0 still downsamples crisp charts. Bump scale to 1.5 if the
// report will be printed at letter/A4 size and text edges look soft.
//
// Pre-flight Phase 4 runs before the rasterise loop. See preflight-dom.js
// and methodology/08-report-generator.md §Pre-flight Phase 4.

import { validateDOM, formatViolations } from './preflight-dom.js';

export class PreflightError extends Error {
  constructor(violations) {
    super(`Phase 4 pre-flight failed (${violations.length} violation${violations.length === 1 ? '' : 's'})`);
    this.name = 'PreflightError';
    this.violations = violations;
  }
}

export async function generatePDF({ root, data, filename, onProgress }) {
  const result = validateDOM(root, data);
  if (!result.ok) {
    console.error('[Phase 4] pre-flight violations:\n' + formatViolations(result.violations));
    throw new PreflightError(result.violations);
  }

  // eslint-disable-next-line no-undef
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

  const pages = root.querySelectorAll('.pdf-page');
  const total = pages.length;
  for (let i = 0; i < total; i++) {
    const pg = pages[i];
    // scale: 2 per methodology §Full-bleed implementation — gives html2canvas
    // 4× the pixel headroom per glyph, which is the difference between
    // "spaces sometimes round into adjacent characters" and "spaces always
    // render at their measured width". File size grows ~3× but stays under
    // the 10 MB cap on a 30-competitor sample.
    // eslint-disable-next-line no-undef
    const canvas = await html2canvas(pg, {
      scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      width: pg.offsetWidth, height: pg.offsetHeight
    });
    const imgData = canvas.toDataURL('image/jpeg', 0.62);
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    onProgress?.(i + 1, total);
  }
  pdf.save(filename);
}
