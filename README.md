# 🎵 RetroPlayer — RETRO_HACKER Edition

Spotify music player with a retro hacker aesthetic — cassette deck, VU meters, frequency visualizer, EQ, and a terminal console.

---

## Project structure

```
retroplayer/
├── backend/          Node.js + Express API server
│   └── src/
│       ├── server.js           Main entry
│       ├── lib/
│       │   ├── crypto.js       AES-256-GCM token encryption
│       │   ├── store.js        JSON-file user store (swap for Postgres in prod)
│       │   ├── cache.js        In-memory TTL cache
│       │   └── spotifyClient.js Spotify accounts + Web API wrapper
│       ├── middleware/
│       │   ├── requireAuth.js  Session guard + auto token refresh
│       │   └── errorHandler.js Central error handler
│       └── routes/
│           ├── auth.js         OAuth 2.0 login / callback / token
│           ├── spotify.js      Playlists, search, audio features, playback
│           └── preferences.js  Per-user EQ / theme preferences
│
└── frontend/         React 18 + Vite
    └── src/
        ├── App.jsx
        ├── context/PlayerContext.jsx   Global state (useReducer)
        ├── hooks/useSpotifySDK.js      Web Playback SDK lifecycle
        ├── services/api.js             All fetch calls to backend
        └── components/                 One file per UI panel
```

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18 |
| Spotify account | **Premium** (required for Web Playback SDK) |
| Spotify Developer App | Create at https://developer.spotify.com/dashboard |

---

## Step 1 — Spotify app setup

1. Go to https://developer.spotify.com/dashboard
2. Create a new app (any name)
3. In **Settings → Redirect URIs**, add: `http://localhost:3000/auth/callback`
4. Copy your **Client ID** and **Client Secret**

---

## Step 2 — Backend setup

```bash
cd backend
cp .env.example .env   # (or edit the .env that already has your client ID)
```

Open `.env` and fill in:

```
SPOTIFY_CLIENT_SECRET=<your secret from the dashboard>
SESSION_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
ENCRYPTION_KEY=<run the same command again for a different value>
```

Your `SPOTIFY_CLIENT_ID` is already filled in as `94aa7298dac44e8fa4f634eba096e532`.

Install and start:

```bash
npm install
npm run dev       # or: npm start
```

Backend will be running at **http://localhost:3000**

---

## Step 3 — Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will be running at **http://localhost:5173**

Vite proxies `/api` and `/auth` requests to the backend automatically — no CORS issues in dev.

---

## Step 4 — First login

1. Open http://localhost:5173
2. Click **LOGIN WITH SPOTIFY**
3. Authorize the app
4. You'll be redirected back to the player

> **Note:** The Web Playback SDK only streams to the browser tab that's open in RetroPlayer. You may need to transfer playback from another Spotify device the first time.

---

## How the Spotify integration works

| Feature | How |
|---|---|
| Auth | OAuth 2.0 Authorization Code flow, handled server-side. Client secret never touches the browser. |
| Token refresh | `requireAuth` middleware auto-refreshes the access token ~1 min before it expires. |
| Refresh token storage | AES-256-GCM encrypted in `data/db.json`. |
| Audio streaming | Spotify **Web Playback SDK** — runs entirely in the browser, streams DRM audio directly from Spotify. |
| Playback control | REST calls to our backend `/api/player/*`, which forwards them to the Spotify Web API. |
| Visualizer | Spotify **Audio Features** endpoint (`energy`, `tempo`) drives bar animation amplitude. No raw PCM access. |
| EQ | Visual only (no Web Audio API bypass of the DRM stream). Preferences saved to backend per-user. |
| Cache | Playlists: 5 min TTL. Audio features/analysis: 1 h TTL. Playback state: not cached. |

---

## Production checklist

- [ ] Set `NODE_ENV=production` and use HTTPS (SDK requires HTTPS in prod)
- [ ] Replace `data/db.json` store with Postgres/Supabase
- [ ] Replace in-memory cache with Redis
- [ ] Set `FRONTEND_URL` to your deployed frontend URL
- [ ] Set `SPOTIFY_REDIRECT_URI` to your production callback URL and add it in the Spotify dashboard
- [ ] Run frontend build: `npm run build` — serve `dist/` as static files
