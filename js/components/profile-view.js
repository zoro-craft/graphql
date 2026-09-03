import { renderDonut } from './donut-chart.js';
import { renderBar } from './bar-chart.js';

function identificationRow(termText, valueText) {
  const row = document.createElement('div');
  row.className = 'identification-row';

  const term = document.createElement('dt');
  term.textContent = termText;

  const description = document.createElement('dd');
  description.textContent = valueText;

  row.append(term, description);
  return row;
}

function formatXp(value) {
  if (value === '-') {
    return '-';
  }
  return value + ' KB';
}

function renderIdentification(container, data) {
  container.textContent = '';

  if (data.photo && data.photo !== '-') {
    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'avatar-wrap';

    const img = document.createElement('img');
    img.className = 'avatar';
    img.src = data.photo;
    img.alt = 'Profile photo';
    img.width = 96;
    img.height = 96;

    avatarWrap.append(img);
    container.append(avatarWrap);
  }

  const list = document.createElement('dl');
  list.className = 'identification-list';

  list.append(
    identificationRow('Username', data.username),
    identificationRow('Cohort', data.cohort),
    identificationRow('Total XP', formatXp(data.totalXp)),
    identificationRow('Level', data.level),
    identificationRow('Audit ratio', data.auditRatio)
  );

  container.append(list);
}

export function renderLogoutButton(container, onLogout) {
  container.textContent = '';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'logout-button';
  button.textContent = 'Log out';
  button.addEventListener('click', onLogout);

  container.append(button);
  container.hidden = false;
}

export function renderProfileView(identificationSection, options) {
  renderIdentification(identificationSection, options.identification);
  renderDonut(options.donutContainer, options.donut);
  renderBar(options.barContainer, options.bar);
}