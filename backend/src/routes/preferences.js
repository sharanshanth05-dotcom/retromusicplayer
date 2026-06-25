const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const store       = require('../lib/store');

const router = express.Router();
router.use(requireAuth);

const ALLOWED_KEYS = new Set(['theme', 'eqPreset', 'eqBands', 'volume', 'shuffle', 'repeat']);

router.get('/', async (req, res) => {
  const user = await store.getUser(req.user.id);
  res.json(user?.preferences || {});
});

router.patch('/', async (req, res, next) => {
  try {
    const patch = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (ALLOWED_KEYS.has(key)) patch[key] = value;
    }
    const user = await store.getUser(req.user.id);
    const updated = await store.saveUser(req.user.id, {
      preferences: { ...(user?.preferences || {}), ...patch },
    });
    res.json(updated.preferences);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
