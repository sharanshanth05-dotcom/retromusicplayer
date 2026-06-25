const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com';
const SPOTIFY_API = 'https://api.spotify.com/v1';

class SpotifyAuthError extends Error {}

class SpotifyApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'SpotifyApiError';
    this.status = status;
  }
}

function basicAuthHeader() {
  const raw = `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`;
  return `Basic ${Buffer.from(raw).toString('base64')}`;
}

async function tokenRequest(body) {
  const res = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: basicAuthHeader(),
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new SpotifyAuthError(`Spotify token request failed (${res.status}): ${text}`);
  }
  return res.json();
}

function exchangeCodeForToken({ code, redirectUri }) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
  });
  return tokenRequest(body);
}

function refreshAccessToken(refreshToken) {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
  return tokenRequest(body);
}

// Generic authenticated call against the Spotify Web API.
async function apiRequest(accessToken, method, endpoint, { params, body } = {}) {
  const url = new URL(`${SPOTIFY_API}${endpoint}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') || '1';
    throw new SpotifyApiError(`Rate limited by Spotify. Retry after ${retryAfter}s.`, 429);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new SpotifyApiError(`Spotify API error (${res.status}): ${text}`, res.status);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

module.exports = {
  exchangeCodeForToken,
  refreshAccessToken,
  apiRequest,
  SpotifyAuthError,
  SpotifyApiError,
};
