const express = require('express');
const crypto = require('crypto');

const store = require('../lib/store');
const { encrypt } = require('../lib/crypto');
const spotify = require('../lib/spotifyClient');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// streaming + playback-state scopes are needed for the Web Playback SDK and transport controls.
const SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing',
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read',
  'user-top-read',
  'streaming',
].join(' ');

// Step 1: send the browser to Spotify's consent screen.
router.get('/login', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
    scope: SCOPES,
    state,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

// Allowed frontend URLs for secure redirect
const ALLOWED_FRONTEND_URLS = [
  process.env.FRONTEND_URL || 'https://localhost:5173',
  // Add additional trusted origins if needed
];

// Step 2: Spotify redirects back here with a code (or an error).
router.get('/callback', async (req, res) => {
  const { code, state, error } = req.query;
  const frontend = process.env.FRONTEND_URL || 'https://localhost:5173';

  // Validate frontend URL is in allowed list (prevents open redirect)
  if (!ALLOWED_FRONTEND_URLS.includes(frontend)) {
    console.error(`⚠ Untrusted frontend URL attempted: ${frontend}`);
    return res.status(400).json({ error: 'Invalid frontend URL' });
  }

  if (error) {
    return res.redirect(`${frontend}?auth_error=${encodeURIComponent(error)}`);
  }
  if (!state || state !== req.session.oauthState) {
    return res.redirect(`${frontend}?auth_error=state_mismatch`);
  }
  delete req.session.oauthState;

  try {
    const tokenData = await spotify.exchangeCodeForToken({
      code,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });

    const profile = await spotify.apiRequest(tokenData.access_token, 'GET', '/me');

    await store.saveUser(profile.id, {
      displayName: profile.display_name,
      email: profile.email,
      product: profile.product, // 'premium' | 'free' | 'open'
      accessToken: tokenData.access_token,
      accessTokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
      refreshTokenEnc: encrypt(tokenData.refresh_token),
      updatedAt: Date.now(),
    });

    req.session.userId = profile.id;
    res.redirect(frontend);
  } catch (err) {
    console.error('OAuth callback failed:', err);
    res.redirect(`${frontend}?auth_error=callback_failed`);
  }
});

// Lets the frontend check "am I logged in" on page load.
router.get('/me', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: 'not_authenticated' });

  const user = await store.getUser(req.session.userId);
  if (!user) return res.status(401).json({ error: 'not_authenticated' });

  res.json({
    id: user.id,
    displayName: user.displayName,
    email: user.email,
    isPremium: user.product === 'premium',
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('retroplayer.sid');
    res.json({ ok: true });
  });
});

// The Web Playback SDK runs in the browser and streams directly from Spotify,
// so the frontend needs a live access token — this hands one out, refreshing first if needed.
router.get('/token', requireAuth, (req, res) => {
  res.json({
    access_token: req.accessToken,
    expires_at: req.user.accessTokenExpiresAt,
  });
});

module.exports = router;
