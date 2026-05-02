// donut.js — target-market distribution donut.

export function renderMarketDonut({ canvas, competitors }) {
  const counts = {};
  for (const c of competitors) for (const m of (c.target_market || [])) {
    counts[m] = (counts[m] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{ data: entries.map(e => e[1]), backgroundColor: ['#2E6BFF','#FFB347','#EF4444','#22C55E','#A855F7','#EC4899','#06B6D4','#F59E0B'] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
  });
}
