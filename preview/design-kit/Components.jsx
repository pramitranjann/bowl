/* global React, FruitIcon */
const { useState } = React;

// ======================================================================
// Scene — proper tropical vista.
//
// Layered back→front:
//   1. Sky gradient (warm, time-of-day)
//   2. Sun (round, with halo, pulses)
//   3. Distant clouds (real fluffy stratocumulus, drifting)
//   4. Far ocean horizon strip + ocean body (with shimmer lines)
//   5. Distant island silhouette
//   6. Mid palms (parallax sway)
//   7. Beach foreground (sand gradient + foam line)
//   8. Foreground palm fronds peeking from edges
//   9. A couple of seagulls drifting across
//  10. Vignette + paper grain
// ======================================================================
const SCENE_PALETTES = {
  noon: {
    skyTop: '#7ec5d8', skyMid: '#cfe2c2', skyHaze: '#f2e2a0',
    sun: '#fff1c2', halo: 'rgba(255, 240, 168, 0.5)',
    oceanFar: '#3e84a0', oceanNear: '#27556a',
    foam: '#f7efd4', sand: '#e8c98a', sandShade: '#a87a3a',
    island: '#3e6638', palm: '#1d3a26', cloud: '#fff7e8',
    vignette: 'rgba(0,0,0,0.16)',
  },
  goldenHour: {
    skyTop: '#f6c27a', skyMid: '#e89a55', skyHaze: '#b16a3a',
    sun: '#ffe2a6', halo: 'rgba(255, 198, 134, 0.55)',
    oceanFar: '#9c5a44', oceanNear: '#5a2f24',
    foam: '#fff1d1', sand: '#d8a062', sandShade: '#7a4a2a',
    island: '#3a2a22', palm: '#1b1108', cloud: '#ffe6c4',
    vignette: 'rgba(0,0,0,0.20)',
  },
  dusk: {
    skyTop: '#d59166', skyMid: '#8a5a52', skyHaze: '#3e3144',
    sun: '#f6c08c', halo: 'rgba(255, 178, 130, 0.4)',
    oceanFar: '#3e2a3a', oceanNear: '#16101a',
    foam: '#e6c8a8', sand: '#7a5a48', sandShade: '#3a2818',
    island: '#1b1018', palm: '#06030a', cloud: '#c39e98',
    vignette: 'rgba(0,0,0,0.32)',
  },
};

