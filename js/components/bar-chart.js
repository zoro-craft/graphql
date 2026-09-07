import { svgElement } from '../utils/svg.js';
import { showEmptyState } from '../utils/dom.js';
import { formatXP } from '../utils/format.js';

// the drawing area in viewBox units (the whole chart scales to the card): bars grow up from the baseline over PLOT_HEIGHT, TOP_ROOM holds their value labels, names hang below, and the y axis + its "0" live in the AXIS_GUTTER.

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

// name labels are tilted 45°, so each character of the longest name needs about 5 units of vertical room below the baseline (~7 wide x sin(45°)); reserve that for the chart height.
  const longestName = projects.reduce(
    (longest, project) => Math.max(longest, String(project.name).length),
    0
  );
  const nameDrop = Math.round(longestName * 5);
  const height = TOP_ROOM + PLOT_HEIGHT + BOTTOM_PAD + nameDrop;

  // the tallest bar defines the scale of the y axis: it fills the whole plot height, and every other bar is sized proportionally to it.
  const maxXp = projects.reduce((max, project) => Math.max(max, project.xp), 0);

  const plotWidth = SVG_WIDTH - AXIS_GUTTER - RIGHT_MARGIN;
  const slotWidth = plotWidth / projects.length;

  // each bar occupies part of its own slot, never the whole slot, so neighbouring bars (and labels) keep a visible gap; capped at 48.
  const barWidth = Math.min(48, Math.max(4, slotWidth * 0.6));

  // the horizontal line that the bars grow up from.
  const baseline = TOP_ROOM + PLOT_HEIGHT;

  // scale the label font with the slot width, clamped between 7 and 9, so labels stay readable but shrink when many narrow bars would crowd them.
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
    // bar height relative to the tallest bar, so xp = maxXp fills the plot.
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

    // value shown just above the bar, formatted by the shared xp formatter, tilted 45° so it points along the bar.
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

    // project name hanging below the axis, tilted so long names do not collide with their neighbours.
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
