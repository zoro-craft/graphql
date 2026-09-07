import { clearToken } from '../utils/token.js';

const SIGNIN_URL = 'https://learn.zone01oujda.ma/api/auth/signin';

// base64-encode a string as utf-8 so non-latin characters work.
function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

// authenticate with the api and receive a token.
export async function signin(identifier, password) {
  // basic auth header from the credentials.
  const credentials = toBase64(identifier + ':' + password);

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

  // the token is returned as a quoted string; strip the quotes.
  let token = (await response.text()).trim();
  if (token[0] === '"' && token[token.length - 1] === '"') {
    token = token.slice(1, -1);
  }

  if (!token) {
    clearToken();
    return { ok: false, reason: 'invalid' };
  }

  return { ok: true, token: token };
}