function Scene({ children, time = 'goldenHour', animate = true }) {
  const p = SCENE_PALETTES[time] || SCENE_PALETTES.goldenHour;
  const ap = animate ? 'running' : 'paused';

  // Horizon at 58% from top. Beach starts at 78%.
  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: `linear-gradient(180deg, ${p.skyTop} 0%, ${p.skyMid} 35%, ${p.skyHaze} 56%, ${p.oceanFar} 58%, ${p.oceanNear} 76%, ${p.sand} 80%, ${p.sandShade} 100%)`,
    }}>
      {/* SUN — round disc with halo */}
      <div style={{
        position: 'absolute', left: '64%', top: '24%', width: 260, height: 260,
        transform: 'translate(-50%,-50%)',
        background: `radial-gradient(circle, ${p.halo} 0%, rgba(0,0,0,0) 60%)`,
        animation: 'sun-pulse 7s ease-in-out infinite', animationPlayState: ap,
        pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', left: '64%', top: '24%', width: 110, height: 110,
        transform: 'translate(-50%,-50%)',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${p.sun} 0%, ${p.sun} 50%, rgba(255,255,255,0) 80%)`,
        boxShadow: `0 0 90px ${p.sun}, 0 0 40px ${p.sun}`,
        pointerEvents: 'none',
      }}/>

      {/* CLOUDS — fluffy, multi-bump silhouettes */}
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"
           style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g fill={p.cloud} opacity="0.92">
          {/* drift slow */}
          <g style={{ animation: 'cloud-drift-a 60s linear infinite', animationPlayState: ap }}>
            <Cloud x={120} y={140} scale={1}/>
            <Cloud x={680} y={90}  scale={0.78}/>
            <Cloud x={1180} y={170} scale={0.92}/>
          </g>
          <g style={{ animation: 'cloud-drift-b 80s linear infinite', animationPlayState: ap }}>
            <Cloud x={360} y={220} scale={0.6} opacity={0.7}/>
            <Cloud x={920} y={250} scale={0.66} opacity={0.7}/>
            <Cloud x={1420} y={210} scale={0.5} opacity={0.65}/>
          </g>
        </g>

        {/* OCEAN shimmer lines */}
        <g stroke={p.foam} strokeWidth="1.5" opacity="0.5" fill="none" strokeLinecap="round">
          <path d="M40 540 L 240 540"/>
          <path d="M400 552 L 600 552"/>
          <path d="M820 548 L 1020 548"/>
          <path d="M1180 558 L 1360 558"/>
          <path d="M180 588 L 380 588"/>
          <path d="M540 596 L 740 596"/>
          <path d="M960 590 L 1140 590"/>
          <path d="M1240 600 L 1440 600"/>
          <path d="M80 632 L 280 632"/>
          <path d="M460 640 L 660 640"/>
          <path d="M880 638 L 1080 638"/>
        </g>

        {/* DISTANT ISLAND — silhouette behind ocean */}
        <g opacity="0.86">
          <path d={`M 980 ${900*0.58} C 1040 ${900*0.55}, 1100 ${900*0.535}, 1160 ${900*0.55} C 1220 ${900*0.565}, 1280 ${900*0.58}, 1300 ${900*0.585} L 1300 ${900*0.6} L 980 ${900*0.6} Z`}
                fill={p.island}/>
          {/* tiny palms on island */}
          <g stroke={p.palm} strokeWidth="2" fill="none" strokeLinecap="round">
            <path d="M1080 510 C 1080 500, 1080 494, 1080 488"/>
            <path d="M1080 488 C 1072 484, 1064 484, 1060 486"/>
            <path d="M1080 488 C 1088 484, 1096 484, 1100 486"/>
            <path d="M1180 506 C 1180 496, 1180 490, 1180 484"/>
            <path d="M1180 484 C 1172 480, 1164 480, 1160 482"/>
            <path d="M1180 484 C 1188 480, 1196 480, 1200 482"/>
          </g>
        </g>

        {/* BEACH — wet-sand foam line where ocean meets sand */}
        <path d={`M 0 ${900*0.79} C 200 ${900*0.785}, 480 ${900*0.795}, 760 ${900*0.785} C 1040 ${900*0.792}, 1320 ${900*0.78}, 1600 ${900*0.79} L 1600 ${900*0.81} C 1320 ${900*0.815}, 1040 ${900*0.802}, 760 ${900*0.812} C 480 ${900*0.808}, 200 ${900*0.815}, 0 ${900*0.815} Z`}
              fill={p.foam} opacity="0.78"/>
        {/* Foam edge ink */}
        <path d={`M 0 ${900*0.79} C 200 ${900*0.785}, 480 ${900*0.795}, 760 ${900*0.785} C 1040 ${900*0.792}, 1320 ${900*0.78}, 1600 ${900*0.79}`}
              fill="none" stroke="#4c3125" strokeWidth="2" opacity="0.32" strokeLinecap="round"/>

        {/* SAND TEXTURE — subtle dots */}
        <g fill="#4c3125" opacity="0.18">
          <circle cx="120" cy="780" r="1.2"/><circle cx="220" cy="816" r="1.2"/>
          <circle cx="360" cy="800" r="1.2"/><circle cx="500" cy="836" r="1.2"/>
          <circle cx="640" cy="816" r="1.2"/><circle cx="780" cy="848" r="1.2"/>
          <circle cx="900" cy="824" r="1.2"/><circle cx="1040" cy="852" r="1.2"/>
          <circle cx="1180" cy="828" r="1.2"/><circle cx="1320" cy="860" r="1.2"/>
          <circle cx="1440" cy="836" r="1.2"/>
          <circle cx="160" cy="850" r="1.2"/><circle cx="320" cy="868" r="1.2"/>
          <circle cx="540" cy="876" r="1.2"/><circle cx="720" cy="880" r="1.2"/>
          <circle cx="980" cy="884" r="1.2"/><circle cx="1240" cy="876" r="1.2"/>
        </g>

        {/* MID PALMS — foreground silhouettes, sway as group */}
        <g style={{ animation: 'palm-sway 9s ease-in-out infinite', animationPlayState: ap, transformOrigin: '50% 100%' }}>
          {/* left palm — taller */}
          <Palm x={140} baseY={760} height={420} bend={-1} fill={p.palm}/>
          {/* right palm — shorter, leaning in */}
          <Palm x={1460} baseY={770} height={380} bend={1.5} fill={p.palm}/>
        </g>

        {/* SEAGULLS — drift in distant sky band, well above HUD */}
        <g style={{ animation: 'gull-drift 32s linear infinite', animationPlayState: ap }} opacity="0.55">
          <Gull x={200} y={90} scale={0.7} fill={p.palm}/>
          <Gull x={280} y={120} scale={0.55} fill={p.palm}/>
        </g>
      </svg>

      {/* foreground palm frond peeking top-left */}
      <svg viewBox="0 0 600 400" preserveAspectRatio="xMinYMin slice"
           style={{ position: 'absolute', top: -20, left: -40, width: 360, height: 240, pointerEvents: 'none', opacity: 0.9 }}>
        <g fill={p.palm} stroke="#1a0e08" strokeWidth="3" strokeLinejoin="round">
          <path d="M-20 -20 C 80 20, 180 60, 240 130 C 200 120, 140 110, 80 100 C 40 80, 0 50, -20 -20 Z"/>
          <path d="M-20 -20 C 100 -10, 220 30, 280 80 C 220 90, 140 70, 60 50 C 20 30, -10 0, -20 -20 Z" opacity="0.86"/>
        </g>
      </svg>

      {/* VIGNETTE for UI legibility */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 50%, transparent 50%, ${p.vignette} 100%)`,
      }}/>

      {/* Paper grain */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        opacity: 0.08, mixBlendMode: 'overlay',
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23g)'/%3E%3C/svg%3E\")",
        backgroundSize: '200px 200px',
      }}/>

      {children}
    </div>
  );
}

