import { usePlayer, EQ_PRESETS } from '../context/PlayerContext.jsx';
import { prefs } from '../services/api.js';

const BANDS = ['60','170','310','600','1K','3K','12K','16K'];

export default function Equalizer() {
  const { state, dispatch } = usePlayer();

  function selectPreset(name) {
    dispatch({ type: 'SET_EQ_PRESET', preset: name });
    prefs.patch({ eqPreset: name, eqBands: EQ_PRESETS[name] }).catch(() => {});
  }

  function setband(i, v) {
    dispatch({ type: 'SET_EQ_BAND', index: i, value: Number(v) });
  }

  return (
    <div className="panel">
      <div className="panel-title">
        <span className="label">Equalizer</span>
        <span className="meta" style={{ color: 'var(--orange)', fontSize: 10, fontWeight: 700 }}>PRESETS</span>
      </div>
      <div className="eq-wrap">
        <div className="eq-scale"><span>+12</span><span>0</span><span>-12</span></div>
        <div className="eq-sliders">
          {BANDS.map((band, i) => (
            <div className="eq-band" key={band}>
              <div className="eq-slider-track">
                <input
                  type="range"
                  className="eq-slider"
                  min="-12" max="12"
                  value={state.eqBands[i]}
                  onChange={e => setband(i, e.target.value)}
                />
              </div>
              <div className="eq-label">{band}</div>
            </div>
          ))}
        </div>
        <div className="presets">
          <div className="pr-title">PRESETS</div>
          {Object.keys(EQ_PRESETS).map(name => (
            <div
              key={name}
              className={`preset-item${state.eqPreset === name ? ' active' : ''}`}
              onClick={() => selectPreset(name)}
            >
              <i className="fa-solid fa-chevron-right" />
              {name.toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
