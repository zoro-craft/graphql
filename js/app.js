import { getToken, clearToken } from './utils/token.js';
import { renderLoginView } from './components/login-view.js';
import { renderProfileView, renderLogoutButton } from './components/profile-view.js';
import { fetchProfile, mapIdentification, mapDonut, mapBar } from './api/profile.js';

const loginView = document.getElementById('login-view');
const profileView = document.getElementById('profile-view');
const logoutContainer = document.getElementById('header-logout');
const errorBanner = document.getElementById('app-error');

const identificationSection = document.getElementById('identification-section');
const donutContainer = document.getElementById('donut-chart');
const barContainer = document.getElementById('bar-chart');

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function hideError() {
  errorBanner.textContent = '';
  errorBanner.hidden = true;
}

function showLogin(message) {
  hideError();
  profileView.hidden = true;
  logoutContainer.hidden = true;
  loginView.hidden = false;
  if (message) showError(message);
}

function showProfile() {
  hideError();
  loginView.hidden = true;
  profileView.hidden = false;
}

function handleLogout() {
  clearToken();
  showLogin();
}

function setSectionState(container, message) {
  container.textContent = '';
  const state = document.createElement('p');
  state.className = 'state-message';
  state.textContent = message;
  container.append(state);
}

function renderLoadingStates() {
  setSectionState(identificationSection, 'Loading…');
  setSectionState(donutContainer, 'Loading…');
  setSectionState(barContainer, 'Loading…');
}

function renderFallbackProfile() {
  renderProfileView(identificationSection, {
    identification: mapIdentification(null),
    donut: mapDonut(null),
    bar: mapBar(null),
    donutContainer: donutContainer,
    barContainer: barContainer
  });
}

async function loadProfile() {
  renderLoadingStates();

  const result = await fetchProfile();
  if (result.reason === 'auth') {
    clearToken();
    showLogin('Your session has expired. Please sign in again.');
    return;
  }
  if (!result.ok) {
    showError('Could not load profile data. Please try again.');
    renderFallbackProfile();
    return;
  }

  const user = result.user;
  renderProfileView(identificationSection, {
    identification: mapIdentification(user),
    donut: mapDonut(user),
    bar: mapBar(user),
    donutContainer: donutContainer,
    barContainer: barContainer
  });
  renderLogoutButton(logoutContainer, handleLogout);
}

export function boot() {
  renderLoginView(loginView, {
    onAuthenticated: function () {
      showProfile();
      loadProfile();
    }
  });

  if (getToken()) {
    showProfile();
    loadProfile();
  } else {
    showLogin();
  }
}