// Cloud — multi-bump fluffy silhouette
function Cloud({ x, y, scale = 1, opacity = 0.94 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <ellipse cx="0" cy="0" rx="60" ry="22"/>
      <ellipse cx="-50" cy="6" rx="38" ry="18"/>
      <ellipse cx="40" cy="-4" rx="42" ry="22"/>
      <ellipse cx="-20" cy="-14" rx="34" ry="18"/>
      <ellipse cx="20" cy="-18" rx="30" ry="16"/>
      <ellipse cx="70" cy="8" rx="28" ry="14"/>
      <ellipse cx="-78" cy="2" rx="22" ry="12"/>
    </g>
  );
}

// Palm — trunk + 6 fronds
function Palm({ x, baseY, height, bend, fill }) {
  const top = baseY - height;
  const cpx = x + bend * 30;
  const cpy = baseY - height * 0.5;
  return (
    <g>
      {/* trunk */}
      <path d={`M ${x-10} ${baseY} Q ${cpx-6} ${cpy} ${x + bend*40 - 6} ${top}`} fill="none" stroke={fill} strokeWidth="14" strokeLinecap="round"/>
      <path d={`M ${x+10} ${baseY} Q ${cpx+6} ${cpy} ${x + bend*40 + 6} ${top}`} fill="none" stroke={fill} strokeWidth="14" strokeLinecap="round"/>
      {/* coconuts */}
      <circle cx={x + bend*40 - 8} cy={top + 8} r="6" fill={fill}/>
      <circle cx={x + bend*40 + 12} cy={top + 14} r="6" fill={fill}/>
      <circle cx={x + bend*40 + 2} cy={top + 22} r="6" fill={fill}/>
      {/* fronds — 6 splayed leaves */}
      <g fill={fill} stroke="#1a0e08" strokeWidth="2" strokeLinejoin="round">
        <Frond cx={x + bend*40} cy={top} dx={-160} dy={-30}/>
        <Frond cx={x + bend*40} cy={top} dx={160} dy={-30}/>
        <Frond cx={x + bend*40} cy={top} dx={-130} dy={60}/>
        <Frond cx={x + bend*40} cy={top} dx={130} dy={60}/>
        <Frond cx={x + bend*40} cy={top} dx={-30} dy={-80}/>
        <Frond cx={x + bend*40} cy={top} dx={30} dy={-80}/>
      </g>
    </g>
  );
}

