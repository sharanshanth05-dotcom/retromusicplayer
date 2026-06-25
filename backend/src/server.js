require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes        = require('./routes/auth');
const spotifyRoutes     = require('./routes/spotify');
const preferencesRoutes = require('./routes/preferences');
const errorHandler      = require('./middleware/errorHandler');

const app = express();

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://localhost:5173',
  credentials: true,
}));

app.use(express.json());

// ── SESSION ───────────────────────────────────────────────────────────────────
app.use(session({
  name: 'retroplayer.sid',
  secret: process.env.SESSION_SECRET || 'dev-only-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
  },
}));

// ── ROUTES ────────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api',  spotifyRoutes);
app.use('/api/preferences', preferencesRoutes);

app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── ERRORS ────────────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── START ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\x1b[32m✓\x1b[0m RetroPlayer backend → https://localhost:${PORT}`);
  console.log(`  Auth flow : https://localhost:${PORT}/auth/login`);
});
