// In production, use VITE_API_URL if available; in dev, use relative path (proxied)
const BASE = import.meta.env.VITE_API_URL || '';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: res.status, code: data.error });
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  me:     ()     => req('GET',  '/auth/me'),
  token:  ()     => req('GET',  '/auth/token'),
  logout: ()     => req('POST', '/auth/logout'),
  loginUrl: () => '/auth/login',
};

// ── Spotify data ──────────────────────────────────────────────────────────────
export const spotify = {
  playlists:       ()         => req('GET', '/api/playlists'),
  playlistTracks:  (id)       => req('GET', `/api/playlists/${id}/tracks`),
  search:          (q, type)  => req('GET', `/api/search?q=${encodeURIComponent(q)}&type=${type || 'track,artist,album'}`),
  nowPlaying:      ()         => req('GET', '/api/now-playing'),
  audioFeatures:   (id)       => req('GET', `/api/audio-features/${id}`),
  audioAnalysis:   (id)       => req('GET', `/api/audio-analysis/${id}`),
  devices:         ()         => req('GET', '/api/devices'),
};

// ── Playback control ─────────────────────────────────────────────────────────
export const player = {
  play:     (body) => req('PUT',  '/api/player/play', body),
  pause:    ()     => req('PUT',  '/api/player/pause'),
  next:     ()     => req('POST', '/api/player/next'),
  previous: ()     => req('POST', '/api/player/previous'),
  seek:     (ms)   => req('PUT',  `/api/player/seek?position_ms=${ms}`),
  volume:   (pct)  => req('PUT',  `/api/player/volume?volume_percent=${pct}`),
  transfer: (id, play) => req('PUT', '/api/player/transfer', { device_id: id, play }),
};

// ── Preferences ───────────────────────────────────────────────────────────────
export const prefs = {
  get:   ()      => req('GET',   '/api/preferences'),
  patch: (patch) => req('PATCH', '/api/preferences', patch),
};