function Frond({ cx, cy, dx, dy }) {
  const tx = cx + dx, ty = cy + dy;
  const mx = cx + dx * 0.5, my = cy + dy * 0.5;
  const perp = dx > 0 ? 1 : -1;
  return (
    <path d={`M ${cx} ${cy} Q ${mx + Math.abs(dy)*0.2*perp} ${my - 16} ${tx} ${ty} Q ${mx - Math.abs(dy)*0.1*perp} ${my + 14} ${cx} ${cy} Z`}/>
  );
}

function Gull({ x, y, scale, fill }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={fill} strokeWidth="3" strokeLinecap="round">
      <path d="M-22 0 Q -12 -10 0 0 Q 12 -10 22 0"/>
    </g>
  );
}

// ============================ BrandMark ============================
function BrandMark({ size = 44, onClick }) {
  return (
    <button onClick={onClick} className="bowl-wm" style={{
      position: 'relative', minWidth: 132, minHeight: 66,
      padding: '10px 22px 12px', border: 0, background: 'transparent',
      cursor: 'pointer', isolation: 'isolate',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-display)', fontSize: size, lineHeight: 1,
      color: 'var(--color-coconut-brown)',
      animation: 'bowl-breathe 5s ease-in-out infinite',
    }}>
      <span style={{
        position: 'absolute', inset: 0, zIndex: -1,
        backgroundImage: 'url(../../assets/ui/shapes/small-cream-blob.svg)',
        backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
        filter: 'drop-shadow(0 10px 22px rgba(42,31,24,0.16))',
      }} />
      bowl
    </button>
  );
}

// ============================ IconButton ============================
function IconButton({ icon, label, muted, onClick, style }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick} aria-label={label}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', width: 80, height: 68, padding: 0, border: 0,
        background: 'transparent', cursor: 'pointer', isolation: 'isolate',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transform: hover ? 'translateY(-2px) scale(1.03) rotate(1.5deg)' : 'none',
        filter: hover ? 'brightness(1.06)' : 'none',
        transition: 'transform 220ms cubic-bezier(0.2,0,0,1), filter 180ms',
        ...style,
      }}>
      <span style={{
        position: 'absolute', inset: 0, zIndex: -1,
        backgroundImage: 'url(../../assets/ui/shapes/icon-cream-blob.svg)',
        backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
        filter: 'drop-shadow(0 10px 20px rgba(42,31,24,0.14))',
      }} />
      <img src={`../../assets/ui/icons/${icon}`} alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} />
      {muted && <span style={{
        position: 'absolute', width: 36, height: 2, background: 'var(--color-hibiscus)',
        transform: 'rotate(-32deg)', borderRadius: 999,
      }} />}
    </button>
  );
}

