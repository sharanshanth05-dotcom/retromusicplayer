const { SpotifyApiError } = require('../lib/spotifyClient');

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof SpotifyApiError) {
    console.error('Spotify API error:', err.message);
    return res.status(err.status && err.status < 500 ? err.status : 502).json({
      error: 'spotify_api_error',
      message: err.message,
    });
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'internal_error', message: 'Something went wrong.' });
}

module.exports = errorHandler;
