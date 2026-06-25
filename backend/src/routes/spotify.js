const express = require('express');

const requireAuth = require('../middleware/requireAuth');
const spotify = require('../lib/spotifyClient');
const cache = require('../lib/cache');

const router = express.Router();
router.use(requireAuth);

const FIVE_MIN = 5 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

router.get('/playlists', async (req, res, next) => {
  try {
    const data = await cache.wrap(`playlists:${req.user.id}`, FIVE_MIN, () =>
      spotify.apiRequest(req.accessToken, 'GET', '/me/playlists', { params: { limit: 50 } })
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/playlists/:id/tracks', async (req, res, next) => {
  try {
    const data = await cache.wrap(`playlist-tracks:${req.params.id}`, FIVE_MIN, () =>
      spotify.apiRequest(req.accessToken, 'GET', `/playlists/${req.params.id}/tracks`, {
        params: { limit: 100 },
      })
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  const { q, type = 'track,artist,album' } = req.query;
  if (!q) return res.status(400).json({ error: 'missing_query', message: 'Provide ?q=' });

  try {
    const data = await cache.wrap(`search:${type}:${q}`, 2 * 60 * 1000, () =>
      spotify.apiRequest(req.accessToken, 'GET', '/search', { params: { q, type, limit: 20 } })
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Pre-computed tempo/energy/loudness data — this is what the visualizer should animate to.
// The Web Playback SDK's audio stream is DRM-protected and not accessible for live FFT analysis.
router.get('/audio-features/:trackId', async (req, res, next) => {
  try {
    const data = await cache.wrap(`audio-features:${req.params.trackId}`, ONE_HOUR, () =>
      spotify.apiRequest(req.accessToken, 'GET', `/audio-features/${req.params.trackId}`)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/audio-analysis/:trackId', async (req, res, next) => {
  try {
    const data = await cache.wrap(`audio-analysis:${req.params.trackId}`, ONE_HOUR, () =>
      spotify.apiRequest(req.accessToken, 'GET', `/audio-analysis/${req.params.trackId}`)
    );
    res.json(data);
  } catch (err) {
    next(err);
  }
});

// Live playback state — intentionally not cached.
router.get('/now-playing', async (req, res, next) => {
  try {
    const data = await spotify.apiRequest(req.accessToken, 'GET', '/me/player/currently-playing');
    res.json(data || { is_playing: false });
  } catch (err) {
    next(err);
  }
});

router.get('/devices', async (req, res, next) => {
  try {
    const data = await spotify.apiRequest(req.accessToken, 'GET', '/me/player/devices');
    res.json(data);
  } catch (err) {
    next(err);
  }
});

function playbackAction(method, endpoint, { useQueryParams } = {}) {
  return async (req, res, next) => {
    try {
      await spotify.apiRequest(req.accessToken, method, endpoint, {
        params: useQueryParams ? req.query : undefined,
        body: !useQueryParams && Object.keys(req.body || {}).length ? req.body : undefined,
      });
      res.status(204).end();
    } catch (err) {
      // Playback control requires Premium — surface that clearly instead of a generic 502.
      if (err.status === 403) {
        return res.status(403).json({
          error: 'premium_required',
          message: 'Playback control requires Spotify Premium.',
        });
      }
      if (err.status === 404) {
        return res.status(404).json({
          error: 'no_active_device',
          message: 'No active Spotify device. Open the Web Playback SDK or another Spotify app first.',
        });
      }
      next(err);
    }
  };
}

router.put('/player/play', playbackAction('PUT', '/me/player/play'));
router.put('/player/pause', playbackAction('PUT', '/me/player/pause'));
router.post('/player/next', playbackAction('POST', '/me/player/next'));
router.post('/player/previous', playbackAction('POST', '/me/player/previous'));
router.put('/player/seek', playbackAction('PUT', '/me/player/seek', { useQueryParams: true }));
router.put('/player/volume', playbackAction('PUT', '/me/player/volume', { useQueryParams: true }));
router.put('/player/transfer', async (req, res, next) => {
  try {
    await spotify.apiRequest(req.accessToken, 'PUT', '/me/player', {
      body: { device_ids: [req.body.device_id], play: req.body.play ?? false },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