// ============================ BlobButton ============================
function BlobButton({ children, onClick, primary, style }) {
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  let transform = 'none';
  if (press) transform = 'scale(0.96)';
  else if (hover) transform = 'translateY(-2px) scale(1.03) rotate(1.5deg)';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      style={{
        position: 'relative', width: 240, height: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '14px 24px 20px',
        background: 'transparent',
        backgroundImage: 'url(../../assets/ui/shapes/large-green-blob.svg)',
        backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
        border: 0, cursor: 'pointer',
        fontFamily: 'var(--font-display)',
        fontSize: 44, lineHeight: 0.94,
        color: 'var(--color-coconut-brown)',
        filter: `drop-shadow(0 18px 30px rgba(42,31,24,0.16))${primary ? ' saturate(1.12) brightness(1.03)' : ''}${hover ? ' brightness(1.06)' : ''}`,
        transform, transition: 'transform 220ms cubic-bezier(0.2,0,0,1), filter 180ms',
        ...style,
      }}>
      {children}
    </button>
  );
}

// ============================ HUD — Spread (locked direction) ============================
//
// Composition principles:
//   • Score is the largest, alone, top-left — the thing the eye lands on first.
//   • Center cluster (Mode · Time) is one tray, smaller, secondary.
//   • Durian lives, top-right, dark-blob, glowing dots — danger meter, mirrors Score in weight.
//   • All chips share a tilt-sway breathe so the HUD feels handwritten, not pinned.

function HudScoreChip({ value }) {
  return (
    <div style={{
      position: 'relative', width: 168, height: 124,
      display: 'grid', placeItems: 'center', padding: '14px 16px',
      backgroundImage: 'url(../../assets/ui/shapes/score-blob-green.svg)',
      backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(0 16px 28px rgba(42,31,24,0.22))',
      transform: 'rotate(-2deg)',
    }}>
      <div style={{ display: 'grid', gap: 0, justifyItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 0.9,
          color: 'rgba(58,39,28,0.7)',
        }}>score</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 64, lineHeight: 0.84,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--color-ink-deep)',
        }}>{value}</span>
      </div>
    </div>
  );
}

function HudCenterTray({ time, mode }) {
  return (
    <div style={{
      position: 'relative', minWidth: 380, minHeight: 110,
      padding: '34px 64px 38px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22,
      backgroundImage: 'url(../../assets/ui/shapes/cream-card-blob.svg)',
      backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(0 14px 24px rgba(42,31,24,0.18))',
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'rgba(58,39,28,0.7)' }}>mode</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 34, lineHeight: 0.84,
          color: 'var(--color-coconut-brown)',
        }}>{mode}</span>
      </div>
      <span style={{ width: 1, height: 32, background: 'rgba(76,49,37,0.22)' }}/>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: 'rgba(58,39,28,0.7)' }}>time</span>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 36, lineHeight: 0.84,
          fontVariantNumeric: 'tabular-nums',
          color: 'var(--color-coconut-brown)',
        }}>{time}</span>
      </div>
    </div>
  );
}

function HudDurianChip({ lives = 3, lost = 0 }) {
  return (
    <div style={{
      position: 'relative', width: 168, height: 124,
      display: 'grid', placeItems: 'center', padding: '14px 16px',
      backgroundImage: 'url(../../assets/ui/shapes/score-blob-dark.svg)',
      backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
      filter: 'drop-shadow(0 16px 28px rgba(42,31,24,0.32))',
      transform: 'rotate(2deg)',
    }}>
      <div style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 0.9,
          color: 'rgba(244,235,217,0.78)',
        }}>durian</span>
        <span style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} style={{
              width: 18, height: 18, borderRadius: '50%',
              background: i < lost ? 'rgba(244,235,217,0.16)' : 'var(--color-durian-glow)',
              boxShadow: i < lost ? 'none' : '0 0 12px rgba(215,223,104,0.6)',
              border: i < lost ? '1.5px dashed rgba(244,235,217,0.32)' : 'none',
              transition: 'all 280ms',
            }}/>
          ))}
        </span>
      </div>
    </div>
  );
}

