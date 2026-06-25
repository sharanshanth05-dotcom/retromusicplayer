import { usePlayer } from '../context/PlayerContext.jsx';

export default function PlayerBar() {
  const { state, dispatch, togglePlay, next, previous, setVolume } = usePlayer();
  const t = state.currentTrack;

  return (
    <div className="player-bar">
      {/* Track info */}
      <div className="pb-track">
        <div className="pb-thumb">
          {t?.albumImg
            ? <img src={t.albumImg} alt="" />
            : <i className="fa-solid fa-cassette-tape" />
          }
        </div>
        <div className="pb-info">
          <div className="t">{t?.name || 'Nothing playing'}</div>
          <div className="a">{t?.artists || '—'}</div>
        </div>
        <button
          className={`like-btn${state.liked ? ' liked' : ''}`}
          onClick={() => dispatch({ type: 'TOGGLE_LIKE' })}
        >
          <i className={`fa-${state.liked ? 'solid' : 'regular'} fa-heart`} />
        </button>
      </div>

      {/* Controls */}
      <div className="pb-controls">
        <i
          className="fa-solid fa-shuffle"
          style={{ color: state.shuffle ? 'var(--green)' : 'var(--text-dim)', cursor: 'pointer' }}
          onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
        />
        <i className="fa-solid fa-backward-step" style={{ cursor: 'pointer' }} onClick={previous} />
        <button className="tbtn play-main" onClick={togglePlay}>
          <i className={`fa-solid ${state.isPlaying ? 'fa-pause' : 'fa-play'}`} />
        </button>
        <i className="fa-solid fa-forward-step" style={{ cursor: 'pointer' }} onClick={next} />
        <i
          className="fa-solid fa-repeat"
          style={{ color: state.repeat ? 'var(--green)' : 'var(--text-dim)', cursor: 'pointer' }}
          onClick={() => dispatch({ type: 'TOGGLE_REPEAT' })}
        />
      </div>

      {/* Right controls */}
      <div className="pb-right">
        <i className="fa-solid fa-wave-square" style={{ color: 'var(--orange)' }} />
        <i className="fa-solid fa-desktop" />
        <i className="fa-solid fa-volume-high" />
        <input
          type="range"
          className="vol-slider"
          min="0" max="100"
          value={state.volume}
          onChange={e => setVolume(Number(e.target.value))}
        />
        <i className="fa-solid fa-expand" />
      </div>
    </div>
  );
}
