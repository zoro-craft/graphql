// The signed-in user's JWT, persisted in localStorage under a single key.
const TOKEN_KEY = 'zone01-jwt';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}