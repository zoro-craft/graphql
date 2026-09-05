import { svgElement } from '../utils/svg.js';
import { formatXP } from '../utils/format.js';

const WIDTH = 800;
const PADDING_TOP = 44;
const PADDING_RIGHT = 20;
const PADDING_LEFT = 64;
const PLOT_HEIGHT = 240;

export function renderBar(container, data) {
  container.textContent = '';

  const projects = data.projects || [];

  let maxXp = 0;
  for (let i = 0; i < projects.length; i++) {
    if (projects[i].xp > maxXp) {
      maxXp = projects[i].xp;
    }
  }

  const plotWidth = WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const slotWidth = plotWidth / projects.length;
  const barWidth = Math.min(48, Math.max(4, slotWidth * 0.6));
  const baseline = PADDING_TOP + PLOT_HEIGHT;

  const svg = svgElement('svg', {
    class: 'bar-chart',
    viewBox: '0 0 ' + WIDTH + ' ' + (PADDING_TOP + PLOT_HEIGHT + 24),
    role: 'img',
    'aria-label': 'Bar chart of XP earned per project'
  });

  svg.append(
    svgElement('line', {
      class: 'chart-axis',
      x1: PADDING_LEFT,
      y1: PADDING_TOP,
      x2: PADDING_LEFT,
      y2: baseline
    }),
    svgElement('line', {
      class: 'chart-axis',
      x1: PADDING_LEFT,
      y1: baseline,
      x2: WIDTH - PADDING_RIGHT,
      y2: baseline
    })
  );

  for (let i = 0; i < projects.length; i++) {
    const project = projects[i];
    const barCenterX = PADDING_LEFT + i * slotWidth + slotWidth / 2;
    const barHeight = (project.xp / maxXp) * PLOT_HEIGHT;
    const barTop = baseline - barHeight;

    svg.append(
      svgElement('rect', {
        class: 'bar-rect',
        x: barCenterX - barWidth / 2,
        y: barTop,
        width: barWidth,
        height: barHeight
      })
    );

    const valueLabel = svgElement('text', {
      class: 'bar-value',
      x: barCenterX,
      y: barTop - 4,
      'text-anchor': 'start',
      transform: 'rotate(-45 ' + barCenterX + ' ' + (barTop - 4) + ')'
    });
    valueLabel.textContent = String(project.xp);

    const nameLabel = svgElement('text', {
      class: 'bar-label',
      x: barCenterX,
      y: baseline + 14,
      'text-anchor': 'end',
      transform: 'rotate(-45 ' + barCenterX + ' ' + (baseline + 14) + ')'
    });
    nameLabel.textContent = String(project.name);

    svg.append(valueLabel, nameLabel);
  }

  container.append(svg);
}