import { useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { auth, player as playerApi } from '../services/api.js';

export function useSpotifySDK() {
  const { state, dispatch, sdkRef, sysLog } = usePlayer();

  useEffect(() => {
    if (!state.user) return;

    // The SDK calls this when it's ready (set in index.html script load).
    window.onSpotifyWebPlaybackSDKReady = async () => {
      sysLog('SPOTIFY SDK READY');

      const { access_token } = await auth.token();

      const player = new window.Spotify.Player({
        name: 'RetroPlayer // RETRO_HACKER',
        getOAuthToken: async (cb) => {
          try {
            const { access_token: tok } = await auth.token();
            cb(tok);
          } catch (e) {
            sysLog('TOKEN REFRESH FAILED');
          }
        },
        volume: state.volume / 100,
      });

      // ── listeners ──────────────────────────────────────────────────────────
      player.addListener('ready', async ({ device_id }) => {
        sysLog(`SDK DEVICE ONLINE: ${device_id.slice(0, 8)}...`);
        dispatch({ type: 'SET_DEVICE', deviceId: device_id });
        // Transfer playback to this browser tab.
        try {
          await playerApi.transfer(device_id, false);
          sysLog('PLAYBACK TRANSFERRED TO BROWSER');
        } catch (e) {
          sysLog('TRANSFER FAILED: ' + e.message);
        }
      });

      player.addListener('not_ready', ({ device_id }) => {
        sysLog(`SDK DEVICE OFFLINE: ${device_id.slice(0, 8)}...`);
      });

      player.addListener('player_state_changed', (playerState) => {
        if (!playerState) return;
        dispatch({ type: 'PLAYER_STATE', state: playerState });
      });

      player.addListener('initialization_error', ({ message }) => sysLog('SDK INIT ERROR: ' + message));
      player.addListener('authentication_error', ({ message }) => sysLog('SDK AUTH ERROR: ' + message));
      player.addListener('account_error', ({ message }) => {
        sysLog('PREMIUM REQUIRED: ' + message);
      });

      await player.connect();
      sdkRef.current = player;
      sysLog('SDK CONNECTED');
    };

    // If SDK script was already loaded before the hook ran, fire immediately.
    if (window.Spotify) {
      window.onSpotifyWebPlaybackSDKReady();
    }

    return () => {
      if (sdkRef.current) {
        sdkRef.current.disconnect();
        sdkRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user]);
}
