import { useEffect, useState } from 'react';
import { PlayerProvider, usePlayer } from './context/PlayerContext.jsx';
import { useSpotifySDK } from './hooks/useSpotifySDK.js';
import { auth } from './services/api.js';

import LoginPage   from './components/LoginPage.jsx';
import TopBar      from './components/TopBar.jsx';
import Navigation  from './components/Navigation.jsx';
import CassetteDeck from './components/CassetteDeck.jsx';
import Transport   from './components/Transport.jsx';
import NowPlaying  from './components/NowPlaying.jsx';
import ConsolePanel from './components/ConsolePanel.jsx';
import AudioVisualizer from './components/AudioVisualizer.jsx';
import VUMeters    from './components/VUMeters.jsx';
import Equalizer   from './components/Equalizer.jsx';
import PlaylistQueue from './components/PlaylistQueue.jsx';
import PlayerBar   from './components/PlayerBar.jsx';

function Dashboard() {
  useSpotifySDK(); // boots Spotify Web Playback SDK

  return (
    <div className="app-shell">
      <TopBar />
      <div className="main-layout">

        {/* ── LEFT ── */}
        <div className="col">
          <Navigation />
        </div>

        {/* ── CENTER ── */}
        <div className="col" style={{ overflowY: 'auto', paddingRight: 2 }}>
          <CassetteDeck />
          <Transport />
          <NowPlaying />
          <ConsolePanel />
        </div>

        {/* ── RIGHT ── */}
        <div className="col scroll">
          <AudioVisualizer />
          <VUMeters />
          <Equalizer />
          <div className="panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 180 }}>
            <div className="panel-title">
              <span className="label">Playlist queue</span>
              <span className="meta"><i className="fa-solid fa-grip-lines" /></span>
            </div>
            <PlaylistQueue />
          </div>
        </div>

      </div>
      <PlayerBar />
    </div>
  );
}

function Inner() {
  const { dispatch, sysLog, loadPlaylists } = usePlayer();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Spotify blocks iframe embedding (X-Frame-Options), so OAuth runs in a
    // separate top-level tab. Re-check the session when the user comes back.
    const checkAuth = () =>
      auth.me()
        .then((user) => {
          if (cancelled) return;
          dispatch({ type: 'SET_USER', user });
          setAuthed(true);
          setChecking(false);
          sysLog('AUTH VERIFIED — WELCOME ' + (user.displayName || user.id).toUpperCase());
          loadPlaylists();
        })
        .catch(() => {
          if (cancelled) return;
          setAuthed(false);
          setChecking(false);
        });

    checkAuth();

    const onFocus = () => { if (!cancelled) checkAuth(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (checking) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="term" style={{ fontSize: 13 }}>
          &gt; BOOTING RETROPLAYER...<span className="cursor" />
        </div>
      </div>
    );
  }

  return authed ? <Dashboard /> : <LoginPage />;
}

export default function App() {
  return (
    <PlayerProvider>
      <Inner />
    </PlayerProvider>
  );
}