function HudSpread({ score, time, mode, lives, lost }) {
  return (
    <div style={{
      position: 'absolute', top: 110, left: 0, right: 0, zIndex: 4,
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '0 36px', gap: 20, pointerEvents: 'none',
    }}>
      <HudScoreChip value={score}/>
      <div style={{ marginTop: 14 }}>
        <HudCenterTray time={time} mode={mode}/>
      </div>
      <HudDurianChip lives={lives} lost={lost}/>
    </div>
  );
}

// ============================ Fruit (in-flight) ============================
function Fruit({ kind, x, y, size = 64, rot = 0, sliced, illustrated }) {
  const colors = {
    watermelon: '#e63946', pineapple: '#f4c430', mango: '#ffa94d',
    dragonfruit: '#d81b7a', mangosteen: '#6a4c93', rambutan: '#c1121f',
    lychee: '#fecaca', durian: '#c5c533',
  };
  if (illustrated && typeof FruitIcon === 'function') {
    return (
      <div style={{
        position: 'absolute', left: x, top: y,
        width: size, height: size,
        transform: `translate(-50%,-50%) rotate(${rot}deg)`,
        transition: 'transform 320ms cubic-bezier(0.2,0,0,1)',
      }}>
        <FruitIcon kind={kind} size={size} sliced={sliced}/>
      </div>
    );
  }
  return (
    <div style={{
      position: 'absolute', left: x, top: y,
      width: size, height: size, borderRadius: '50%',
      background: colors[kind] || '#999',
      boxShadow: `0 8px 20px rgba(42,31,24,0.22), inset 0 4px 10px rgba(255,255,255,0.18), inset 0 -8px 14px rgba(0,0,0,0.12)`,
      transform: `translate(-50%,-50%) rotate(${rot}deg)${sliced ? ' scale(0.92)' : ''}`,
      transition: 'transform 320ms cubic-bezier(0.2,0,0,1)',
    }} />
  );
}

// ============================ Coconut Bowl SVG ============================
function CoconutBowl({ size = 360, children }) {
  return (
    <div style={{ position: 'relative', width: size, height: size * 0.78, margin: '0 auto' }}>
      <div style={{
        position: 'absolute', left: '14%', right: '14%', bottom: -size * 0.04,
        height: size * 0.1, borderRadius: '50%',
        background: 'radial-gradient(ellipse at center, rgba(20,12,8,0.42), rgba(20,12,8,0) 70%)',
        filter: 'blur(2px)',
      }} />
      <svg viewBox="0 0 560 420" width={size} height={size * 0.75}
           style={{ position: 'absolute', inset: 0, filter: 'drop-shadow(0 28px 40px rgba(0,0,0,0.42))' }}>
        <defs>
          <linearGradient id="bowlShell" x1="18%" y1="10%" x2="82%" y2="90%">
            <stop offset="0%" stopColor="#a87151"/>
            <stop offset="52%" stopColor="#7e5236"/>
            <stop offset="100%" stopColor="#4d2e1c"/>
          </linearGradient>
          <linearGradient id="bowlInner" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#5a3220"/>
            <stop offset="100%" stopColor="#28150c"/>
          </linearGradient>
          <linearGradient id="bowlRim" x1="0%" y1="25%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="#fff4e1"/>
            <stop offset="55%" stopColor="#f3dec0"/>
            <stop offset="100%" stopColor="#d8ba91"/>
          </linearGradient>
        </defs>
        <path d="M88 168 C 110 280, 188 350, 280 350 C 372 350, 450 280, 472 168 C 416 196, 348 210, 280 210 C 212 210, 144 196, 88 168 Z"
              fill="url(#bowlShell)" stroke="#3b1f10" strokeWidth="8" strokeLinejoin="round"/>
        <path d="M124 174 C 152 244, 218 286, 280 286 C 342 286, 408 244, 436 174 C 392 192, 336 202, 280 202 C 224 202, 168 192, 124 174 Z"
              fill="url(#bowlInner)"/>
        <path d="M104 168 C 144 138, 208 122, 280 122 C 352 122, 416 138, 456 168 C 416 192, 354 206, 280 206 C 206 206, 144 192, 104 168 Z"
              fill="url(#bowlRim)" stroke="#724a2c" strokeWidth="6" strokeLinejoin="round"/>
        <path d="M152 162 C 196 150, 244 144, 280 144 C 316 144, 360 150, 408 162"
              fill="none" stroke="rgba(255,255,255,0.46)" strokeWidth="4" strokeLinecap="round"/>
        <g stroke="#3b1f10" strokeWidth="2.4" fill="none" opacity="0.42" strokeLinecap="round">
          <path d="M120 220 C 160 254, 220 280, 280 282"/>
          <path d="M160 240 C 200 268, 248 286, 290 290"/>
          <path d="M380 232 C 350 258, 308 280, 274 286"/>
          <path d="M410 252 C 380 274, 340 288, 304 292"/>
        </g>
      </svg>
      <div style={{
        position: 'absolute', left: '17%', top: '14%', width: '66%', height: '42%',
        overflow: 'visible', pointerEvents: 'none',
      }}>
        {children}
      </div>
    </div>
  );
}

