const SVG_NS = 'http://www.w3.org/2000/svg';

const WIDTH = 800;
const PADDING_TOP = 44;
const PADDING_RIGHT = 20;
const PADDING_LEFT = 64;
const PLOT_HEIGHT = 240;

function svgElement(name, attributes) {
  const element = document.createElementNS(SVG_NS, name);
  const keys = Object.keys(attributes);
  for (let i = 0; i < keys.length; i++) {
    element.setAttribute(keys[i], attributes[keys[i]]);
  }
  return element;
}

function emptyState(container, message) {
  const empty = document.createElement('p');
  empty.className = 'state-message';
  empty.textContent = message;
  container.append(empty);
}

export function renderBar(container, data) {
  container.textContent = '';

  const projects = data.projects || [];

  if (projects.length === 0) {
    emptyState(container, 'No project XP data to display.');
    return;
  }

  let longestName = 0;
  for (let i = 0; i < projects.length; i++) {
    const name = String(projects[i].name);
    if (name.length > longestName) {
      longestName = name.length;
    }
  }

  // A -45° rotated label of length L drops roughly L * 0.7 below its anchor point,
  // so give the bottom enough room for the longest project name.
  const labelDrop = Math.round(longestName * 7 * 0.7);
  const paddingBottom = 24 + labelDrop;
  const height = PADDING_TOP + PLOT_HEIGHT + paddingBottom;

  let maxXp = 0;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].xpKB > maxXp) {
      maxXp = projects[i].xpKB;
    }
  }

  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const slotWidth = plotWidth / projects.length;
  let barWidth = slotWidth * 0.6;
  if (barWidth < 4) barWidth = 4;
  if (barWidth > 48) barWidth = 48;
  const baseline = PADDING_TOP + PLOT_HEIGHT;

  // Smaller font when there are many bars so labels never collide.
  const fontSize = Math.max(7, Math.min(9, Math.floor(slotWidth * 0.35)));

  const svg = svgElement('svg', {
    class: 'bar-chart',
    viewBox: '0 0 ' + WIDTH + ' ' + height,
    role: 'img',
    'aria-label': 'Bar chart of XP earned per project'
  });

  const yAxis = svgElement('line', {
    class: 'chart-axis',
    x1: PADDING_LEFT,
    y1: PADDING_TOP,
    x2: PADDING_LEFT,
    y2: baseline
  });

  const xAxis = svgElement('line', {
    class: 'chart-axis',
    x1: PADDING_LEFT,
    y1: baseline,
    x2: WIDTH - PADDING_RIGHT,
    y2: baseline
  });

  svg.append(yAxis, xAxis);

  const zeroLabel = svgElement('text', {
    class: 'axis-label',
    x: PADDING_LEFT - 8,
    y: baseline + 4,
    'text-anchor': 'end',
    'font-size': fontSize
  });
  zeroLabel.textContent = '0';

  svg.append(zeroLabel);

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const barCenterX = PADDING_LEFT + i * slotWidth + slotWidth / 2;
    const barHeight = (project.xpKB / maxXp) * PLOT_HEIGHT;
    const barY = baseline - barHeight;

    const rect = svgElement('rect', {
      class: 'bar-rect',
      x: barCenterX - barWidth / 2,
      y: barY,
      width: barWidth,
      height: barHeight
    });

    const valueLabel = svgElement('text', {
      class: 'bar-value',
      x: barCenterX,
      y: barY - 4,
      'text-anchor': 'start',
      'font-size': fontSize,
      transform: 'rotate(-45 ' + barCenterX + ' ' + (barY - 4) + ')'
    });
    valueLabel.textContent = String(project.xpKB);

    const nameLabel = svgElement('text', {
      class: 'bar-label',
      x: barCenterX,
      y: baseline + 14,
      'text-anchor': 'end',
      'font-size': fontSize,
      transform: 'rotate(-45 ' + barCenterX + ' ' + (baseline + 14) + ')'
    });
    nameLabel.textContent = String(project.name);

    svg.append(rect, valueLabel, nameLabel);
  }

  container.append(svg);
}