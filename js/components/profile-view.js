import { renderDonut } from './donut-chart.js';
import { renderBar } from './bar-chart.js';
import { createElement } from '../utils/dom.js';
import { formatRatio, formatXP } from '../utils/format.js';

// one labeled row inside the identification card.
function identificationRow(termText, valueText) {
  return createElement('div', {
    className: 'identification-row',
    children: [
      createElement('dt', { text: termText }),
      createElement('dd', { text: valueText })
    ]
  });
}

// total xp is a raw byte count; keep the dash when missing.
function formatXp(value) {
  return value === '-' ? '-' : formatXP(value);
}

function renderIdentification(container, data) {
  container.textContent = '';

  // show the avatar only when the api returned a photo.
  if (data.photo && data.photo !== '-') {
    const avatar = createElement('img', {
      className: 'avatar',
      attributes: { src: data.photo, alt: 'Profile photo', width: 96, height: 96 }
    });
    container.append(createElement('div', { className: 'avatar-wrap', children: [avatar] }));
  }

  const list = createElement('dl', {
    className: 'identification-list',
    children: [
      identificationRow('Username', data.username),
      identificationRow('Cohort', data.cohort),
      identificationRow('Total XP', formatXp(data.totalXp)),
      identificationRow('Level', data.level),
      identificationRow('Audit ratio', formatRatio(data.auditRatio))
    ]
  });

  container.append(list);
}

export function renderLogoutButton(container, onLogout) {
  const button = createElement('button', {
    className: 'logout-button',
    attributes: { type: 'button' },
    text: 'Log out',
    events: { click: onLogout }
  });

  container.textContent = '';
  container.append(button);
  container.hidden = false;
}

// render every section of the profile screen.
export function renderProfileView(options) {
  renderIdentification(options.identificationSection, options.identification);
  renderDonut(options.donutContainer, options.donut);
  renderBar(options.barContainer, options.bar);
}