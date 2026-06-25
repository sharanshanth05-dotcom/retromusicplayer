import { usePlayer } from '../context/PlayerContext.jsx';
import { player as playerApi } from '../services/api.js';

function fmt(ms) {
  if (!ms) return '—';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export default function PlaylistQueue() {
  const { state, sysLog } = usePlayer();
  const active = state.currentTrack?.id;

  async function play(track) {
    try {
      await playerApi.play({ uris: [track.uri] });
      sysLog('QUEUED: ' + track.name.toUpperCase());
    } catch (e) {
      sysLog('PLAY FAILED: ' + e.message);
    }
  }

  return (
    <div className="queue-list scroll" style={{ flex: 1 }}>
      {state.queue.length === 0 && (
        <div className="term" style={{ padding: '10px 12px', fontSize: 10 }}>
          &gt; SELECT A PLAYLIST TO LOAD QUEUE<span className="cursor" />
        </div>
      )}
      {state.queue.map((track, i) => {
        const isActive = track?.id === active;
        return (
          <div
            key={track?.id || i}
            className={`queue-item${isActive ? ' active' : ''}`}
            onClick={() => track?.uri && play(track)}
          >
            <div className="q-thumb">
              {track?.album?.images?.[0]?.url
                ? <img src={track.album.images[0].url} alt="" />
                : isActive
                  ? <i className="fa-solid fa-play" style={{ fontSize: 10 }} />
                  : (i + 1)
              }
            </div>
            <div className="q-info">
              <div className="t">{track?.name || '—'}</div>
              <div className="a">{track?.artists?.map(a => a.name).join(', ') || '—'}</div>
            </div>
            <div className="q-dur">{fmt(track?.duration_ms)}</div>
            <div className="q-extra">
              {isActive
                ? <i className="fa-solid fa-wave-square" style={{ color: 'var(--orange)' }} />
                : <i className="fa-solid fa-ellipsis-vertical" />
              }
            </div>
          </div>
        );
      })}
    </div>
  );
}
