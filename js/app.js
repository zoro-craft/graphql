import { getToken, clearToken } from './utils/token.js';
import { renderLoginView } from './components/login-view.js';
import {
  renderProfileView,
  renderLogoutButton,
} from './components/profile-view.js';
import {
  fetchProfile,
  mapIdentification,
  mapDonut,
  mapBar,
} from './api/profile.js';
import { showEmptyState } from './utils/dom.js';

// all the dom containers the app writes into.
const loginView = document.getElementById('login-view');
const profileView = document.getElementById('profile-view');
const logoutContainer = document.getElementById('header-logout');
const errorBanner = document.getElementById('app-error');

const identificationSection = document.getElementById('identification-section');
const donutContainer = document.getElementById('donut-chart');
const barContainer = document.getElementById('bar-chart');

// shown when the stored token is invalid.
const SESSION_EXPIRED_MESSAGE =
  'Your session has expired. Please sign in again.';

function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function hideError() {
  errorBanner.textContent = '';
  errorBanner.hidden = true;
}

// wipe the profile so no signed-in data survives logout.
function clearProfile() {
  for (const container of [identificationSection, donutContainer, barContainer]) {
    container.textContent = '';
  }
}

// switch to login (optional error) and purge the profile.
function showLogin(message) {
  hideError();
  clearProfile();
  profileView.hidden = true;
  logoutContainer.hidden = true;
  loginView.hidden = false;
  if (message) showError(message);
}

// switch to the profile screen.
function showProfile() {
  hideError();
  loginView.hidden = true;
  profileView.hidden = false;
}

function handleLogout() {
  clearToken();
  showLogin();
}

// show a "loading…" placeholder in every profile section.
function renderLoadingStates() {
  showEmptyState(identificationSection, 'Loading…');
  showEmptyState(donutContainer, 'Loading…');
  showEmptyState(barContainer, 'Loading…');
}

// assemble the profile screen from already-mapped data.
function renderProfile(user) {
  renderProfileView({
    identificationSection: identificationSection,
    donutContainer: donutContainer,
    barContainer: barContainer,
    identification: mapIdentification(user),
    donut: mapDonut(user),
    bar: mapBar(user),
  });
}

// keep the profile visible (empty) after an error.
function renderFallbackProfile() {
  renderProfile(null);
}

async function loadProfile() {
  renderLoadingStates();

  const result = await fetchProfile();

  // expired or invalid session: return to the login screen.
  if (result.reason === 'auth') {
    clearToken();
    showLogin(SESSION_EXPIRED_MESSAGE);
    return;
  }

  // other failures: show an error, keep the profile.
  if (!result.ok) {
    showError('Could not load profile data. Please try again.');
    renderFallbackProfile();
    return;
  }

  renderProfile(result.user);
  renderLogoutButton(logoutContainer, handleLogout);
}

export function boot() {
  renderLoginView(loginView, {
    onAuthenticated: () => {
      showProfile();
      loadProfile();
    },
  });

  // a stored token means the user is already signed in.
  if (getToken()) {
    showProfile();
    loadProfile();
  } else {
    // no token (e.g. first visit): show a clean login screen.
    showLogin();
  }
}
