/* global React */
const { useState, useReducer } = React;

// ── useTweaks ─────────────────────────────────────────────────
function useTweaks(defaults) {
  const [tweaks, dispatch] = useReducer((state, { key, value }) => ({ ...state, [key]: value }), defaults);
  const setTweak = (key, value) => dispatch({ key, value });
  return [tweaks, setTweak];
}

// ── TweakSection ──────────────────────────────────────────────
function TweakSection({ title, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'rgba(76,49,37,0.52)', marginBottom: 6, paddingBottom: 4,
        borderBottom: '1px solid rgba(76,49,37,0.12)',
      }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {children}
      </div>
    </div>
  );
}

// ── TweakRadio ────────────────────────────────────────────────
function TweakRadio({ label, value, onChange, options }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 11, color: '#4c3125', flex: '0 0 90px',
      }}>{label}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        {options.map(opt => (
          <button key={opt.value} onClick={() => onChange(opt.value)} style={{
            padding: '3px 9px', border: 0, borderRadius: 999, cursor: 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif', fontSize: 11,
            background: value === opt.value ? '#c5d86d' : 'rgba(76,49,37,0.08)',
            color: value === opt.value ? '#2a1a0e' : '#4c3125',
            fontWeight: value === opt.value ? 600 : 400,
            transition: 'background 160ms',
          }}>{opt.label}</button>
        ))}
      </div>
    </div>
  );
}

// ── TweakToggle ───────────────────────────────────────────────
function TweakToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: 11, color: '#4c3125', flex: '0 0 90px',
      }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        position: 'relative', width: 36, height: 20, border: 0, borderRadius: 999,
        background: value ? '#c5d86d' : 'rgba(76,49,37,0.16)',
        cursor: 'pointer', padding: 0, flexShrink: 0,
        transition: 'background 200ms',
      }}>
        <span style={{
          position: 'absolute', top: 3, left: value ? 18 : 3,
          width: 14, height: 14, borderRadius: '50%',
          background: value ? '#2a4a10' : 'rgba(76,49,37,0.5)',
          transition: 'left 200ms cubic-bezier(0.2,0,0,1)',
        }}/>
      </button>
    </div>
  );
}

// ── TweaksPanel ───────────────────────────────────────────────
function TweaksPanel({ title = 'Tweaks', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      position: 'fixed', bottom: 64, left: 16, zIndex: 1001,
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        padding: '5px 12px', border: 0, borderRadius: 999, cursor: 'pointer',
        background: open ? 'rgba(197,216,109,0.96)' : 'rgba(244,235,217,0.94)',
        color: '#4c3125', fontSize: 11, fontFamily: 'inherit',
        letterSpacing: '0.06em', textTransform: 'uppercase',
        boxShadow: '0 6px 16px rgba(0,0,0,0.22)',
      }}>{title} {open ? '▲' : '▼'}</button>

      {open && (
        <div style={{
          position: 'absolute', bottom: 36, left: 0, minWidth: 260,
          background: 'rgba(244,235,217,0.97)',
          borderRadius: 14, padding: '14px 16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
          border: '1px solid rgba(76,49,37,0.1)',
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle });
