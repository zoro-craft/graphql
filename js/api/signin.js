import { clearToken } from '../utils/token.js';

const SIGNIN_URL = 'https://learn.zone01oujda.ma/api/auth/signin';

export async function signin(identifier, password) {
  const credentials = btoa(identifier + ':' + password);
  let response;
  try {
    response = await fetch(SIGNIN_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + credentials
      }
    });
  } catch (error) {
    clearToken();
    return { ok: false, reason: 'unreachable' };
  }
  if (!response.ok) {
    clearToken();
    return { ok: false, reason: 'invalid' };
  }

  let token = await response.text();
  token = token.trim();
  if (token[0] === '"' && token[token.length - 1] === '"') {
    token = token.slice(1, -1);
  }
  if (!token) {
    clearToken();
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true, token: token };
}