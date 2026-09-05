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

// All the DOM containers the app writes into.
const loginView = document.getElementById('login-view');
const profileView = document.getElementById('profile-view');
const logoutContainer = document.getElementById('header-logout');
const errorBanner = document.getElementById('app-error');

const identificationSection = document.getElementById('identification-section');
const donutContainer = document.getElementById('donut-chart');
const barContainer = document.getElementById('bar-chart');

// Shown whenever the stored token is missing, expired, or invalid.
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

// Switch to the login screen, optionally showing an error above it.
function showLogin(message) {
  hideError();
  profileView.hidden = true;
  logoutContainer.hidden = true;
  loginView.hidden = false;
  if (message) showError(message);
}

// Switch to the profile screen.
function showProfile() {
  hideError();
  loginView.hidden = true;
  profileView.hidden = false;
}

function handleLogout() {
  clearToken();
  showLogin();
}

// Show a "Loading…" placeholder in every profile section.
function renderLoadingStates() {
  showEmptyState(identificationSection, 'Loading…');
  showEmptyState(donutContainer, 'Loading…');
  showEmptyState(barContainer, 'Loading…');
}

// Assemble the profile screen from already-mapped data.
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

// Keep the profile layout visible with empty data after an error.
function renderFallbackProfile() {
  renderProfile(null);
}

async function loadProfile() {
  renderLoadingStates();

  const result = await fetchProfile();

  // Expired or invalid session: return to the login screen.
  if (result.reason === 'auth') {
    clearToken();
    showLogin(SESSION_EXPIRED_MESSAGE);
    return;
  }

  // Any other failure: show an error but keep the (empty) profile visible.
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
    onAuthenticated() {
      showProfile();
      loadProfile();
    },
  });

  // A stored token means the user is already signed in.
  if (getToken()) {
    showProfile();
    loadProfile();
  } else {
    // A missing token is treated like an expired session.
    showLogin(SESSION_EXPIRED_MESSAGE);
  }
}
