import { getToken, clearToken } from '../utils/token.js';

const GRAPHQL_URL = 'https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql';

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

  if (response.status === 401) {
    clearToken();
    return { ok: false, reason: 'auth' };
  }

  if (!response.ok) {
    return { ok: false, reason: 'http', status: response.status };
  }

  const payload = await response.json();
  if (payload.errors && payload.errors.length > 0) {
    if (hasInvalidJwtError(payload.errors)) {
      clearToken();
      return { ok: false, reason: 'auth' };
    }
    return { ok: false, reason: 'errors' };
  }

  return { ok: true, data: payload.data };
}

function hasInvalidJwtError(errors) {
  for (let i = 0; i < errors.length; i++) {
    const extension = errors[i].extensions;
    if (extension && extension.code === 'invalid-jwt') {
      return true;
    }
  }
  return false;
}