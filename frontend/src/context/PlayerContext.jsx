import { createContext, useContext, useReducer, useRef, useCallback } from 'react';
import { spotify as spotifyApi, player as playerApi, prefs } from '../services/api.js';

const Ctx = createContext(null);

const EQ_PRESETS = {
  Default:    [0, 0, 0, 0, 0, 0, 0, 0],
  '80s':      [4, 3, 0,-2, 2, 4, 5, 3],
  'Bass Boost':[8, 7, 4, 1,-1,-2,-2,-3],
  Lofi:       [2, 1,-2,-3, 1,-1,-4,-5],
  Hacker:     [6, 2,-4, 1,-2, 3, 6, 8],
};

function fmt(ms) {
  if (!ms && ms !== 0) return '0:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

const INIT = {
  user: null,
  currentTrack: null,
  isPlaying: false,
  positionMs: 0,
  durationMs: 0,
  deviceId: null,       // our SDK device
  isPremium: false,
  playlists: [],
  activePlaylistId: null,
  queue: [],
  liked: false,
  shuffle: false,
  repeat: false,
  volume: 70,
  eqPreset: 'Default',
  eqBands: EQ_PRESETS.Default,
  systemLogs: [
    '[21:40:11] Initializing RetroPlayer...',
    '[21:40:11] Connecting to Spotify...',
  ],
  consoleLogs: [
    '> WAITING FOR CONNECTION...',
  ],
};

function ts() {
  const d = new Date();
  return `[${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}]`;
}
function addLog(arr, msg, max = 8) {
  const next = [...arr, msg];
  return next.length > max ? next.slice(-max) : next;
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, isPremium: action.user?.isPremium || false };
    case 'SET_DEVICE':
      return { ...state, deviceId: action.deviceId };
    case 'SET_PLAYLISTS':
      return { ...state, playlists: action.playlists };
    case 'SET_QUEUE':
      return { ...state, queue: action.queue };
    case 'SET_ACTIVE_PLAYLIST':
      return { ...state, activePlaylistId: action.id };
    case 'PLAYER_STATE': {
      const t = action.state?.track_window?.current_track;
      return {
        ...state,
        isPlaying:   !action.state.paused,
        positionMs:  action.state.position,
        durationMs:  action.state.duration,
        currentTrack: t ? {
          id: t.id,
          name: t.name,
          artists: t.artists.map(a => a.name).join(', '),
          album: t.album.name,
          albumImg: t.album.images[0]?.url,
          durationMs: t.duration_ms,
        } : state.currentTrack,
        systemLogs: addLog(state.systemLogs,
          `${ts()} NOW PLAYING: ${t?.name?.toUpperCase() || '?'}`),
        consoleLogs: [
          '> SPOTIFY CONNECTED',
          `> TRACK: ${(t?.name || '').toUpperCase()}`,
          `> ARTIST: ${(t?.artists?.[0]?.name || '').toUpperCase()}`,
          `> STATUS: ${action.state.paused ? 'PAUSED' : 'PLAYING'}`,
        ],
      };
    }
    case 'TOGGLE_LIKE':
      return { ...state, liked: !state.liked };
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffle: !state.shuffle, systemLogs: addLog(state.systemLogs, `${ts()} SHUFFLE ${!state.shuffle ? 'ON' : 'OFF'}`) };
    case 'TOGGLE_REPEAT':
      return { ...state, repeat: !state.repeat, systemLogs: addLog(state.systemLogs, `${ts()} REPEAT ${!state.repeat ? 'ON' : 'OFF'}`) };
    case 'SET_VOLUME':
      return { ...state, volume: action.volume };
    case 'SET_EQ_PRESET':
      return { ...state, eqPreset: action.preset, eqBands: EQ_PRESETS[action.preset] };
    case 'SET_EQ_BAND': {
      const bands = [...state.eqBands];
      bands[action.index] = action.value;
      return { ...state, eqBands: bands, eqPreset: 'Custom' };
    }
    case 'SYS_LOG':
      return { ...state, systemLogs: addLog(state.systemLogs, `${ts()} ${action.msg}`) };
    default:
      return state;
  }
}

export function PlayerProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INIT);
  const sdkRef = useRef(null); // Spotify.Player instance

  const sysLog = useCallback((msg) => dispatch({ type: 'SYS_LOG', msg }), []);

  const loadPlaylists = useCallback(async () => {
    try {
      const data = await spotifyApi.playlists();
      dispatch({ type: 'SET_PLAYLISTS', playlists: data.items || [] });
      sysLog('FETCHED USER PLAYLISTS');
    } catch (e) { sysLog('ERROR: COULD NOT LOAD PLAYLISTS'); }
  }, [sysLog]);

  const loadPlaylistTracks = useCallback(async (id) => {
    try {
      const data = await spotifyApi.playlistTracks(id);
      dispatch({ type: 'SET_QUEUE', queue: data.items?.map(i => i.track).filter(Boolean) || [] });
      dispatch({ type: 'SET_ACTIVE_PLAYLIST', id });
    } catch (e) { sysLog('ERROR: COULD NOT LOAD TRACKS'); }
  }, [sysLog]);

  const playTrack = useCallback(async (uri, contextUri) => {
    try {
      await playerApi.play(contextUri
        ? { context_uri: contextUri, offset: { uri } }
        : { uris: [uri] }
      );
    } catch (e) { sysLog('PLAY FAILED: ' + e.message); }
  }, [sysLog]);

  const togglePlay = useCallback(() => sdkRef.current?.togglePlay(), []);
  const next       = useCallback(() => sdkRef.current?.nextTrack(), []);
  const previous   = useCallback(() => sdkRef.current?.previousTrack(), []);
  const seek       = useCallback((ms) => sdkRef.current?.seek(ms), []);
  const setVolume  = useCallback((v) => {
    sdkRef.current?.setVolume(v / 100);
    dispatch({ type: 'SET_VOLUME', volume: v });
    playerApi.volume(v).catch(() => {});
  }, []);

  return (
    <Ctx.Provider value={{ state, dispatch, sdkRef, sysLog, loadPlaylists, loadPlaylistTracks, playTrack, togglePlay, next, previous, seek, setVolume, EQ_PRESETS }}>
      {children}
    </Ctx.Provider>
  );
}

export const usePlayer = () => useContext(Ctx);
export { EQ_PRESETS };
