import { svgElement } from '../utils/svg.js';
import { showEmptyState } from '../utils/dom.js';
import { formatXP } from '../utils/format.js';

// the drawing area, in viewBox units.

const SVG_WIDTH = 800;
const AXIS_GUTTER = 64; // left strip that holds the y axis and the "0" label
const RIGHT_MARGIN = 20; // small air gap so the last bar is not flush to the edge
const TOP_ROOM = 44; // headroom above the tallest bar, for its value label
const PLOT_HEIGHT = 240; // vertical range the bars are drawn into
const BOTTOM_PAD = 24; // fixed air under the axis line

export function renderBar(container, data) {
  container.textContent = '';

  const projects = data.projects || [];
  if (projects.length === 0) {
    showEmptyState(container, 'No project XP data to display.');
    return;
  }

// reserve room below the chart for the tilted name labels.
  const longestName = projects.reduce(
    (longest, project) => Math.max(longest, String(project.name).length),
    0
  );
  const nameDrop = longestName * 5;
  const height = TOP_ROOM + PLOT_HEIGHT + BOTTOM_PAD + nameDrop;

  // bars are sized relative to the tallest one.
  const maxXp = projects.reduce((max, project) => Math.max(max, project.xp), 0);

  const plotWidth = SVG_WIDTH - AXIS_GUTTER - RIGHT_MARGIN;
  const slotWidth = plotWidth / projects.length;

  // each bar takes part of its slot, capped at 48.
  const barWidth = Math.min(48, Math.max(4, slotWidth * 0.6));

  // the horizontal line that the bars grow up from.
  const baseline = TOP_ROOM + PLOT_HEIGHT;

  // label font scales with slot width, clamped 7-9.
  const fontSize = Math.max(7, Math.min(9, Math.floor(slotWidth * 0.35)));

  const svg = svgElement('svg', {
    class: 'bar-chart',
    viewBox: '0 0 ' + SVG_WIDTH + ' ' + height,
    role: 'img',
    'aria-label': 'Bar chart of XP earned per project'
  });

  // y axis: the vertical line on the left edge of the plot.
  svg.append(
    svgElement('line', {
      class: 'chart-axis',
      x1: AXIS_GUTTER,
      y1: TOP_ROOM,
      x2: AXIS_GUTTER,
      y2: baseline
    }),
    // x axis: the horizontal line along the bottom of the plot.
    svgElement('line', {
      class: 'chart-axis',
      x1: AXIS_GUTTER,
      y1: baseline,
      x2: SVG_WIDTH - RIGHT_MARGIN,
      y2: baseline
    })
  );

  // "0" label at the foot of the y axis.
  const zeroLabel = svgElement('text', {
    class: 'axis-label',
    x: AXIS_GUTTER - 8,
    y: baseline + 4,
    'text-anchor': 'end',
    'font-size': fontSize
  });
  zeroLabel.textContent = '0';
  svg.append(zeroLabel);

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];

    // horizontal middle of this bar's slot.
    const barCenterX = AXIS_GUTTER + i * slotWidth + slotWidth / 2;
    // bar height relative to the tallest bar.
    const barHeight = (project.xp / maxXp) * PLOT_HEIGHT;
    const barTop = baseline - barHeight;

    // the bar itself.
    svg.append(
      svgElement('rect', {
        class: 'bar-rect',
        x: barCenterX - barWidth / 2,
        y: barTop,
        width: barWidth,
        height: barHeight
      })
    );

    // value above the bar, tilted 45°.
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

    // tilted project name below the bar.
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
