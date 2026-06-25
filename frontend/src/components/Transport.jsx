import { usePlayer } from '../context/PlayerContext.jsx';

export default function Transport() {
  const { state, dispatch, togglePlay, next, previous } = usePlayer();

  return (
    <div className="transport">
      <button className="tbtn menu"><i className="fa-solid fa-bars" /></button>

      <button
        className={`tbtn${state.shuffle ? ' on' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_SHUFFLE' })}
        title="Shuffle"
      >
        <i className="fa-solid fa-shuffle" />
      </button>

      <button className="tbtn" onClick={previous} title="Previous">
        <i className="fa-solid fa-backward-step" />
      </button>

      <button className="tbtn play-main" onClick={togglePlay} title="Play / Pause">
        <i className={`fa-solid ${state.isPlaying ? 'fa-pause' : 'fa-play'}`} />
      </button>

      <button className="tbtn" onClick={next} title="Next">
        <i className="fa-solid fa-forward-step" />
      </button>

      <button
        className={`tbtn${state.repeat ? ' on' : ''}`}
        onClick={() => dispatch({ type: 'TOGGLE_REPEAT' })}
        title="Repeat"
      >
        <i className="fa-solid fa-repeat" />
      </button>

      <span className={`tbtn led${state.isPlaying ? '' : ' dim'}`}>
        <i className="fa-solid fa-circle" />
      </span>
    </div>
  );
}
