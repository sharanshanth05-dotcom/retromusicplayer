import { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';

function fmt(ms) {
  if (!ms && ms !== 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function WaveformBar({ positionMs, durationMs, onSeek }) {
  const n = 68;
  const seed = useMemo(() => Array.from({ length: n }, () => 6 + Math.round(Math.random() * 22)), []);
  const pct  = durationMs > 0 ? positionMs / durationMs : 0;

  return (
    <div
      className="wave-bars"
      onClick={e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const p = (e.clientX - rect.left) / rect.width;
        onSeek(Math.round(durationMs * Math.max(0, Math.min(1, p))));
      }}
    >
      {seed.map((h, i) => (
        <span key={i} style={{ height: h }} className={i / n < pct ? 'played' : ''} />
      ))}
    </div>
  );
}

export default function NowPlaying() {
  const { state, dispatch, seek } = usePlayer();
  const t = state.currentTrack;

  return (
    <div className="panel">
      <div className="panel-title"><span className="label">Now playing</span></div>

      {!state.isPremium && state.user && (
        <div className="premium-banner" style={{ margin: '8px 12px 0' }}>
          <i className="fa-solid fa-triangle-exclamation" />
          Spotify Premium is required for playback control.
        </div>
      )}

      <div className="np-card">
        {/* Album art */}
        <div className="np-art">
          {t?.albumImg
            ? <img src={t.albumImg} alt={t?.album} />
            : (
              <svg viewBox="0 0 150 150" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid slice">
                <circle cx="75" cy="35" r="26" fill="#ffd23d" opacity=".85"/>
                <rect x="0" y="95" width="150" height="55" fill="#0c0612"/>
                <rect x="14" y="100" width="34" height="40" fill="#1d0f2e"/>
                <rect x="60" y="92" width="26" height="48" fill="#1d0f2e"/>
                <rect x="100" y="104" width="30" height="36" fill="#1d0f2e"/>
              </svg>
            )
          }
          <div className="badge"><i className="fa-solid fa-skull" /></div>
          <div className="art-caption">{t?.name || 'No track'}</div>
        </div>

        {/* Info */}
        <div className="np-info">
          <div className="np-top">
            <div>
              <div className="pretitle">{t?.artists || '—'}</div>
              <div className="np-title">{t?.name || 'Nothing playing'}</div>
              <div className="np-artist">{t?.artists || ''}</div>
            </div>
            <button
              className={`like-btn${state.liked ? ' liked' : ''}`}
              onClick={() => dispatch({ type: 'TOGGLE_LIKE' })}
            >
              <i className={`fa-${state.liked ? 'solid' : 'regular'} fa-heart`} />
            </button>
          </div>

          <div className="np-meta">
            Album: <b>{t?.album || '—'}</b><br />
          </div>

          <div className="progress-wrap">
            <WaveformBar
              positionMs={state.positionMs}
              durationMs={state.durationMs || t?.durationMs || 0}
              onSeek={seek}
            />
            <div className="time-row">
              <span>{fmt(state.positionMs)}</span>
              <span>{fmt(state.durationMs || t?.durationMs)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
