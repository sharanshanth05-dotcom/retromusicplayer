const store = require('../lib/store');
const { encrypt, decrypt } = require('../lib/crypto');
const spotify = require('../lib/spotifyClient');

// Refresh slightly before actual expiry so a request never races an expiring token.
const EXPIRY_BUFFER_MS = 60 * 1000;

async function requireAuth(req, res, next) {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: 'not_authenticated', message: 'Log in via /auth/login first.' });
  }

  let user = await store.getUser(userId);
  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: 'session_invalid' });
  }

  const isExpired = !user.accessTokenExpiresAt || Date.now() > user.accessTokenExpiresAt - EXPIRY_BUFFER_MS;

  if (isExpired) {
    try {
      const refreshToken = decrypt(user.refreshTokenEnc);
      const tokenData = await spotify.refreshAccessToken(refreshToken);

      const patch = {
        accessToken: tokenData.access_token,
        accessTokenExpiresAt: Date.now() + tokenData.expires_in * 1000,
      };
      // Spotify doesn't always rotate the refresh token — only overwrite it when a new one is sent.
      if (tokenData.refresh_token) {
        patch.refreshTokenEnc = encrypt(tokenData.refresh_token);
      }

      user = await store.saveUser(userId, patch);
    } catch (err) {
      console.error('Token refresh failed:', err.message);
      return res.status(401).json({ error: 'reauth_required', message: 'Please log in again.' });
    }
  }

  req.user = user;
  req.accessToken = user.accessToken;
  next();
}

module.exports = requireAuth;
