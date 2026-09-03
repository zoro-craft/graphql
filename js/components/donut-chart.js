const SVG_NS = 'http://www.w3.org/2000/svg';

function svgElement(name, attributes) {
  const element = document.createElementNS(SVG_NS, name);
  const keys = Object.keys(attributes);
  for (let i = 0; i < keys.length; i++) {
    element.setAttribute(keys[i], attributes[keys[i]]);
  }
  return element;
}

function legendItem(label, value, percentage, swatchClass) {
  const item = document.createElement('div');
  item.className = 'legend-item';

  const swatch = document.createElement('span');
  swatch.className = 'legend-swatch ' + swatchClass;
  item.append(swatch);

  const text = document.createElement('span');
  text.className = 'legend-text';
  text.textContent = label + ': ' + value + ' (' + percentage + '%)';
  item.append(text);

  return item;
}

function emptyState(container, message) {
  const empty = document.createElement('p');
  empty.className = 'state-message';
  empty.textContent = message;
  container.append(empty);
}

export function renderDonut(container, data) {
  container.textContent = '';

  const segments = data.segments || [];
  let total = 0;
  for (let i = 0; i < segments.length; i++) {
    total = total + (segments[i].value || 0);
  }

  if (total <= 0) {
    emptyState(container, 'No audit data to display.');
    return;
  }

  const succeeded = segments[0] ? segments[0].value || 0 : 0;
  const failed = segments[1] ? segments[1].value || 0 : 0;
  const succeededPercent = Math.round((succeeded / total) * 1000) / 10;
  const failedPercent = Math.round((failed / total) * 1000) / 10;

  const svg = svgElement('svg', {
    class: 'donut-chart',
    viewBox: '0 0 200 200',
    role: 'img',
    'aria-label': 'Audit results: ' + succeeded + ' succeeded, ' + failed + ' failed'
  });

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const succeededArc = (succeeded / total) * circumference;

  const failedRing = svgElement('circle', {
    class: 'donut-ring donut-ring-failed',
    cx: 100,
    cy: 100,
    r: radius,
    fill: 'none',
    'stroke-width': 36,
    'stroke-dasharray': circumference
  });

  const succeededRing = svgElement('circle', {
    class: 'donut-ring donut-ring-succeeded',
    cx: 100,
    cy: 100,
    r: radius,
    fill: 'none',
    'stroke-width': 36,
    'stroke-dasharray': succeededArc + ' ' + (circumference - succeededArc),
    transform: 'rotate(-90 100 100)'
  });

  svg.append(failedRing, succeededRing);

  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.append(
    legendItem('succeeded', data.succeededCount, succeededPercent, 'legend-swatch-succeeded'),
    legendItem('failed', data.failedCount, failedPercent, 'legend-swatch-failed')
  );

  container.append(svg, legend);
}