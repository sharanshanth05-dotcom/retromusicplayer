import { usePlayer } from '../context/PlayerContext.jsx';

function SkullDeco() {
  return (
    <svg width="68" height="68" viewBox="0 0 40 40" style={{ position: 'absolute', right: 12, top: 8, opacity: 0.45 }}>
      <g fill="var(--green)">
        <path d="M20 4c-8 0-13 6-13 13 0 5 2 8 4 10v6c0 1 1 2 2 2h2v-4h2v4h6v-4h2v4h2c1 0 2-1 2-2v-6c2-2 4-5 4-10C33 10 28 4 20 4z"/>
      </g>
      <g fill="#0a0a0c">
        <ellipse cx="14.5" cy="18" rx="3.2" ry="4"/>
        <ellipse cx="25.5" cy="18" rx="3.2" ry="4"/>
        <polygon points="20,21 18.3,25 21.7,25"/>
        <rect x="14" y="27" width="3" height="3"/>
        <rect x="18.5" y="27" width="3" height="3"/>
        <rect x="23" y="27" width="3" height="3"/>
      </g>
    </svg>
  );
}

export default function ConsolePanel() {
  const { state } = usePlayer();

  return (
    <div className="panel" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="panel-title"><span className="label">Console</span></div>
      <div className="term">
        {state.consoleLogs.join('\n')}
        <span className="cursor" />
      </div>
      <SkullDeco />
    </div>
  );
}
