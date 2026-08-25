# RetroPlayer — Base44 dev notes

## Stack
- **backend/** — Node.js + Express (CommonJS). Spotify OAuth, token refresh, API proxy/caching, user prefs (JSON file store). Dev command: `node --watch src/server.js` on port 3000.
- **frontend/** — React 18 + Vite. Dev command: `vite` on port 5173. Vite proxies `/api` and `/auth` to the backend (`BACKEND_URL` env, defaults to `http://localhost:3000`).

## Wiring (docker-compose.base44.yml)
Single-origin: the **frontend Vite server is the public entry point on host port 3000** and proxies `/api` + `/auth` to the `backend` service. This keeps the Spotify session cookie same-origin — no cross-site cookie config needed.
- Backend has no published host port; it is only reached via the Vite proxy.
- `FRONTEND_URL` and `SPOTIFY_REDIRECT_URI` are derived from `BASE44_PUBLIC_HOST_SUFFIX` at runtime (never hardcoded).
- Vite config uses `server.host: true` + `allowedHosts: true` so the preview's external hostname is accepted.

## Secrets
- `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` — user-supplied via the platform secrets store, delivered to `/run/base44/app.env` (last `env_file` entry, overrides placeholders).
- `SESSION_SECRET`, `ENCRYPTION_KEY` — generated dev-only values in `.env.base44-defaults` (first `env_file` entry).
- `/run/base44/app.env` is referenced as `required: false` so the stack boots before credentials are supplied.

## Spotify OAuth gotcha
The redirect URI is `https://3000-${BASE44_PUBLIC_HOST_SUFFIX}/auth/callback`, which **changes whenever the environment is recreated**. The exact current value must be registered in the Spotify Developer Dashboard (app → Settings → Redirect URIs), and a **Spotify Premium** account is required for the Web Playback SDK to stream. Without valid creds + registered redirect URI, the app boots and shows the login screen but login cannot complete.

## Verify it works
```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
# Frontend serves live Vite source (contains /@vite/client):
curl -sf -H "Host: 3000-${BASE44_PUBLIC_HOST_SUFFIX}" http://localhost:3000/ | head
# Proxy forwards to backend (expect 401 JSON):
curl -s -H "Host: 3000-${BASE44_PUBLIC_HOST_SUFFIX}" http://localhost:3000/auth/me
```
