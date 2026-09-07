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

// shown whenever the stored token is missing, expired, or invalid.
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

// wipe every rendered profile section from the dom so no signed-in data survives into a logged-out state.
function clearProfile() {
  for (const container of [identificationSection, donutContainer, barContainer]) {
    container.textContent = '';
  }
}

// switch to the login screen, optionally showing an error above it; always purges the profile so private data cannot be revealed while logged out.
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

// keep the profile layout visible with empty data after an error.
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

  // any other failure: show an error but keep the (empty) profile visible.
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
