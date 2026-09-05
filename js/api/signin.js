import { clearToken } from '../utils/token.js';

const SIGNIN_URL = 'https://learn.zone01oujda.ma/api/auth/signin';

// Base64-encode a string that may contain any Unicode characters (Arabic, …).
// btoa alone only handles Latin-1, so the string is first converted to UTF-8
// bytes, then those bytes are encoded.
function toBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Authenticate with the API and receive a token.
 *
 * Returns { ok: true, token } on success, or { ok: false, reason } on failure,
 * where reason is 'unreachable' (network) or 'invalid' (bad credentials).
 */
export async function signin(identifier, password) {
  // Basic auth header: "username:password" base64-encoded (UTF-8).
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

  // The token comes back as a quoted JSON string, e.g. "abc123"; strip the quotes.
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