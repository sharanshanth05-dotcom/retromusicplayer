import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { spotify as spotifyApi } from '../services/api.js';

const N_BARS = 42;
const FREQS  = ['60', '150', '400', '1K', '2.4K', '6K', '15K'];

export default function AudioVisualizer() {
  const { state } = usePlayer();
  const rafRef    = useRef(null);
  const barsRef   = useRef(null);
  const energyRef = useRef(0.5);  // Spotify audio features energy (0–1)
  const [trackId, setTrackId] = useState(null);

  // Fetch audio features when track changes — energy drives bar amplitude.
  useEffect(() => {
    const id = state.currentTrack?.id;
    if (!id || id === trackId) return;
    setTrackId(id);
    spotifyApi.audioFeatures(id)
      .then(f => { energyRef.current = f?.energy ?? 0.5; })
      .catch(() => {});
  }, [state.currentTrack?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function tick() {
      const el = barsRef.current;
      if (!el) return;
      const children = el.children;
      const energy = energyRef.current;
      for (let i = 0; i < children.length; i++) {
        let h;
        if (state.isPlaying) {
          const center  = children.length / 2;
          const falloff = 1 - Math.abs(i - center) / center * 0.65;
          h = Math.max(3, Math.round(Math.random() * 100 * energy * falloff));
        } else {
          h = 3 + Math.round(Math.random() * 3);
        }
        children[i].style.height = h + 'px';
      }
      rafRef.current = setTimeout(tick, 130);
    }
    tick();
    return () => clearTimeout(rafRef.current);
  }, [state.isPlaying]);

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="label">Audio visualizer</span>
        <span className="meta"><i className="fa-solid fa-ellipsis" /></span>
      </div>
      <div className="viz-bars" ref={barsRef}>
        {Array.from({ length: N_BARS }).map((_, i) => <span key={i} />)}
      </div>
      <div className="viz-freqs">
        {FREQS.map(f => <span key={f}>{f}</span>)}
      </div>
    </div>
  );
}
