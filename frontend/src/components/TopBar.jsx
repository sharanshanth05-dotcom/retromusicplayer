import { usePlayer } from '../context/PlayerContext.jsx';

function SkullSVG({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40">
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

export default function TopBar() {
  const { state } = usePlayer();
  const name = state.user?.displayName || state.user?.id || 'SHARAN';

  return (
    <div className="topbar">
      {/* Brand */}
      <div className="brand">
        <div className="logo"><span className="r">RETRO</span><span className="p">PLAYER</span><i className="fa-solid fa-wave-square" /></div>
        <div className="sub">// SYSTEM ONLINE</div>
      </div>

      {/* Console strip */}
      <div className="panel">
        <div className="term">
          {`> ACCESSING SPOTIFY API ... `}<span className="accent">SUCCESS</span>{'\n'}
          {`> AUTHENTICATION ... `}<span className="accent">VERIFIED</span>{'\n'}
          {`> WELCOME BACK, `}<span className="accent">{name.toUpperCase()}</span>
        </div>
      </div>

      {/* Status panel */}
      <div className="panel status-panel">
        <div className="term" style={{ padding: '10px 12px', flex: 1 }}>
          {`> STATUS : `}<span className="val">ONLINE</span>{'\n'}
          {`> USER   : `}<span className="val">{name.toUpperCase()}</span>{'\n'}
          {`> MODE   : `}<span className="val">RETRO_HACKER</span>
        </div>
        <SkullSVG size={34} />
        <div className="more-dots">
          <i className="fa-solid fa-circle" />
          <i className="fa-solid fa-circle" />
          <i className="fa-solid fa-circle" />
        </div>
      </div>
    </div>
  );
}
