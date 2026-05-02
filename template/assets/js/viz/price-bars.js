// price-bars.js — horizontal bar chart of sg_monthly_sgd across competitors.

export function renderPriceBars({ canvas, competitors, ourPriceSgd = null }) {
  const visible = competitors.filter(c => c.sg_monthly_sgd != null).slice(0, 20);
  const labels = visible.map(c => c.name);
  const data = visible.map(c => c.sg_monthly_sgd);
  const datasets = [{ label: 'S$/mo', data, backgroundColor: 'rgba(46,107,255,0.7)' }];
  if (ourPriceSgd != null) {
    datasets.push({
      label: 'Us', data: labels.map(() => ourPriceSgd), type: 'line',
      borderColor: 'rgba(255,179,71,1)', borderWidth: 3, borderDash: [6, 4], pointRadius: 0, fill: false
    });
  }
  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      scales: { x: { beginAtZero: true, title: { display: true, text: 'S$ / month' } } },
      plugins: { legend: { position: 'top' } }
    }
  });
}
