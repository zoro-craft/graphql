import { svgElement } from '../utils/svg.js';
import { createElement, showEmptyState } from '../utils/dom.js';

// a colored dot plus its label in the chart legend.
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

// percentage of the total, for the legend.
function percentOf(share, total) {
  return Math.round((share / total) * 1000) / 10;
}

export function renderDonut(container, data) {
  container.textContent = '';

  const segments = data.segments || [];
  const total = segments.reduce((sum, segment) => sum + (segment.value || 0), 0);

  // nothing to draw when there are no audits.
  if (total <= 0) {
    showEmptyState(container, 'No audit data to display.');
    return;
  }

  const succeeded = segments[0].value || 0;
  const failed = segments[1].value || 0;

  // pathLength=100 makes dasharray values plain percentages.
  const succeededPercent = (succeeded / total) * 100;

  const svg = svgElement('svg', {
    class: 'donut-chart',
    viewBox: '0 0 200 200',
    role: 'img',
    'aria-label': 'Audit results: ' + succeeded + ' succeeded, ' + failed + ' failed'
  });

  // full failed ring underneath; succeeded ring leaves a gap.
  svg.append(
    svgElement('circle', {
      class: 'donut-ring donut-ring-failed',
      cx: 100,
      cy: 100,
      r: 80,
      fill: 'none',
      'stroke-width': 36,
      pathLength: 100
    }),
    svgElement('circle', {
      class: 'donut-ring donut-ring-succeeded',
      cx: 100,
      cy: 100,
      r: 80,
      fill: 'none',
      'stroke-width': 36,
      pathLength: 100,
      // dash = succeeded share, gap = the rest.
      'stroke-dasharray': succeededPercent + ' ' + (100 - succeededPercent),
      // rotate so the arc starts at 12 o'clock.
      transform: 'rotate(-90 100 100)'
    })
  );

  const legend = createElement('div', {
    className: 'chart-legend',
    children: [
      legendItem('succeeded', succeeded, percentOf(succeeded, total), 'legend-swatch-succeeded'),
      legendItem('failed', failed, percentOf(failed, total), 'legend-swatch-failed')
    ]
  });

  container.append(svg, legend);
}
