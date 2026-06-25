import { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';

function polar(cx, cy, r, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

function VUFace({ id }) {
  const cx = 100, cy = 108;
  const rOut = 90, rIn = 78, rLabel = 64;
  const values = ['-20','-10','-5','-3','-1','0','+1','+3'];
  const angles = [-58,-41,-24,-7,7,24,41,58];

  const arcS = polar(cx, cy, rOut + 2, -60);
  const arcE = polar(cx, cy, rOut + 2,  60);
  const redS = polar(cx, cy, rOut + 2,  22);
  const redE = polar(cx, cy, rOut + 2,  60);

  const needleEnd = polar(cx, cy, 80, 0);

  return (
    <svg viewBox="0 0 200 120" width="100%">
      <path d={`M ${arcS.x} ${arcS.y} A ${rOut+2} ${rOut+2} 0 0 1 ${arcE.x} ${arcE.y}`}
        stroke="#00000033" strokeWidth="1.5" fill="none"/>
      <path d={`M ${redS.x} ${redS.y} A ${rOut+2} ${rOut+2} 0 0 1 ${redE.x} ${redE.y}`}
        stroke="var(--red)" strokeWidth="3" fill="none"/>
      {angles.map((a, i) => {
        const p1 = polar(cx, cy, rOut,    a);
        const p2 = polar(cx, cy, rIn,     a);
        const lp = polar(cx, cy, rLabel,  a);
        return (
          <g key={i}>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#3a2f1c" strokeWidth="1.5"/>
            <text x={lp.x} y={lp.y} fontSize="9" fill="#3a2f1c" textAnchor="middle" dominantBaseline="middle">{values[i]}</text>
          </g>
        );
      })}
      <text x={cx} y={cy - 28} fontSize="14" fill="#3a2f1c" textAnchor="middle" fontWeight="700" opacity=".5">VU</text>
      <line id={`${id}-needle`} x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y}
        stroke="var(--orange)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="4" fill="#3a2f1c"/>
    </svg>
  );
}

export default function VUMeters() {
  const { state } = usePlayer();
  const timerRef  = useRef(null);

  useEffect(() => {
    function tick() {
      const set = (id, angleDeg) => {
        const el = document.getElementById(id);
        if (!el) return;
        const cx = 100, cy = 108;
        const p  = polar(cx, cy, 80, angleDeg);
        el.setAttribute('x2', p.x);
        el.setAttribute('y2', p.y);
      };
      if (state.isPlaying) {
        set('vuL-needle', -10 + Math.random() * 55);
        set('vuR-needle', -10 + Math.random() * 55);
      } else {
        set('vuL-needle', -55);
        set('vuR-needle', -55);
      }
      timerRef.current = setTimeout(tick, 360);
    }
    tick();
    return () => clearTimeout(timerRef.current);
  }, [state.isPlaying]);

  return (
    <div className="panel">
      <div className="panel-title"><span className="label">VU meters</span></div>
      <div className="vu-row">
        {['L','R'].map(side => (
          <div className="vu-meter" key={side}>
            <div className="vu-face">
              <VUFace id={`vu${side}`} />
            </div>
            <div className="vu-name">{side === 'L' ? 'LEFT' : 'RIGHT'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
