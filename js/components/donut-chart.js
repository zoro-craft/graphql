import { svgElement } from '../utils/svg.js';
import { createElement, showEmptyState } from '../utils/dom.js';

// A colored dot plus its label in the chart legend.
function legendItem(label, value, percentage, swatchClass) {
  return createElement('div', {
    className: 'legend-item',
    children: [
      createElement('span', { className: 'legend-swatch ' + swatchClass }),
      createElement('span', {
        className: 'legend-text',
        text: label + ': ' + value + ' (' + percentage + '%)'
      })
    ]
  });
}

// Percentage of the total, rounded to one decimal.
function percentOf(share, total) {
  return Math.round((share / total) * 1000) / 10;
}

export function renderDonut(container, data) {
  container.textContent = '';

  const segments = data.segments || [];
  const total = segments.reduce((sum, segment) => sum + (segment.value || 0), 0);

  // Nothing to draw when there are no audits.
  if (total <= 0) {
    showEmptyState(container, 'No audit data to display.');
    return;
  }

  const succeeded = segments[0] ? segments[0].value || 0 : 0;
  const failed = segments[1] ? segments[1].value || 0 : 0;

  // Each ring covers a fraction of the circumference proportional to its share.
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const succeededArc = (succeeded / total) * circumference;

  const svg = svgElement('svg', {
    class: 'donut-chart',
    viewBox: '0 0 200 200',
    role: 'img',
    'aria-label': 'Audit results: ' + succeeded + ' succeeded, ' + failed + ' failed'
  });

  // The failed ring is drawn first so the succeeded ring overlaps it on top.
  svg.append(
    svgElement('circle', {
      class: 'donut-ring donut-ring-failed',
      cx: 100,
      cy: 100,
      r: radius,
      fill: 'none',
      'stroke-width': 36,
      'stroke-dasharray': circumference
    }),
    svgElement('circle', {
      class: 'donut-ring donut-ring-succeeded',
      cx: 100,
      cy: 100,
      r: radius,
      fill: 'none',
      'stroke-width': 36,
      'stroke-dasharray': succeededArc + ' ' + (circumference - succeededArc),
      transform: 'rotate(-90 100 100)'
    })
  );

  const legend = createElement('div', {
    className: 'chart-legend',
    children: [
      legendItem('succeeded', data.succeededCount, percentOf(succeeded, total), 'legend-swatch-succeeded'),
      legendItem('failed', data.failedCount, percentOf(failed, total), 'legend-swatch-failed')
    ]
  });

  container.append(svg, legend);
}