// ============================ BowlReveal — locked to shell ============================
function BowlReveal({ fruits = [], size = 420 }) {
  return (
    <CoconutBowl size={size}>
      {fruits.map((f, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${f.x}%`, top: `${f.y}%`,
          transform: `translate(-50%,-50%) rotate(${f.rot || 0}deg)`,
          opacity: 0, animation: `bowl-fade-in 420ms cubic-bezier(0.2,0,0,1) ${i * 70}ms both`,
        }}>
          <FruitIcon kind={f.kind} size={f.size}/>
        </div>
      ))}
    </CoconutBowl>
  );
}

// ============================ Share Sheet — refined cream card ============================
//
// Refinements vs prior:
//   • Composition: stamp ("from a bowl"), title, dotted divider, bowl in inset frame, score chip, actions
//   • Stamp top-right, faux postage feel
//   • Bowl sits inside a cream rectangular insets card with rounded paper edges
//   • Score is a separate small dark-blob badge to the side, not stacked under bowl
//   • Subtle leaf doodles in corners
//   • Type sized down a bit; tagline italic-feel (Reenie Beanie already script)

function ShareCard({ score, fruits, onClose, onAgain }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 6, display: 'grid', placeItems: 'center' }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle at 50% 34%, rgba(42,31,24,0.42), rgba(42,31,24,0.66))',
        animation: 'bowl-fade-in 220ms ease both',
      }} onClick={onClose}/>

      <div style={{
        position: 'relative', width: 520, padding: '34px 38px 32px',
        backgroundImage: 'url(../../assets/ui/shapes/cream-card-blob.svg)',
        backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
        filter: 'drop-shadow(0 30px 56px rgba(0,0,0,0.42))',
        animation: 'bowl-enter 360ms cubic-bezier(0.2,0,0,1) 80ms both',
        display: 'grid', gap: 14,
      }}>
        {/* Stamp / postmark — top right */}
        <div style={{
          position: 'absolute', top: 22, right: 36, width: 96, height: 96,
          border: '2.5px dashed rgba(76,49,37,0.62)',
          borderRadius: 6,
          padding: 6,
          display: 'grid', placeItems: 'center',
          transform: 'rotate(8deg)',
          fontFamily: 'var(--font-display)',
          color: 'rgba(76,49,37,0.7)',
          textAlign: 'center', fontSize: 14, lineHeight: 1.0,
        }}>
          <div>
            <div style={{ fontSize: 18, marginBottom: 2 }}>from a</div>
            <div style={{ fontSize: 28, lineHeight: 0.84 }}>BOWL</div>
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>· est ·</div>
          </div>
        </div>

        {/* close */}
        <button onClick={onClose} aria-label="close" style={{
          position: 'absolute', top: -6, left: -6, width: 44, height: 44,
          border: 0, background: 'rgba(244,235,217,0.92)', borderRadius: '50%', cursor: 'pointer',
          boxShadow: '0 6px 14px rgba(0,0,0,0.22)',
          display: 'grid', placeItems: 'center',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--color-coconut-brown)',
            lineHeight: 1, transform: 'translateY(-1px)',
          }}>×</span>
        </button>

        {/* Title */}
        <div style={{ marginRight: 110 }}>
          <h2 style={{
            margin: 0, fontFamily: 'var(--font-display)', fontWeight: 400,
            fontSize: 56, lineHeight: 0.86,
            color: 'var(--color-coconut-brown)',
          }}>what a bowl!</h2>
          <p style={{
            margin: '6px 0 0', fontFamily: 'var(--font-display)', fontSize: 22, lineHeight: 1.0,
            color: 'rgba(96,70,53,0.78)', maxWidth: '20ch',
          }}>a bowl of fruits should never be eaten alone</p>
        </div>

        {/* dotted divider */}
        <div style={{
          height: 1, marginTop: 4,
          backgroundImage: 'radial-gradient(circle, rgba(76,49,37,0.55) 1px, transparent 1.4px)',
          backgroundSize: '12px 2px', backgroundRepeat: 'repeat-x',
        }}/>

        {/* Bowl + score — paired */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 18, marginTop: 4 }}>
          {/* score badge */}
          <div style={{
            position: 'relative', width: 132, height: 132,
            backgroundImage: 'url(../../assets/ui/shapes/score-blob-dark.svg)',
            backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat',
            display: 'grid', placeItems: 'center', flexShrink: 0,
            filter: 'drop-shadow(0 12px 22px rgba(42,31,24,0.34))',
            transform: 'rotate(-4deg)',
          }}>
            <div style={{ display: 'grid', gap: 0, justifyItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, color: 'rgba(244,235,217,0.78)' }}>score</span>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 56, lineHeight: 0.84,
                color: 'var(--color-durian-glow)', fontVariantNumeric: 'tabular-nums',
              }}>{score}</span>
            </div>
          </div>

          {/* bowl */}
          <div style={{ flex: 1, display: 'grid', placeItems: 'center' }}>
            <CoconutBowl size={240}>
              {fruits.slice(0, 6).map((f, i) => (
                <div key={i} style={{
                  position: 'absolute', left: `${f.x}%`, top: `${f.y}%`,
                  transform: `translate(-50%,-50%) rotate(${f.rot || 0}deg)`,
                }}>
                  <FruitIcon kind={f.kind} size={Math.round(f.size * 0.7)}/>
                </div>
              ))}
            </CoconutBowl>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', marginTop: 6 }}>
          <BlobButton style={{ width: 180, height: 96, fontSize: 36 }} onClick={onAgain}>Again</BlobButton>
          <BlobButton primary style={{ width: 180, height: 96, fontSize: 36 }}>Share</BlobButton>
        </div>

        {/* corner doodles */}
        <svg style={{ position: 'absolute', bottom: 18, left: 22, width: 38, height: 38, pointerEvents: 'none', opacity: 0.55 }}
             viewBox="0 0 40 40" fill="none" stroke="#4c3125" strokeWidth="2.4" strokeLinecap="round">
          <path d="M6 30 C 14 26, 22 24, 32 24"/>
          <path d="M16 26 C 18 22, 22 20, 26 20"/>
        </svg>
      </div>
    </div>
  );
}

function ShareSheet(props) {
  return <ShareCard {...props}/>;
}

// Expose globals
Object.assign(window, {
  Scene, BrandMark, IconButton, BlobButton,
  HudSpread, Fruit, BowlReveal, CoconutBowl, ShareSheet,
});
