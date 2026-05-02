// radar.js — Chart.js radar builder. "us" gets thick + filled styling.

const PALETTE = [
  'rgba(46,107,255,1)', 'rgba(239,68,68,1)', 'rgba(34,197,94,1)',
  'rgba(168,85,247,1)', 'rgba(236,72,153,1)', 'rgba(6,182,212,1)',
  'rgba(245,158,11,1)', 'rgba(16,185,129,1)', 'rgba(99,102,241,1)',
  'rgba(120,53,15,1)'
];

const US_COLOR = 'rgba(255,179,71,1)';
const US_FILL  = 'rgba(255,179,71,0.35)';

export function buildRadarData({ dimensions, scores }) {
  const labels = dimensions.map(d => d.label);
  const ids = Object.keys(scores);
  const ordered = ['us', ...ids.filter(k => k !== 'us')];

  const datasets = ordered.map((id, i) => {
    const isUs = id === 'us';
    const data = dimensions.map(d => scores[id]?.[d.key] ?? 0);
    const color = isUs ? US_COLOR : PALETTE[(i - 1) % PALETTE.length];
    return {
      label: id, data,
      borderColor: color,
      backgroundColor: isUs ? US_FILL : color.replace(',1)', ',0.1)'),
      borderWidth: isUs ? 3 : 1.5,
      fill: isUs,
      pointRadius: isUs ? 4 : 2,
    };
  });

  return { labels, datasets };
}

export function renderRadar({ canvas, dimensions, scores, max = 5 }) {
  const ctx = canvas.getContext('2d');
  const data = buildRadarData({ dimensions, scores });
  // eslint-disable-next-line no-undef
  return new Chart(ctx, {
    type: 'radar',
    data,
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true, min: 0, max,
          ticks: { display: false, stepSize: 1 },
          pointLabels: { font: { size: 13, weight: '500' } },
          grid: { color: 'rgba(0,0,0,0.08)' },
          angleLines: { color: 'rgba(0,0,0,0.08)' },
        }
      },
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 16, padding: 8 } },
        tooltip: { enabled: true },
      }
    }
  });
}
