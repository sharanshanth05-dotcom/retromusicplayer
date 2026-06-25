import { useMemo } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';

function WaveTicks({ n = 8 }) {
  const heights = useMemo(() => Array.from({ length: n }, () => 4 + Math.round(Math.random() * 10)), [n]);
  return (
    <div className="wave" style={{ display: 'flex', gap: 1, alignItems: 'center', opacity: 0.5 }}>
      {heights.map((h, i) => <span key={i} style={{ width: 2, height: h, background: '#5a4a2c', borderRadius: 1 }} />)}
    </div>
  );
}

export default function CassetteDeck() {
  const { state } = usePlayer();

  const activePlaylist = state.playlists.find(p => p.id === state.activePlaylistId);
  const label = activePlaylist?.name || '80s Synthwave';

  return (
    <div className="cassette">
      <span className="corner tl" /><span className="corner tr" />
      <span className="corner bl" /><span className="corner br" />

      <div className="label-plate">
        <WaveTicks />
        <div style={{ textAlign: 'center' }}>
          <div className="tag">PLAYLIST:</div>
          <div className="title">{label}</div>
        </div>
        <WaveTicks />
      </div>

      <div className="reels-row">
        <div className="reel-side">A</div>
        <div className={`reel${state.isPlaying ? ' spin' : ''}`}>
          <div className="hub" />
        </div>
        <div className="tape-window"><div className="tape-line" /></div>
        <div className={`reel${state.isPlaying ? ' spin' : ''}`} style={{ animationDirection: 'reverse' }}>
          <div className="hub" />
        </div>
        <div className="reel-side b">C-90</div>
      </div>

      <div className="cassette-brand">
        <div className="name">RETROPLAYER</div>
        <div className="sub">HIGH BIAS 70μs EQ</div>
      </div>
      <div className="sprockets">
        {Array.from({ length: 6 }).map((_, i) => <span key={i} />)}
      </div>
    </div>
  );
}
