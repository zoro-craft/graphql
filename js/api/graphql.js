import { getToken, clearToken } from '../utils/token.js';

const GRAPHQL_URL = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql';

// Send a GraphQL query using the stored token.
export async function graphql(query) {
  const token = getToken();
  if (!token) {
    clearToken();
    return { ok: false, reason: 'auth' };
  }

  let response;
  try {
    response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify({ query: query })
    });
  } catch (error) {
    return { ok: false, reason: 'network' };
  }

  // A 401 means the token is no longer accepted by the server.
  if (response.status === 401) {
    clearToken();
    return { ok: false, reason: 'auth' };
  }

  if (!response.ok) {
    return { ok: false, reason: 'http', status: response.status };
  }

  const payload = await response.json();

  // GraphQL reports application errors in an "errors" array even on HTTP 200.
  if (payload.errors && payload.errors.length > 0) {
    if (hasInvalidJwtError(payload.errors)) {
      clearToken();
      return { ok: false, reason: 'auth' };
    }
    return { ok: false, reason: 'errors' };
  }

  return { ok: true, data: payload.data };
}

// True when any of the GraphQL errors reports an expired/invalid token.
function hasInvalidJwtError(errors) {
  return errors.some((error) => {
    const extension = error.extensions;
    return extension && extension.code === 'invalid-jwt';
  });
}