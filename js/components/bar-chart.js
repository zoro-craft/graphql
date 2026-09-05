import { svgElement } from '../utils/svg.js';
import { showEmptyState } from '../utils/dom.js';
import { formatXP } from '../utils/format.js';

// Chart layout in SVG units. The viewBox scales the chart to fit any width.
const WIDTH = 800;
const PADDING_TOP = 44;
const PADDING_RIGHT = 20;
const PADDING_LEFT = 64;
const PLOT_HEIGHT = 240;

export function renderBar(container, data) {
  container.textContent = '';

  const projects = data.projects || [];
  if (projects.length === 0) {
    showEmptyState(container, 'No project XP data to display.');
    return;
  }

  // Room below the plot for the longest (rotated) project name.
  const longestName = projects.reduce(
    (longest, project) => Math.max(longest, String(project.name).length),
    0
  );
  // A -45° rotated label of length L drops roughly L * 0.7 below its anchor point.
  const labelDrop = Math.round(longestName * 7 * 0.7);
  const height = PADDING_TOP + PLOT_HEIGHT + 24 + labelDrop;

  // The tallest bar defines the scale of the y axis.
  const maxXp = projects.reduce((max, project) => Math.max(max, project.xp), 0);

  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const slotWidth = plotWidth / projects.length;

  // Keep bars a reasonable size no matter how many projects there are.
  const barWidth = Math.min(48, Math.max(4, slotWidth * 0.6));

  const baseline = PADDING_TOP + PLOT_HEIGHT;

  // Smaller font when there are many bars so the labels never collide.
  const fontSize = Math.max(7, Math.min(9, Math.floor(slotWidth * 0.35)));

  const svg = svgElement('svg', {
    class: 'bar-chart',
    viewBox: '0 0 ' + WIDTH + ' ' + height,
    role: 'img',
    'aria-label': 'Bar chart of XP earned per project'
  });

  // Y axis, the vertical line on the left of the plot.
  svg.append(
    svgElement('line', {
      class: 'chart-axis',
      x1: PADDING_LEFT,
      y1: PADDING_TOP,
      x2: PADDING_LEFT,
      y2: baseline
    }),
    // X axis, the horizontal line along the bottom of the plot.
    svgElement('line', {
      class: 'chart-axis',
      x1: PADDING_LEFT,
      y1: baseline,
      x2: WIDTH - PADDING_RIGHT,
      y2: baseline
    })
  );

  // "0" label at the bottom of the y axis.
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
    const barHeight = (project.xp / maxXp) * PLOT_HEIGHT;
    const barTop = baseline - barHeight;

    // The bar itself, sized relative to the tallest project.
    svg.append(
      svgElement('rect', {
        class: 'bar-rect',
        x: barCenterX - barWidth / 2,
        y: barTop,
        width: barWidth,
        height: barHeight
      })
    );

    // Value above the bar, formatted by the shared XP formatter.
    const valueLabel = svgElement('text', {
      class: 'bar-value',
      x: barCenterX,
      y: barTop - 4,
      'text-anchor': 'start',
      'font-size': fontSize,
      transform: 'rotate(-45 ' + barCenterX + ' ' + (barTop - 4) + ')'
    });
    valueLabel.textContent = formatXP(project.xp);
    svg.append(valueLabel);

    // Project name below the bar.
    const nameLabel = svgElement('text', {
      class: 'bar-label',
      x: barCenterX,
      y: baseline + 14,
      'text-anchor': 'end',
      'font-size': fontSize,
      transform: 'rotate(-45 ' + barCenterX + ' ' + (baseline + 14) + ')'
    });
    nameLabel.textContent = String(project.name);
    svg.append(nameLabel);
  }

  container.append(svg);
}