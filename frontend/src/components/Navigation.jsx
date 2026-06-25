import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { auth } from '../services/api.js';

const NAV_ITEMS = [
  { id: 'now',      icon: 'fa-play',          label: 'Now playing' },
  { id: 'playlists',icon: 'fa-list-ul',       label: 'Playlists' },
  { id: 'search',   icon: 'fa-magnifying-glass', label: 'Search' },
  { id: 'library',  icon: 'fa-folder-open',   label: 'Your library' },
  { id: 'liked',    icon: 'fa-heart',         label: 'Liked songs' },
  { id: 'artists',  icon: 'fa-user',          label: 'Artists' },
  { id: 'albums',   icon: 'fa-record-vinyl',  label: 'Albums' },
];

const PLAYLIST_COLORS = ['var(--orange)','#7aa6ff','#5cc8ff','var(--green)','#b07aff'];
const PLAYLIST_ICONS  = ['fa-cassette-tape','fa-headphones','fa-car-side','fa-skull','fa-record-vinyl'];

export default function Navigation() {
  const { state, loadPlaylistTracks, sysLog } = usePlayer();
  const [activeNav, setActiveNav] = useState('now');
  const [filter, setFilter] = useState('');

  const playlists = state.playlists;
  const filtered  = filter
    ? playlists.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()))
    : playlists;

  async function handlePlaylistClick(pl, i) {
    await loadPlaylistTracks(pl.id);
    sysLog('LOADED PLAYLIST: ' + pl.name.toUpperCase());
  }

  return (
    <>
      {/* Navigation */}
      <div className="panel">
        <div className="panel-title"><span className="label">Navigation</span></div>
        <div className="nav-list">
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              className={`nav-item${activeNav === item.id ? ' active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <i className={`fa-solid ${item.icon}`} />
              {item.label}
            </div>
          ))}
        </div>
        {activeNav === 'search' && (
          <div className="search-box">
            <i className="fa-solid fa-magnifying-glass" />
            <input
              type="text"
              placeholder="Filter playlists..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Playlists */}
      <div className="panel">
        <div className="panel-title">
          <span className="label">Your playlists</span>
          <span className="meta" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <i className="fa-solid fa-plus" /> NEW
          </span>
        </div>
        <div className="playlist-list scroll" style={{ maxHeight: 220 }}>
          {filtered.length === 0 && (
            <div className="term" style={{ padding: '8px 12px', fontSize: 10 }}>
              {playlists.length === 0 ? '> LOADING...' : '> NO RESULTS'}
            </div>
          )}
          {filtered.map((pl, i) => {
            const isActive = pl.id === state.activePlaylistId;
            return (
              <div
                key={pl.id}
                className={`playlist-item${isActive ? ' active' : ''}`}
                onClick={() => handlePlaylistClick(pl, i)}
              >
                <div className="pl-icon" style={{ color: PLAYLIST_COLORS[i % PLAYLIST_COLORS.length] }}>
                  {pl.images?.[0]?.url
                    ? <img src={pl.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                    : <i className={`fa-solid ${PLAYLIST_ICONS[i % PLAYLIST_ICONS.length]}`} />
                  }
                </div>
                <div className="pl-info">
                  <div className="name">{pl.name}</div>
                  <div className="count">{pl.tracks?.total || '?'} TRACKS</div>
                </div>
                {isActive && (
                  <div className="pl-pulse">
                    <span style={{ height: '60%' }} /><span style={{ height: '100%' }} /><span style={{ height: '40%' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* System log */}
      <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 130 }}>
        <div className="panel-title">
          <span className="label">System log</span>
          <span className="meta" onClick={() => auth.logout().then(() => window.location.reload())}>
            LOGOUT
          </span>
        </div>
        <div className="term scroll" style={{ flex: 1, fontSize: 10.5 }}>
          {state.systemLogs.join('\n')}
          <span className="cursor" />
        </div>
      </div>
    </>
  );
}
