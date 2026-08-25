import { auth } from '../services/api.js';

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">
        <div className="big-logo"><span className="r">RETRO</span><span className="p">PLAYER</span></div>
        <div className="tagline">// RETRO_HACKER EDITION — SYSTEM OFFLINE</div>

        <a href={auth.loginUrl()} target="_blank" rel="noopener">
          <button className="login-btn">
            <svg width="20" height="20" viewBox="0 0 168 168" fill="none">
              <circle cx="84" cy="84" r="84" fill="#1DB954"/>
              <path d="M120 115c-2 0-3-1-5-2-14-8-32-12-53-12-11 0-22 1-32 4-2 1-3 1-5 1-4 0-7-3-7-7s2-6 6-7c12-3 24-5 38-5 24 0 44 5 60 15 3 2 4 4 4 7 0 4-3 6-6 6zm11-24c-2 0-4-1-6-2-15-9-38-15-64-15-13 0-25 2-34 4-2 1-4 1-5 1-5 0-8-3-8-8s2-7 6-8c11-3 24-5 42-5 28 0 54 7 73 18 3 2 5 5 5 8 0 4-4 7-9 7zm12-26c-2 0-3 0-5-1C118 52 92 46 64 46c-15 0-29 2-42 6-2 0-4 1-6 1-5 0-10-4-10-9 0-5 3-8 7-9C28 30 44 27 64 27c31 0 60 7 82 20 4 2 6 5 6 9s-4 9-9 9z" fill="#fff"/>
            </svg>
            LOGIN WITH SPOTIFY
          </button>
        </a>
        <div className="login-note">Requires <b>Spotify Premium</b> for full playback control</div>
      </div>
    </div>
  );
}
